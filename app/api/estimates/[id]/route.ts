import { NextResponse } from "next/server";

import { createServiceRoleClient } from "@/lib/platformAdmin/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) return jsonError("Sign in required.", 401);

  const serviceClient = createServiceRoleClient();
  const { data: estimate, error: estimateError } = await serviceClient
    .from("estimates")
    .select("*, estimate_line_items(*)")
    .eq("id", id)
    .maybeSingle();

  if (estimateError) return jsonError(estimateError.message, 500);
  if (!estimate) return jsonError("Estimate not found.", 404);

  const { data: member, error: memberError } = await serviceClient
    .from("workspace_members")
    .select("id, role")
    .eq("workspace_id", estimate.workspace_id)
    .eq("user_id", user.id)
    .eq("status", "Active")
    .maybeSingle();

  if (memberError) return jsonError(memberError.message, 500);
  if (!member) return jsonError("Access denied.", 403);

  let convertedInvoice = null;
  if (estimate.converted_invoice_id) {
    const { data: invoice, error: invoiceError } = await serviceClient
      .from("invoices")
      .select("id, invoice_number")
      .eq("id", estimate.converted_invoice_id)
      .maybeSingle();

    if (invoiceError) return jsonError(invoiceError.message, 500);
    convertedInvoice = invoice;
  }

  return NextResponse.json({
    estimate: {
      ...estimate,
      convertedInvoice,
    },
    canConvert: member.role === "Owner" || member.role === "Manager",
  });
}
