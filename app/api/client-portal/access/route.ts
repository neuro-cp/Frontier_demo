import { NextRequest, NextResponse } from "next/server";

import { createServiceRoleClient } from "@/lib/platformAdmin/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: NextRequest) {
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) return jsonError("Sign in required.", 401);

  const workspaceId = request.nextUrl.searchParams.get("workspaceId");
  const clientId = request.nextUrl.searchParams.get("clientId");
  const serviceClient = createServiceRoleClient();

  if (workspaceId && clientId) {
    const { data: actor } = await serviceClient
      .from("workspace_members")
      .select("id, role")
      .eq("workspace_id", workspaceId)
      .eq("user_id", user.id)
      .eq("status", "Active")
      .maybeSingle();

    if (!actor || (actor.role !== "Owner" && actor.role !== "Manager")) {
      return jsonError("Only Owners and Managers can view portal access.", 403);
    }

    const { data, error } = await serviceClient
      .from("client_portal_access")
      .select("id, workspace_id, client_id, user_id, email, status, invite_expires_at, accepted_at, created_at")
      .eq("workspace_id", workspaceId)
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });

    if (error) return jsonError(error.message || "Unable to load portal access.", 500);
    return NextResponse.json({ access: data ?? [] });
  }

  const { data, error } = await serviceClient
    .from("client_portal_access")
    .select("id, workspace_id, client_id, email, status, accepted_at, clients(id, name)")
    .eq("user_id", user.id)
    .eq("status", "Active")
    .order("accepted_at", { ascending: false });

  if (error) return jsonError(error.message || "Unable to load portal access.", 500);
  return NextResponse.json({ access: data ?? [] });
}
