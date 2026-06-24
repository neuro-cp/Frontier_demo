import type { PlanTier } from "@/lib/plans/types";

export const billingStatuses = [
  "Not Configured",
  "Trialing",
  "Active",
  "Past Due",
  "Canceled",
  "Incomplete",
] as const;

export type BillingStatus = (typeof billingStatuses)[number];

export type WorkspaceBillingStatus = {
  workspaceId: string;
  plan: PlanTier;
  billingStatus: BillingStatus;
  stripeConfigured: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
};

export type BillingPlanOption = {
  plan: Extract<PlanTier, "basic" | "professional" | "business">;
  label: string;
  description: string;
  amountCents: number;
  lookupKey: string;
};
