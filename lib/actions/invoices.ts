import type { InvoiceRow } from "@/lib/frontierInvoices";
import { fail, ok, requireText, type ActionResult } from "@/lib/actions/shared";

export type InvoiceActionsRepository = {
  createInvoice: (invoice: InvoiceRow) => Promise<InvoiceRow | null>;
  updateInvoice: (invoice: InvoiceRow) => Promise<InvoiceRow | null>;
};

function validateInvoice(invoice: InvoiceRow) {
  return {
    ...invoice,
    workspaceId: requireText(invoice.workspaceId, "Workspace"),
    invoiceNumber: requireText(invoice.invoiceNumber, "Invoice number"),
  };
}

export async function createInvoice(
  repository: InvoiceActionsRepository,
  invoice: InvoiceRow
): Promise<ActionResult<InvoiceRow>> {
  try {
    const created = await repository.createInvoice(validateInvoice(invoice));
    return created ? ok(created) : fail("Unable to create invoice.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to create invoice.");
  }
}

export async function updateInvoice(
  repository: InvoiceActionsRepository,
  invoice: InvoiceRow
): Promise<ActionResult<InvoiceRow>> {
  try {
    requireText(invoice.id, "Invoice");
    const updated = await repository.updateInvoice(validateInvoice(invoice));
    return updated ? ok(updated) : fail("Unable to update invoice.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to update invoice.");
  }
}

export async function markInvoicePaid(
  repository: InvoiceActionsRepository,
  invoice: InvoiceRow
): Promise<ActionResult<InvoiceRow>> {
  return updateInvoice(repository, {
    ...invoice,
    status: "Paid",
  });
}
