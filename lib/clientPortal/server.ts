import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { createServiceRoleClient } from "@/lib/platformAdmin/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type ActiveClientPortalAccess = {
  id: string;
  workspace_id: string;
  client_id: string;
  email: string;
  status: string;
};

export type ClientPortalReadContext =
  | {
      ok: true;
      mode: "client";
      userId: string;
      serviceClient: SupabaseClient;
      access: ActiveClientPortalAccess;
    }
  | {
      ok: true;
      mode: "workspace_preview";
      userId: string;
      serviceClient: SupabaseClient;
      access: {
        id: string;
        workspace_id: string;
        client_id: null;
        email: string;
        status: "Active";
      };
    }
  | { ok: false; status: number; error: string };

export async function getSignedInClientPortalContext(): Promise<
  | {
      ok: true;
      userId: string;
      serviceClient: SupabaseClient;
      access: ActiveClientPortalAccess;
    }
  | { ok: false; status: number; error: string }
> {
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) {
    return { ok: false, status: 401, error: "Sign in required." };
  }

  const serviceClient = createServiceRoleClient();
  const { data, error } = await serviceClient
    .from("client_portal_access")
    .select("id, workspace_id, client_id, email, status")
    .eq("user_id", user.id)
    .eq("status", "Active")
    .order("accepted_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return { ok: false, status: 500, error: error.message };
  if (!data) return { ok: false, status: 403, error: "Active client portal access required." };

  return {
    ok: true,
    userId: user.id,
    serviceClient,
    access: data as ActiveClientPortalAccess,
  };
}

export async function getClientPortalReadContext(
  requestedWorkspaceId: string | null
): Promise<ClientPortalReadContext> {
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) {
    return { ok: false, status: 401, error: "Sign in required." };
  }

  const serviceClient = createServiceRoleClient();
  const activeAccessQuery = serviceClient
    .from("client_portal_access")
    .select("id, workspace_id, client_id, email, status")
    .eq("user_id", user.id)
    .eq("status", "Active")
    .order("accepted_at", { ascending: false });

  const { data: activeAccess, error: accessError } = await (
    requestedWorkspaceId
      ? activeAccessQuery.eq("workspace_id", requestedWorkspaceId)
      : activeAccessQuery
  )
    .limit(1)
    .maybeSingle();

  if (accessError) return { ok: false, status: 500, error: accessError.message };
  if (activeAccess) {
    return {
      ok: true,
      mode: "client",
      userId: user.id,
      serviceClient,
      access: activeAccess as ActiveClientPortalAccess,
    };
  }

  if (!requestedWorkspaceId) {
    return { ok: false, status: 403, error: "Active client portal access required." };
  }

  const { data: member, error: memberError } = await serviceClient
    .from("workspace_members")
    .select("id, role, workspace_id")
    .eq("workspace_id", requestedWorkspaceId)
    .eq("user_id", user.id)
    .eq("status", "Active")
    .maybeSingle();

  if (memberError) return { ok: false, status: 500, error: memberError.message };
  if (!member || (member.role !== "Owner" && member.role !== "Manager")) {
    return { ok: false, status: 403, error: "Active client portal access required." };
  }

  return {
    ok: true,
    mode: "workspace_preview",
    userId: user.id,
    serviceClient,
    access: {
      id: `workspace-preview-${requestedWorkspaceId}`,
      workspace_id: requestedWorkspaceId,
      client_id: null,
      email: user.email ?? "workspace-preview",
      status: "Active",
    },
  };
}
