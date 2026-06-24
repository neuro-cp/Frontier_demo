import { NextRequest, NextResponse } from "next/server";

import {
  createClientPortalInviteToken,
  getClientPortalInviteExpiresAt,
  hashClientPortalInviteToken,
} from "@/lib/clientPortal/tokens";
import { createServiceRoleClient } from "@/lib/platformAdmin/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type InviteBody = {
  workspaceId?: string;
  clientId?: string;
  email?: string;
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function requireManager(workspaceId: string, userId: string) {
  const serviceClient = createServiceRoleClient();
  const { data } = await serviceClient
    .from("workspace_members")
    .select("id, role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .eq("status", "Active")
    .maybeSingle();

  return {
    serviceClient,
    ok: Boolean(data && (data.role === "Owner" || data.role === "Manager")),
  };
}

export async function POST(request: NextRequest) {
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) return jsonError("Sign in required.", 401);

  let body: InviteBody;
  try {
    body = (await request.json()) as InviteBody;
  } catch {
    return jsonError("Invalid portal invite request.", 400);
  }

  const workspaceId = body.workspaceId;
  const clientId = body.clientId;
  const email = body.email?.trim().toLowerCase();

  if (!workspaceId || !clientId || !email) {
    return jsonError("Workspace, client, and email are required.", 400);
  }

  const { serviceClient, ok } = await requireManager(workspaceId, user.id);
  if (!ok) return jsonError("Only Owners and Managers can invite client users.", 403);

  const { data: client } = await serviceClient
    .from("clients")
    .select("id")
    .eq("id", clientId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  if (!client) return jsonError("Client not found.", 404);

  const token = createClientPortalInviteToken();
  const inviteTokenHash = hashClientPortalInviteToken(token);
  const inviteExpiresAt = getClientPortalInviteExpiresAt();

  const { data: existing } = await serviceClient
    .from("client_portal_access")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("client_id", clientId)
    .eq("email", email)
    .in("status", ["Invited", "Expired"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const query = existing
    ? serviceClient
        .from("client_portal_access")
        .update({
          status: "Invited",
          invite_token_hash: inviteTokenHash,
          invite_expires_at: inviteExpiresAt,
          user_id: null,
          accepted_at: null,
          created_by: user.id,
        })
        .eq("id", existing.id)
    : serviceClient.from("client_portal_access").insert({
        workspace_id: workspaceId,
        client_id: clientId,
        email,
        status: "Invited",
        invite_token_hash: inviteTokenHash,
        invite_expires_at: inviteExpiresAt,
        created_by: user.id,
      });

  const { data, error } = await query
    .select("id, workspace_id, client_id, user_id, email, status, invite_expires_at, accepted_at, created_at")
    .single();

  if (error) return jsonError(error.message || "Unable to create portal invite.", 500);

  return NextResponse.json({
    access: data,
    inviteToken: token,
    invitePath: `/client-portal/accept?token=${encodeURIComponent(token)}`,
  });
}

export async function PATCH(request: NextRequest) {
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) return jsonError("Sign in required.", 401);

  const body = (await request.json()) as {
    workspaceId?: string;
    accessId?: string;
    status?: string;
  };

  if (!body.workspaceId || !body.accessId || body.status !== "Revoked") {
    return jsonError("Workspace, access row, and revoked status are required.", 400);
  }

  const { serviceClient, ok } = await requireManager(body.workspaceId, user.id);
  if (!ok) return jsonError("Only Owners and Managers can revoke client portal access.", 403);

  const { data, error } = await serviceClient
    .from("client_portal_access")
    .update({
      status: "Revoked",
      invite_token_hash: null,
    })
    .eq("id", body.accessId)
    .eq("workspace_id", body.workspaceId)
    .select("id, workspace_id, client_id, user_id, email, status, invite_expires_at, accepted_at, created_at")
    .single();

  if (error) return jsonError(error.message || "Unable to revoke portal access.", 500);
  return NextResponse.json({ access: data });
}
