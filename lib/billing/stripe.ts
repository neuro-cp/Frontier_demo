import "server-only";

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
