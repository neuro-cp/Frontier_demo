import "server-only";

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireSupabasePublicEnv } from "@/lib/supabase/env";

export type AdminAuthContext = {
  adminUserId: string;
  adminEmail: string | null;
  serviceClient: ReturnType<typeof createServiceRoleClient>;
};

export function createServiceRoleClient() {
  const { url } = requireSupabasePublicEnv();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY.");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function forbiddenResponse(message = "Access denied.") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function serverErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Server error.";
  return NextResponse.json({ error: message }, { status: 500 });
}

export async function requirePlatformAdmin(): Promise<
  | { ok: true; context: AdminAuthContext }
  | { ok: false; response: NextResponse }
> {
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) {
    return {
      ok: false,
      response: forbiddenResponse("Sign in required."),
    };
  }

  const { data: isAdmin, error: adminError } = await userClient.rpc(
    "is_platform_admin"
  );

  if (adminError || !isAdmin) {
    return {
      ok: false,
      response: forbiddenResponse(),
    };
  }

  try {
    return {
      ok: true,
      context: {
        adminUserId: user.id,
        adminEmail: user.email ?? null,
        serviceClient: createServiceRoleClient(),
      },
    };
  } catch (error) {
    return {
      ok: false,
      response: serverErrorResponse(error),
    };
  }
}

export async function logAdminAction(
  context: AdminAuthContext,
  action: string,
  details: {
    targetUserId?: string | null;
    targetWorkspaceId?: string | null;
    metadata?: Record<string, unknown>;
  } = {}
) {
  const { error } = await context.serviceClient.from("admin_audit_logs").insert({
    admin_user_id: context.adminUserId,
    target_user_id: details.targetUserId ?? null,
    target_workspace_id: details.targetWorkspaceId ?? null,
    action,
    metadata: details.metadata ?? {},
  });

  if (error) {
    console.error("Unable to write admin audit log.", error);
  }
}
