import { NextRequest, NextResponse } from "next/server";

import { getSignedInClientPortalContext } from "@/lib/clientPortal/server";
import { getStripeClient, getStripeServerConfig } from "@/lib/billing/stripe";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type InvoiceLine = {
  quantity: number | string;
  unit_price_cents: number | string;
};

type InvoiceRow = {
  id: string;
  workspace_id: string;
  client_id: string;
  invoice_number: string;
  status: string;
  bill_to_email: string | null;
  discount_type: "None" | "Percent" | "Fixed";
  discount_value: number | string;
  tax_rate: number | string;
  invoice_line_items?: InvoiceLine[];
  invoice_payments?: Array<{ amount_cents: number | string; status: string | null }>;
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function originFromRequest(request: NextRequest) {
  return request.headers.get("origin") ?? request.nextUrl.origin;
}

function invoiceTotalCents(invoice: InvoiceRow) {
  const subtotal = (invoice.invoice_line_items ?? []).reduce((total, line) => {
    return total + Math.round(Number(line.quantity ?? 0) * Number(line.unit_price_cents ?? 0));
  }, 0);

  const discountValue = Number(invoice.discount_value ?? 0);
  let discount = 0;
  if (invoice.discount_type === "Percent") {
    discount = Math.round(subtotal * (discountValue / 100));
  } else if (invoice.discount_type === "Fixed") {
    discount = Math.round(discountValue * 100);
  }

  const taxableSubtotal = Math.max(subtotal - Math.min(discount, subtotal), 0);
  const tax = Math.round(taxableSubtotal * (Number(invoice.tax_rate ?? 0) / 100));
  return taxableSubtotal + tax;
}

function paidAmountCents(invoice: InvoiceRow) {
  return (invoice.invoice_payments ?? [])
    .filter((payment) => payment.status === "Succeeded" || payment.status === null)
    .reduce((total, payment) => total + Number(payment.amount_cents ?? 0), 0);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const portal = await getSignedInClientPortalContext();
  if (!portal.ok) return jsonError(portal.error, portal.status);

  const stripeConfig = getStripeServerConfig();
  const stripe = getStripeClient();
  if (!stripeConfig.configured || !stripe) {
    return jsonError("Stripe invoice payments are not configured.", 501);
  }

  const { data, error } = await portal.serviceClient
    .from("invoices")
    .select("id, workspace_id, client_id, invoice_number, status, bill_to_email, discount_type, discount_value, tax_rate, invoice_line_items(quantity, unit_price_cents), invoice_payments(amount_cents, status)")
    .eq("id", id)
    .eq("workspace_id", portal.access.workspace_id)
    .eq("client_id", portal.access.client_id)
    .maybeSingle();

  if (error) return jsonError(error.message || "Unable to load invoice.", 500);
  if (!data) return jsonError("Invoice not found.", 403);

  const invoice = data as InvoiceRow;
  if (invoice.status === "Paid") return jsonError("Invoice is already paid.", 409);

  const totalCents = invoiceTotalCents(invoice);
  const remainingCents = totalCents - paidAmountCents(invoice);
  if (remainingCents <= 0) return jsonError("Invoice has no remaining balance.", 400);

  try {
    const origin = originFromRequest(request);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: invoice.bill_to_email || portal.access.email || undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: remainingCents,
            product_data: {
              name: `Frontier invoice ${invoice.invoice_number}`,
            },
          },
        },
      ],
      success_url: `${origin}/client-portal/invoices?payment=success`,
      cancel_url: `${origin}/client-portal/invoices?payment=cancelled`,
      metadata: {
        frontier_type: "invoice_payment",
        workspace_id: portal.access.workspace_id,
        client_id: portal.access.client_id,
        invoice_id: invoice.id,
        paid_by_user_id: portal.userId,
      },
      payment_intent_data: {
        metadata: {
          frontier_type: "invoice_payment",
          workspace_id: portal.access.workspace_id,
          client_id: portal.access.client_id,
          invoice_id: invoice.id,
          paid_by_user_id: portal.userId,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (checkoutError) {
    const message = checkoutError instanceof Error ? checkoutError.message : "Unable to start invoice payment.";
    return jsonError(message, 500);
  }
}
