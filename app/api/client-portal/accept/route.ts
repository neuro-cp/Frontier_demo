import { NextRequest, NextResponse } from "next/server";

import { hashClientPortalInviteToken } from "@/lib/clientPortal/tokens";
import { createServiceRoleClient } from "@/lib/platformAdmin/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) return jsonError("Sign in required.", 401);

  const body = (await request.json()) as { token?: string };
  const token = body.token?.trim();
  if (!token) return jsonError("Invite token is required.", 400);

  const serviceClient = createServiceRoleClient();
  const tokenHash = hashClientPortalInviteToken(token);
  const { data: invite, error: inviteError } = await serviceClient
    .from("client_portal_access")
    .select("id, workspace_id, client_id, email, status, invite_expires_at, user_id")
    .eq("invite_token_hash", tokenHash)
    .maybeSingle();

  if (inviteError || !invite) return jsonError("Invite is invalid or expired.", 400);
  if (invite.status !== "Invited") return jsonError("Invite is no longer active.", 400);
  if (invite.user_id) return jsonError("Invite has already been accepted.", 400);
  if (invite.invite_expires_at && new Date(invite.invite_expires_at).getTime() < Date.now()) {
    await serviceClient
      .from("client_portal_access")
      .update({ status: "Expired", invite_token_hash: null })
      .eq("id", invite.id);
    return jsonError("Invite has expired.", 400);
  }

  const { data, error } = await serviceClient
    .from("client_portal_access")
    .update({
      user_id: user.id,
      status: "Active",
      accepted_at: new Date().toISOString(),
      invite_token_hash: null,
    })
    .eq("id", invite.id)
    .select("id, workspace_id, client_id, email, status, accepted_at")
    .single();

  if (error) return jsonError(error.message || "Unable to accept invite.", 500);
  return NextResponse.json({ access: data });
}
