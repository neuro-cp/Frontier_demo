import type { InvoiceRow } from "@/lib/frontierInvoices";

export async function promptPaidInvoiceInventoryDeduction(invoice: InvoiceRow) {
  const hasInventoryLines = invoice.lineItems.some(
    (item) =>
      item.inventoryItemId &&
      item.inventoryDeductionStatus !== "Deducted" &&
      item.inventoryDeductionStatus !== "Pending"
  );
  if (!hasInventoryLines) return false;

  const deductNow = window.confirm(
    "Would you like Frontier to apply the listed invoice materials to inventory now?\n\nOK = Deduct Inventory Now\nCancel = Mark materials pending for later"
  );
  const response = await fetch("/api/inventory/deduct", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      workspaceId: invoice.workspaceId,
      invoiceId: invoice.id,
      action: deductNow ? "deduct_now" : "deduct_later",
    }),
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || "Invoice was marked paid, but materials could not be applied.");
  }
  return true;
}
