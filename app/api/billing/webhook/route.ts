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

async function syncInvoicePaymentSession(
  session: Stripe.Checkout.Session,
  status: "Succeeded" | "Failed"
) {
  if (session.metadata?.frontier_type !== "invoice_payment") return;

  const workspaceId = session.metadata.workspace_id;
  const invoiceId = session.metadata.invoice_id;
  if (!workspaceId || !invoiceId) return;

  const serviceClient = createServiceRoleClient();
  const paymentIntent =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  const amountCents = session.amount_total ?? 0;
  const paymentPayload = {
      workspace_id: workspaceId,
      invoice_id: invoiceId,
      amount_cents: amountCents,
      payment_date: new Date().toISOString().slice(0, 10),
      method: "Stripe",
      reference: session.id,
      notes: status === "Succeeded" ? "Stripe Checkout payment completed." : "Stripe Checkout payment failed.",
      status,
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: paymentIntent,
      stripe_customer_id:
        typeof session.customer === "string"
          ? session.customer
          : session.customer?.id ?? null,
      paid_by_user_id: session.metadata.paid_by_user_id || null,
  };

  const { data: existingPayment, error: existingPaymentError } = await serviceClient
    .from("invoice_payments")
    .select("id")
    .eq("stripe_checkout_session_id", session.id)
    .maybeSingle();

  if (existingPaymentError) throw existingPaymentError;

  const paymentWrite = existingPayment
    ? await serviceClient
        .from("invoice_payments")
        .update(paymentPayload)
        .eq("id", existingPayment.id)
    : await serviceClient.from("invoice_payments").insert(paymentPayload);

  if (paymentWrite.error) throw paymentWrite.error;

  if (status === "Succeeded" && session.payment_status === "paid") {
    const { error: invoiceUpdateError } = await serviceClient
      .from("invoices")
      .update({
        status: "Paid",
        paid_at: new Date().toISOString(),
      })
      .eq("id", invoiceId)
      .eq("workspace_id", workspaceId);

    if (invoiceUpdateError) throw invoiceUpdateError;
  }
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
      if (session.metadata?.frontier_type === "invoice_payment") {
        await syncInvoicePaymentSession(session, "Succeeded");
        return NextResponse.json({ received: true });
      }

      if (typeof session.subscription === "string") {
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        await syncSubscription(subscription);
      }
    }

    if (event.type === "checkout.session.async_payment_failed") {
      await syncInvoicePaymentSession(event.data.object as Stripe.Checkout.Session, "Failed");
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
