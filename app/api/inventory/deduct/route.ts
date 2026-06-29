import { NextRequest, NextResponse } from "next/server";

import { createServiceRoleClient } from "@/lib/platformAdmin/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

type DeductRequest = {
  workspaceId?: string;
  invoiceId?: string;
  action?: "deduct_now" | "deduct_later";
};

async function requireManager(workspaceId: string) {
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();
  if (userError || !user) return { ok: false as const, status: 401, error: "Sign in required." };

  const serviceClient = createServiceRoleClient();
  const { data: member, error } = await serviceClient
    .from("workspace_members")
    .select("id, role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .eq("status", "Active")
    .maybeSingle();

  if (error) return { ok: false as const, status: 500, error: error.message };
  if (!member || (member.role !== "Owner" && member.role !== "Manager")) {
    return { ok: false as const, status: 403, error: "Only Owners and Managers can deduct inventory." };
  }

  return { ok: true as const, userId: user.id, serviceClient };
}

export async function POST(request: NextRequest) {
  let body: DeductRequest;
  try {
    body = (await request.json()) as DeductRequest;
  } catch {
    return jsonError("Invalid inventory deduction request.", 400);
  }

  if (!body.workspaceId || !body.invoiceId || !body.action) {
    return jsonError("Workspace, invoice, and action are required.", 400);
  }

  const access = await requireManager(body.workspaceId);
  if (!access.ok) return jsonError(access.error, access.status);

  const { serviceClient, userId } = access;
  const { data: invoice, error: invoiceError } = await serviceClient
    .from("invoices")
    .select("id, invoice_number, workspace_id")
    .eq("id", body.invoiceId)
    .eq("workspace_id", body.workspaceId)
    .maybeSingle();
  if (invoiceError) return jsonError(invoiceError.message, 500);
  if (!invoice) return jsonError("Invoice not found in this workspace.", 404);

  const { data: lines, error: linesError } = await serviceClient
    .from("invoice_line_items")
    .select("id, inventory_item_id, quantity, inventory_deduction_status")
    .eq("invoice_id", body.invoiceId)
    .eq("workspace_id", body.workspaceId)
    .not("inventory_item_id", "is", null);
  if (linesError) return jsonError(linesError.message, 500);

  const applicableLines = (lines ?? []).filter((line) => line.inventory_deduction_status !== "Deducted");
  if (applicableLines.length === 0) {
    return NextResponse.json({ ok: true, updatedLines: 0 });
  }

  if (body.action === "deduct_later") {
    const lineIds = applicableLines.map((line) => line.id);
    const { error: updateError } = await serviceClient
      .from("invoice_line_items")
      .update({ inventory_deduction_status: "Pending" })
      .in("id", lineIds)
      .eq("workspace_id", body.workspaceId);
    if (updateError) return jsonError(updateError.message, 500);

    await serviceClient.from("workspace_notifications").insert({
      workspace_id: body.workspaceId,
      user_id: userId,
      type: "inventory_deduction_pending",
      title: "Inventory deduction pending",
      body: `Invoice ${invoice.invoice_number} has inventory items that still need to be deducted.`,
      entity_type: "invoice",
      entity_id: body.invoiceId,
      metadata: { invoiceId: body.invoiceId },
    });

    return NextResponse.json({ ok: true, updatedLines: lineIds.length, status: "Pending" });
  }

  for (const line of applicableLines) {
    const quantity = Number(line.quantity) || 0;
    if (quantity <= 0 || !line.inventory_item_id) continue;

    const { data: item, error: itemError } = await serviceClient
      .from("inventory_items")
      .select("id, current_qty")
      .eq("id", line.inventory_item_id)
      .eq("workspace_id", body.workspaceId)
      .maybeSingle();
    if (itemError) return jsonError(itemError.message, 500);
    if (!item) continue;

    const currentQty = item.current_qty == null ? 0 : Number(item.current_qty);
    const { error: itemUpdateError } = await serviceClient
      .from("inventory_items")
      .update({ current_qty: currentQty - quantity })
      .eq("id", item.id)
      .eq("workspace_id", body.workspaceId);
    if (itemUpdateError) return jsonError(itemUpdateError.message, 500);

    const { error: lineUpdateError } = await serviceClient
      .from("invoice_line_items")
      .update({ inventory_deduction_status: "Deducted" })
      .eq("id", line.id)
      .eq("workspace_id", body.workspaceId);
    if (lineUpdateError) return jsonError(lineUpdateError.message, 500);
  }

  return NextResponse.json({ ok: true, updatedLines: applicableLines.length, status: "Deducted" });
}
