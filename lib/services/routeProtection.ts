import "server-only";

import { NextResponse } from "next/server";

import { createServiceRoleClient } from "@/lib/platformAdmin/server";
import { RateLimitError } from "@/lib/rateLimit/policy";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function cleanRouteError(error: unknown, fallback: string) {
  if (error instanceof RateLimitError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  return jsonError(fallback, 400);
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
    .select("id")
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

  return { ok: true as const, serviceClient, userId: user.id, workspaceId };
}
