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
