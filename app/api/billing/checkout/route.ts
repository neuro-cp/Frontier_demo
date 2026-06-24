import { NextRequest, NextResponse } from "next/server";

import { requireBillingManager } from "@/lib/billing/access";
import {
  ensureStripeMonthlyPrice,
  getBillingPlanOption,
  getStripeClient,
  getStripeServerConfig,
} from "@/lib/billing/stripe";

type CheckoutRequest = {
  workspaceId?: string;
  plan?: string;
};

function originFromRequest(request: NextRequest) {
  return request.headers.get("origin") ?? request.nextUrl.origin;
}

export async function POST(request: NextRequest) {
  let body: CheckoutRequest;
  try {
    body = (await request.json()) as CheckoutRequest;
  } catch {
    return NextResponse.json({ error: "Invalid checkout request." }, { status: 400 });
  }

  const option = getBillingPlanOption(body.plan);
  if (!option) {
    return NextResponse.json({ error: "Unsupported billing plan." }, { status: 400 });
  }

  const access = await requireBillingManager(body.workspaceId);
  if (!access.ok) return access.response;

  const stripeConfig = getStripeServerConfig();
  const stripe = getStripeClient();
  if (!stripeConfig.configured || !stripe) {
    return NextResponse.json({ error: "Stripe billing is not configured." }, { status: 501 });
  }

  try {
    const price = await ensureStripeMonthlyPrice(stripe, option);

    const { data: existingBilling } = await access.serviceClient
      .from("workspace_billing")
      .select("stripe_customer_id")
      .eq("workspace_id", access.workspaceId)
      .maybeSingle();

    let customerId = existingBilling?.stripe_customer_id ?? null;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: access.userEmail ?? undefined,
        metadata: {
          workspace_id: access.workspaceId,
        },
      });
      customerId = customer.id;
    }

    await access.serviceClient.from("workspace_billing").upsert({
      workspace_id: access.workspaceId,
      plan: option.plan,
      billing_status: "Incomplete",
      stripe_customer_id: customerId,
      stripe_price_id: price.id,
    });

    const origin = originFromRequest(request);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      success_url: `${origin}/settings?billing=success`,
      cancel_url: `${origin}/settings?billing=cancelled`,
      metadata: {
        workspace_id: access.workspaceId,
        plan: option.plan,
      },
      subscription_data: {
        metadata: {
          workspace_id: access.workspaceId,
          plan: option.plan,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to start checkout.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
