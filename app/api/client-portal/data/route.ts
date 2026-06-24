import { NextRequest, NextResponse } from "next/server";

import { createServiceRoleClient } from "@/lib/platformAdmin/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type DataType = "jobs" | "invoices" | "estimates" | "documents";

const validTypes = new Set<DataType>(["jobs", "invoices", "estimates", "documents"]);

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function getActiveClientAccess(userId: string) {
  const serviceClient = createServiceRoleClient();
  const { data, error } = await serviceClient
    .from("client_portal_access")
    .select("id, workspace_id, client_id, email, status, clients(id, name)")
    .eq("user_id", userId)
    .eq("status", "Active")
    .order("accepted_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type") as DataType | null;
  if (!type || !validTypes.has(type)) return jsonError("Unsupported client portal data type.", 400);

  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) return jsonError("Sign in required.", 401);

  const serviceClient = createServiceRoleClient();
  const access = await getActiveClientAccess(user.id);
  if (!access) return jsonError("Active client portal access required.", 403);

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
      .select("id, estimate_number, estimate_date, status, bill_to_name, bill_to_email, converted_invoice_id, created_at")
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
