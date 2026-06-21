import { NextRequest, NextResponse } from "next/server";

import { createServiceRoleClient } from "@/lib/platformAdmin/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type InviteRequest = {
  workspaceId?: string;
  email?: string;
  role?: "Owner" | "Manager" | "Employee";
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) {
    return jsonError("Sign in required.", 401);
  }

  let body: InviteRequest;
  try {
    body = (await request.json()) as InviteRequest;
  } catch {
    return jsonError("Invalid invite request.", 400);
  }

  const workspaceId = body.workspaceId;
  const email = body.email?.trim().toLowerCase();
  const role = body.role || "Employee";

  if (!workspaceId || !email) {
    return jsonError("Workspace and email are required.", 400);
  }

  const serviceClient = createServiceRoleClient();
  const { data: inviter, error: inviterError } = await serviceClient
    .from("workspace_members")
    .select("id, role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .eq("status", "Active")
    .maybeSingle();

  if (inviterError || !inviter) {
    return jsonError("You do not have access to this workspace.", 403);
  }

  if (inviter.role !== "Owner" && inviter.role !== "Manager") {
    return jsonError("Only Owners and Managers can invite members.", 403);
  }

  const inviteToken = crypto.randomUUID();
  const inviteExpiresAt = new Date(
    Date.now() + 14 * 24 * 60 * 60 * 1000
  ).toISOString();

  const { data: existingRows, error: lookupError } = await serviceClient
    .from("workspace_members")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("status", "Invited")
    .eq("invited_email", email)
    .limit(1);

  if (lookupError) {
    return jsonError(lookupError.message, 500);
  }

  const existingInvite = existingRows?.[0] as { id: string } | undefined;
  const query = existingInvite
    ? serviceClient
        .from("workspace_members")
        .update({
          role,
          invite_token: inviteToken,
          invite_expires_at: inviteExpiresAt,
          invited_by: user.id,
        })
        .eq("id", existingInvite.id)
    : serviceClient.from("workspace_members").insert({
        workspace_id: workspaceId,
        invited_email: email,
        invited_by: user.id,
        invite_token: inviteToken,
        invite_expires_at: inviteExpiresAt,
        role,
        status: "Invited",
      });

  const { data, error } = await query
    .select("id, user_id, role, status, invited_email, created_at")
    .single();

  if (error) {
    return jsonError(error.message || "Unable to create invite.", 500);
  }

  return NextResponse.json({ member: data });
}
