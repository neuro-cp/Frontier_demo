import "server-only";

import Stripe from "stripe";

import type { BillingPlanOption } from "@/lib/billing/types";
import type { PlanTier } from "@/lib/plans/types";

export type StripeServerConfig = {
  configured: boolean;
  hasSecretKey: boolean;
  hasPublishableKey: boolean;
  hasWebhookSecret: boolean;
  priceIds: {
    basic: boolean;
    professional: boolean;
    business: boolean;
  };
};

export const billingPlanOptions: BillingPlanOption[] = [
  {
    plan: "basic",
    label: "Starter",
    description: "Core cloud workspace features for small teams.",
    amountCents: 2900,
    lookupKey: "frontier_starter_monthly",
  },
  {
    plan: "professional",
    label: "Pro",
    description: "OCR, speech, AI drafts, logistics, and route summaries.",
    amountCents: 7900,
    lookupKey: "frontier_pro_monthly",
  },
  {
    plan: "business",
    label: "Business",
    description: "Higher-volume operations and premium workflow readiness.",
    amountCents: 14900,
    lookupKey: "frontier_business_monthly",
  },
];

export function getStripeServerConfig(): StripeServerConfig {
  const hasSecretKey = Boolean(process.env.STRIPE_SECRET_KEY);
  const hasPublishableKey = Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

  return {
    configured: hasSecretKey && hasPublishableKey,
    hasSecretKey,
    hasPublishableKey,
    hasWebhookSecret: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
    priceIds: {
      basic: Boolean(process.env.STRIPE_PRICE_BASIC),
      professional: Boolean(process.env.STRIPE_PRICE_PROFESSIONAL),
      business: Boolean(process.env.STRIPE_PRICE_BUSINESS),
    },
  };
}

export function getBillingPlanOption(plan: string | null | undefined) {
  return billingPlanOptions.find((option) => option.plan === plan) ?? null;
}

export function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;
  return new Stripe(secretKey);
}

function envPriceIdForPlan(plan: PlanTier) {
  if (plan === "basic") return process.env.STRIPE_PRICE_BASIC || null;
  if (plan === "professional") return process.env.STRIPE_PRICE_PROFESSIONAL || null;
  if (plan === "business") return process.env.STRIPE_PRICE_BUSINESS || null;
  return null;
}

export async function ensureStripeMonthlyPrice(
  stripe: Stripe,
  option: BillingPlanOption
) {
  const envPriceId = envPriceIdForPlan(option.plan);
  if (envPriceId) {
    const price = await stripe.prices.retrieve(envPriceId);
    if (price.active && price.type === "recurring") return price;
    throw new Error("Configured Stripe price is inactive or not recurring.");
  }

  const existing = await stripe.prices.list({
    active: true,
    lookup_keys: [option.lookupKey],
    limit: 1,
  });

  if (existing.data[0]) return existing.data[0];

  try {
    const product = await stripe.products.create({
      name: `Frontier ${option.label}`,
      description: option.description,
      metadata: {
        frontier_plan: option.plan,
      },
    });

    return await stripe.prices.create({
      product: product.id,
      currency: "usd",
      unit_amount: option.amountCents,
      recurring: {
        interval: "month",
      },
      lookup_key: option.lookupKey,
      metadata: {
        frontier_plan: option.plan,
      },
    });
  } catch (error) {
    const retry = await stripe.prices.list({
      active: true,
      lookup_keys: [option.lookupKey],
      limit: 1,
    });

    if (retry.data[0]) return retry.data[0];
    throw error;
  }
}
