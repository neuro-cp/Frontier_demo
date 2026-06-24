import { NextResponse } from "next/server";

import { createServiceRoleClient } from "@/lib/platformAdmin/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type EstimateLine = {
  id: string;
  description: string;
  quantity: number | string;
  unit_price_cents: number;
  sort_order: number;
};

type EstimateRow = {
  id: string;
  workspace_id: string;
  client_id: string | null;
  job_id: string | null;
  estimate_number: string;
  estimate_date: string;
  converted_invoice_id: string | null;
  company_name: string | null;
  company_address: string | null;
  company_city: string | null;
  company_state: string | null;
  company_zip: string | null;
  company_phone: string | null;
  company_email: string | null;
  bill_to_name: string | null;
  bill_to_company: string | null;
  bill_to_address: string | null;
  bill_to_city: string | null;
  bill_to_state: string | null;
  bill_to_zip: string | null;
  bill_to_phone: string | null;
  bill_to_email: string | null;
  discount_type: string;
  discount_value: number | string;
  tax_rate: number | string;
  footer_message: string | null;
  contact_message: string | null;
  status: string;
  approved_at: string | null;
  estimate_line_items?: EstimateLine[];
};

function jsonError(message: string, status: number, details: Record<string, unknown> = {}) {
  return NextResponse.json({ error: message, ...details }, { status });
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function sanitizeNumber(value: string) {
  return value.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 40);
}

async function nextInvoiceNumber(
  serviceClient: ReturnType<typeof createServiceRoleClient>,
  workspaceId: string,
  estimateNumber: string
) {
  const base = `INV-${sanitizeNumber(estimateNumber) || Date.now().toString(36).toUpperCase()}`;
  const { data, error } = await serviceClient
    .from("invoices")
    .select("invoice_number")
    .eq("workspace_id", workspaceId)
    .ilike("invoice_number", `${base}%`);

  if (error) throw error;
  const existing = new Set((data ?? []).map((row) => row.invoice_number as string));
  if (!existing.has(base)) return base;

  for (let index = 2; index < 100; index += 1) {
    const candidate = `${base}-${index}`;
    if (!existing.has(candidate)) return candidate;
  }

  return `${base}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

export async function POST(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) return jsonError("Sign in required.", 401);

  const serviceClient = createServiceRoleClient();
  const { data: estimateData, error: estimateError } = await serviceClient
    .from("estimates")
    .select("*, estimate_line_items(*)")
    .eq("id", id)
    .maybeSingle();

  if (estimateError) return jsonError(estimateError.message, 500);
  if (!estimateData) return jsonError("Estimate not found.", 404);

  const estimate = estimateData as EstimateRow;
  const { data: member, error: memberError } = await serviceClient
    .from("workspace_members")
    .select("id, role")
    .eq("workspace_id", estimate.workspace_id)
    .eq("user_id", user.id)
    .eq("status", "Active")
    .maybeSingle();

  if (memberError) return jsonError(memberError.message, 500);
  if (!member || (member.role !== "Owner" && member.role !== "Manager")) {
    return jsonError("Only Owners and Managers can convert estimates.", 403);
  }

  if (estimate.converted_invoice_id) {
    return jsonError("Estimate has already been converted.", 409, {
      invoiceId: estimate.converted_invoice_id,
    });
  }

  if (estimate.status !== "Accepted" && !estimate.approved_at) {
    return jsonError("Only accepted estimates can be converted.", 400);
  }

  const invoiceNumber = await nextInvoiceNumber(
    serviceClient,
    estimate.workspace_id,
    estimate.estimate_number
  );

  const { data: insertedInvoice, error: invoiceError } = await serviceClient
    .from("invoices")
    .insert({
      workspace_id: estimate.workspace_id,
      client_id: estimate.client_id,
      job_id: estimate.job_id,
      source_estimate_id: estimate.id,
      invoice_number: invoiceNumber,
      invoice_date: todayDate(),
      company_name: estimate.company_name,
      company_address: estimate.company_address,
      company_city: estimate.company_city,
      company_state: estimate.company_state,
      company_zip: estimate.company_zip,
      company_phone: estimate.company_phone,
      company_email: estimate.company_email,
      bill_to_name: estimate.bill_to_name,
      bill_to_company: estimate.bill_to_company,
      bill_to_address: estimate.bill_to_address,
      bill_to_city: estimate.bill_to_city,
      bill_to_state: estimate.bill_to_state,
      bill_to_zip: estimate.bill_to_zip,
      bill_to_phone: estimate.bill_to_phone,
      bill_to_email: estimate.bill_to_email,
      discount_type: estimate.discount_type,
      discount_value: Number(estimate.discount_value) || 0,
      tax_rate: Number(estimate.tax_rate) || 0,
      footer_message: estimate.footer_message,
      contact_message: estimate.contact_message,
      status: "Draft",
    })
    .select("id, invoice_number")
    .single();

  if (invoiceError || !insertedInvoice) {
    const duplicate = invoiceError?.code === "23505";
    return jsonError(
      duplicate ? "Estimate has already been converted." : invoiceError?.message || "Unable to create invoice.",
      duplicate ? 409 : 500
    );
  }

  try {
    const lines = [...(estimate.estimate_line_items ?? [])].sort(
      (a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0)
    );

    if (lines.length > 0) {
      const { error: lineError } = await serviceClient.from("invoice_line_items").insert(
        lines.map((line, index) => ({
          workspace_id: estimate.workspace_id,
          invoice_id: insertedInvoice.id,
          description: line.description,
          quantity: Number(line.quantity) || 1,
          unit_price_cents: line.unit_price_cents,
          sort_order: index,
        }))
      );

      if (lineError) throw lineError;
    }

    const { error: estimateUpdateError } = await serviceClient
      .from("estimates")
      .update({
        status: "Converted",
        converted_invoice_id: insertedInvoice.id,
      })
      .eq("id", estimate.id)
      .is("converted_invoice_id", null);

    if (estimateUpdateError) throw estimateUpdateError;
  } catch (error) {
    await serviceClient.from("invoices").delete().eq("id", insertedInvoice.id);
    const message = error instanceof Error ? error.message : "Unable to complete estimate conversion.";
    return jsonError(message, 500);
  }

  const { data: invoice, error: loadError } = await serviceClient
    .from("invoices")
    .select("*, invoice_line_items(*)")
    .eq("id", insertedInvoice.id)
    .single();

  if (loadError) return jsonError(loadError.message, 500);

  return NextResponse.json({
    invoice,
    invoiceId: insertedInvoice.id,
    invoiceNumber: insertedInvoice.invoice_number,
  });
}
