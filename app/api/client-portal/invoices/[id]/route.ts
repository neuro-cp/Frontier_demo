import { NextResponse } from "next/server";

import { getSignedInClientPortalContext } from "@/lib/clientPortal/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const portal = await getSignedInClientPortalContext();
  if (!portal.ok) return jsonError(portal.error, portal.status);

  const { data, error } = await portal.serviceClient
    .from("invoices")
    .select(
      "id, invoice_number, invoice_date, due_date, status, bill_to_name, bill_to_email, discount_type, discount_value, tax_rate, paid_at, created_at, invoice_line_items(id, description, quantity, unit_price_cents, sort_order), invoice_payments(id, amount_cents, status, payment_date, method, reference, stripe_checkout_session_id, stripe_payment_intent_id, created_at)"
    )
    .eq("id", id)
    .eq("workspace_id", portal.access.workspace_id)
    .eq("client_id", portal.access.client_id)
    .maybeSingle();

  if (error) return jsonError(error.message || "Unable to load invoice.", 500);
  if (!data) return jsonError("Invoice not found.", 403);

  return NextResponse.json({ invoice: data });
}
