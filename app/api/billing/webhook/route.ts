import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { createServiceRoleClient } from "@/lib/platformAdmin/server";
import { getStripeClient } from "@/lib/billing/stripe";

function statusFromSubscription(status: Stripe.Subscription.Status) {
  if (status === "trialing") return "Trialing";
  if (status === "active") return "Active";
  if (status === "past_due" || status === "unpaid") return "Past Due";
  if (status === "canceled") return "Canceled";
  return "Incomplete";
}

async function syncSubscription(subscription: Stripe.Subscription) {
  const workspaceId = subscription.metadata.workspace_id;
  const plan = subscription.metadata.plan;
  if (!workspaceId || !plan) return;

  const item = subscription.items.data[0];
  const periodEnd = item?.current_period_end
    ? new Date(item.current_period_end * 1000).toISOString()
    : null;
  const serviceClient = createServiceRoleClient();

  await serviceClient.from("workspace_billing").upsert({
    workspace_id: workspaceId,
    plan,
    billing_status: statusFromSubscription(subscription.status),
    stripe_customer_id:
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer.id,
    stripe_subscription_id: subscription.id,
    stripe_price_id: item?.price.id ?? null,
    current_period_end: periodEnd,
    cancel_at_period_end: subscription.cancel_at_period_end,
  });
}

export async function POST(request: NextRequest) {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Stripe webhook is not configured." }, { status: 501 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const payload = await request.text();
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid Stripe webhook signature." }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (typeof session.subscription === "string") {
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        await syncSubscription(subscription);
      }
    }

    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      await syncSubscription(event.data.object as Stripe.Subscription);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to process Stripe webhook.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
