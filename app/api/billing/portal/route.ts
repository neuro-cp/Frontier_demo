import { NextRequest, NextResponse } from "next/server";

import { requireBillingManager } from "@/lib/billing/access";
import { getStripeClient, getStripeServerConfig } from "@/lib/billing/stripe";

type PortalRequest = {
  workspaceId?: string;
};

export async function POST(request: NextRequest) {
  let body: PortalRequest;
  try {
    body = (await request.json()) as PortalRequest;
  } catch {
    return NextResponse.json({ error: "Invalid billing portal request." }, { status: 400 });
  }

  const access = await requireBillingManager(body.workspaceId);
  if (!access.ok) return access.response;

  const stripeConfig = getStripeServerConfig();
  const stripe = getStripeClient();
  if (!stripeConfig.configured || !stripe) {
    return NextResponse.json({ error: "Stripe billing is not configured." }, { status: 501 });
  }

  const { data: billing, error } = await access.serviceClient
    .from("workspace_billing")
    .select("stripe_customer_id")
    .eq("workspace_id", access.workspaceId)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!billing?.stripe_customer_id) {
    return NextResponse.json({ error: "No Stripe customer exists for this workspace yet." }, { status: 400 });
  }

  try {
    const origin = request.headers.get("origin") ?? request.nextUrl.origin;
    const session = await stripe.billingPortal.sessions.create({
      customer: billing.stripe_customer_id,
      return_url: `${origin}/settings`,
    });

    return NextResponse.json({ url: session.url });
  } catch (portalError) {
    const message = portalError instanceof Error ? portalError.message : "Unable to open billing portal.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
