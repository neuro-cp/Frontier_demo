import type { InvoiceRow } from "@/lib/frontierInvoices";
import { fail, ok, requireText, type ActionResult } from "@/lib/actions/shared";

export type InvoiceActionsRepository = {
  createInvoice: (invoice: InvoiceRow) => Promise<InvoiceRow | null>;
  updateInvoice: (invoice: InvoiceRow) => Promise<InvoiceRow | null>;
  deleteInvoice: (invoiceId: string, workspaceId?: string) => Promise<boolean>;
};

function validateInvoice(invoice: InvoiceRow) {
  return {
    ...invoice,
    workspaceId: requireText(invoice.workspaceId, "Workspace"),
    invoiceNumber: requireText(invoice.invoiceNumber, "Invoice number"),
  };
}

export async function createInvoiceAction(
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

export async function updateInvoiceAction(
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
  return updateInvoiceAction(repository, {
    ...invoice,
    status: "Paid",
  });
}

export async function deleteInvoiceAction(
  repository: InvoiceActionsRepository,
  invoiceId: string,
  workspaceId?: string
): Promise<ActionResult<boolean>> {
  try {
    const deleted = await repository.deleteInvoice(
      requireText(invoiceId, "Invoice"),
      workspaceId
    );
    return deleted ? ok(true) : fail("Unable to delete invoice.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to delete invoice.");
  }
}

export const createInvoice = createInvoiceAction;
export const updateInvoice = updateInvoiceAction;
export const deleteInvoice = deleteInvoiceAction;
