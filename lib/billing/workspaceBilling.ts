import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { getStripeServerConfig } from "@/lib/billing/stripe";
import type { WorkspaceBillingStatus } from "@/lib/billing/types";
import { normalizePlanTier } from "@/lib/plans/capabilities";
import { resolveWorkspacePlan } from "@/lib/plans/server";

type WorkspaceBillingRow = {
  workspace_id: string;
  plan: string;
  billing_status: WorkspaceBillingStatus["billingStatus"];
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
};

export async function getWorkspaceBillingStatus(
  serviceClient: SupabaseClient,
  workspaceId: string
): Promise<WorkspaceBillingStatus> {
  const { data, error } = await serviceClient
    .from("workspace_billing")
    .select(
      "workspace_id, plan, billing_status, stripe_customer_id, stripe_subscription_id, stripe_price_id, current_period_end, cancel_at_period_end"
    )
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  const row = data as WorkspaceBillingRow | null;
  const stripe = getStripeServerConfig();

  if (!row) {
    return {
      workspaceId,
      plan: resolveWorkspacePlan(),
      billingStatus: "Not Configured",
      stripeConfigured: stripe.configured,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      stripePriceId: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    };
  }

  return {
    workspaceId,
    plan: normalizePlanTier(row.plan),
    billingStatus: row.billing_status,
    stripeConfigured: stripe.configured,
    stripeCustomerId: row.stripe_customer_id,
    stripeSubscriptionId: row.stripe_subscription_id,
    stripePriceId: row.stripe_price_id,
    currentPeriodEnd: row.current_period_end,
    cancelAtPeriodEnd: Boolean(row.cancel_at_period_end),
  };
}
