import "server-only";

import { createServiceRoleClient } from "@/lib/platformAdmin/server";
import { jsonError } from "@/lib/services/routeProtection";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function requireBillingManager(workspaceId?: string) {
  if (!workspaceId) {
    return { ok: false as const, response: jsonError("Workspace is required.", 400) };
  }

  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await userClient.auth.getUser();

  if (error || !user) {
    return { ok: false as const, response: jsonError("Sign in required.", 401) };
  }

  const serviceClient = createServiceRoleClient();
  const { data: member, error: memberError } = await serviceClient
    .from("workspace_members")
    .select("id, role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .eq("status", "Active")
    .maybeSingle();

  if (memberError || !member) {
    return { ok: false as const, response: jsonError("You do not have access to this workspace.", 403) };
  }

  if (member.role !== "Owner" && member.role !== "Manager") {
    return { ok: false as const, response: jsonError("Only Owners and Managers can manage billing.", 403) };
  }

  return {
    ok: true as const,
    serviceClient,
    userId: user.id,
    userEmail: user.email ?? null,
    workspaceId,
  };
}
