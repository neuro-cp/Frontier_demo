import { NextRequest, NextResponse } from "next/server";

import { billingPlanOptions, getStripeServerConfig } from "@/lib/billing/stripe";
import { getWorkspaceBillingStatus } from "@/lib/billing/workspaceBilling";
import { requireWorkspaceAccess } from "@/lib/services/routeProtection";

export async function GET(request: NextRequest) {
  const workspaceId = request.nextUrl.searchParams.get("workspaceId") ?? undefined;
  const access = await requireWorkspaceAccess(workspaceId);

  if (!access.ok) return access.response;

  try {
    const billing = await getWorkspaceBillingStatus(access.serviceClient, access.workspaceId);
    const stripe = getStripeServerConfig();

    return NextResponse.json({
      billing,
      stripe: {
        configured: stripe.configured,
        hasPublishableKey: stripe.hasPublishableKey,
        hasSecretKey: stripe.hasSecretKey,
        hasWebhookSecret: stripe.hasWebhookSecret,
        priceIds: stripe.priceIds,
      },
      plans: billingPlanOptions,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load billing status.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
