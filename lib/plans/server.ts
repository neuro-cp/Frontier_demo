import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { normalizePlanTier } from "@/lib/plans/capabilities";
import type { PlanTier } from "@/lib/plans/types";

export function resolveWorkspacePlan() {
  return normalizePlanTier(process.env.FRONTIER_DEFAULT_PLAN);
}

export async function resolveWorkspacePlanForServiceClient(
  serviceClient: SupabaseClient,
  workspaceId: string,
  userId?: string
): Promise<PlanTier> {
  if (userId) {
    const { data: platformAdmin } = await serviceClient
      .from("platform_admins")
      .select("user_id")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle();
    if (platformAdmin) return "business";
  }

  const { data } = await serviceClient
    .from("workspace_billing")
    .select("plan, billing_status")
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  const billingStatus =
    typeof data?.billing_status === "string" ? data.billing_status : "";
  if (billingStatus === "Active" || billingStatus === "Trialing") {
    return normalizePlanTier(typeof data?.plan === "string" ? data.plan : null);
  }

  return resolveWorkspacePlan();
}
