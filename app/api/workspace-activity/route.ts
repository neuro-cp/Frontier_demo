import { NextRequest, NextResponse } from "next/server";

import { createServiceRoleClient } from "@/lib/platformAdmin/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function countByStatus(rows: Array<{ status: string | null }>) {
  return rows.reduce<Record<string, number>>((counts, row) => {
    const status = row.status || "Unknown";
    counts[status] = (counts[status] ?? 0) + 1;
    return counts;
  }, {});
}

export async function GET(request: NextRequest) {
  const workspaceId = request.nextUrl.searchParams.get("workspaceId");
  if (!workspaceId) return jsonError("Workspace is required.", 400);

  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) return jsonError("Sign in required.", 401);

  const serviceClient = createServiceRoleClient();
  const { data: member, error: memberError } = await serviceClient
    .from("workspace_members")
    .select("id, role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .eq("status", "Active")
    .maybeSingle();

  if (memberError) return jsonError(memberError.message || "Unable to verify workspace access.", 500);
  if (!member) return jsonError("Workspace access required.", 403);

  const [
    messagesResult,
    updatesResult,
    notificationsResult,
    paymentsResult,
    estimatesResult,
    invoicesResult,
  ] = await Promise.all([
    serviceClient
      .from("workspace_messages")
      .select("id, sender_type, body, created_at")
      .eq("workspace_id", workspaceId)
      .eq("is_internal", false)
      .order("created_at", { ascending: false })
      .limit(5),
    serviceClient
      .from("employee_job_updates")
      .select("id, update_type, body, completion_percent, created_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(5),
    serviceClient
      .from("workspace_notifications")
      .select("id, type, title, body, read_at, created_at")
      .eq("workspace_id", workspaceId)
      .is("archived_at", null)
      .order("created_at", { ascending: false })
      .limit(5),
    serviceClient
      .from("invoice_payments")
      .select("id, invoice_id, amount_cents, status, payment_date, created_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(5),
    serviceClient
      .from("estimates")
      .select("id, status, estimate_date")
      .eq("workspace_id", workspaceId)
      .limit(250),
    serviceClient
      .from("invoices")
      .select("id, status, due_date")
      .eq("workspace_id", workspaceId)
      .limit(250),
  ]);

  const firstError =
    messagesResult.error ||
    updatesResult.error ||
    notificationsResult.error ||
    paymentsResult.error ||
    estimatesResult.error ||
    invoicesResult.error;
  if (firstError) return jsonError(firstError.message || "Unable to load activity.", 500);

  const today = new Date();
  const invoices = invoicesResult.data ?? [];
  const aging = {
    unpaid: invoices.filter((invoice) => invoice.status !== "Paid").length,
    overdue: invoices.filter((invoice) => {
      if (invoice.status === "Paid" || !invoice.due_date) return false;
      return new Date(invoice.due_date) < today;
    }).length,
    paid: invoices.filter((invoice) => invoice.status === "Paid").length,
  };

  return NextResponse.json({
    customerActivity: messagesResult.data ?? [],
    employeeActivity: updatesResult.data ?? [],
    notifications: notificationsResult.data ?? [],
    paymentActivity: paymentsResult.data ?? [],
    estimatePipeline: countByStatus(estimatesResult.data ?? []),
    invoiceAging: aging,
  });
}
