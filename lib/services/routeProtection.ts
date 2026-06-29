import "server-only";

import { NextResponse } from "next/server";

import { createServiceRoleClient } from "@/lib/platformAdmin/server";
import { resolveWorkspacePlanForServiceClient } from "@/lib/plans/server";
import { RateLimitError } from "@/lib/rateLimit/policy";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function planUpgradeError() {
  return NextResponse.json(
    { error: "Your workspace plan does not include this service.", code: "plan_upgrade_required" },
    { status: 402 }
  );
}

export function cleanRouteError(error: unknown, fallback: string) {
  if (error instanceof RateLimitError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  return jsonError(fallback, 400);
}

export function canManageWorkspaceData(role?: string | null) {
  return role === "Owner" || role === "Manager";
}

export function managerRequiredError(action = "perform this action") {
  return jsonError(`Only Owners and Managers can ${action}.`, 403);
}

export async function requireWorkspaceAccess(workspaceId?: string) {
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
  const { data } = await serviceClient
    .from("workspace_members")
    .select("id, role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .eq("status", "Active")
    .limit(1)
    .maybeSingle();

  if (!data) {
    return {
      ok: false as const,
      response: jsonError("You do not have access to this workspace.", 403),
    };
  }

  return {
    ok: true as const,
    serviceClient,
    userId: user.id,
    workspaceId,
    role: data.role as string | null,
    plan: await resolveWorkspacePlanForServiceClient(serviceClient, workspaceId, user.id),
  };
}
