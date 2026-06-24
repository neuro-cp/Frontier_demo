import { NextRequest, NextResponse } from "next/server";

import { getSignedInClientPortalContext } from "@/lib/clientPortal/server";

type DataType = "jobs" | "invoices" | "estimates" | "documents";

const validTypes = new Set<DataType>(["jobs", "invoices", "estimates", "documents"]);

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type") as DataType | null;
  if (!type || !validTypes.has(type)) return jsonError("Unsupported client portal data type.", 400);

  const portal = await getSignedInClientPortalContext();
  if (!portal.ok) return jsonError(portal.error, portal.status);

  const serviceClient = portal.serviceClient;
  const access = portal.access;
  const workspaceId = access.workspace_id;
  const clientId = access.client_id;

  if (type === "jobs") {
    const { data, error } = await serviceClient
      .from("jobs")
      .select("id, name, status, scheduled_date, scheduled_time, estimated_value_cents, notes, created_at")
      .eq("workspace_id", workspaceId)
      .eq("client_id", clientId)
      .order("scheduled_date", { ascending: false, nullsFirst: false })
      .limit(100);
    if (error) return jsonError(error.message || "Unable to load jobs.", 500);
    return NextResponse.json({ access, items: data ?? [] });
  }

  if (type === "invoices") {
    const { data, error } = await serviceClient
      .from("invoices")
      .select("id, invoice_number, invoice_date, due_date, status, bill_to_name, bill_to_email, created_at")
      .eq("workspace_id", workspaceId)
      .eq("client_id", clientId)
      .order("invoice_date", { ascending: false })
      .limit(100);
    if (error) return jsonError(error.message || "Unable to load invoices.", 500);
    return NextResponse.json({ access, items: data ?? [] });
  }

  if (type === "estimates") {
    const { data, error } = await serviceClient
      .from("estimates")
      .select("id, estimate_number, estimate_date, status, bill_to_name, bill_to_email, bill_to_address, bill_to_city, bill_to_state, bill_to_zip, converted_invoice_id, approved_at, approval_notes, rejected_at, rejection_notes, created_at, estimate_line_items(id, description, quantity, unit_price_cents, sort_order)")
      .eq("workspace_id", workspaceId)
      .eq("client_id", clientId)
      .order("estimate_date", { ascending: false })
      .limit(100);
    if (error) return jsonError(error.message || "Unable to load estimates.", 500);
    return NextResponse.json({ access, items: data ?? [] });
  }

  const { data, error } = await serviceClient
    .from("documents")
    .select("id, name, detected_type, extraction_status, file_name, mime_type, size_bytes, created_at")
    .eq("workspace_id", workspaceId)
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) return jsonError(error.message || "Unable to load documents.", 500);
  return NextResponse.json({ access, items: data ?? [] });
}
