import { readStoredJson, storageKeys, writeStoredJson } from "@/lib/clientStorage";

export const invoiceStatuses = ["Estimate", "Draft", "Sent", "Overdue", "Paid"] as const;
export const discountTypes = ["None", "Percent", "Fixed"] as const;

export type InvoiceStatus = (typeof invoiceStatuses)[number];
export type DiscountType = (typeof discountTypes)[number];

export type InvoiceLineItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: string;
};

export type InvoiceRow = {
  id: string;
  workspaceId: string;
  invoiceNumber: string;
  invoiceDate: string;

  jobId?: string;
  jobName?: string;
  sourceClientId?: string;

  companyName: string;
  companyAddress: string;
  companyCity: string;
  companyState: string;
  companyZip: string;
  companyPhone: string;
  companyEmail: string;

  billToName: string;
  billToCompany: string;
  billToAddress: string;
  billToCity: string;
  billToState: string;
  billToZip: string;
  billToPhone: string;
  billToEmail: string;

  lineItems: InvoiceLineItem[];

  discountType: DiscountType;
  discountValue: string;
  taxRate: string;

  footerMessage: string;
  contactMessage: string;
  status: InvoiceStatus;
};

export type InvoiceSetupDraft = Omit<
  InvoiceRow,
  "lineItems" | "discountType" | "discountValue" | "taxRate" | "status"
>;

export function moneyToNumber(value: string | number | null | undefined) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (!value) return 0;

  return Number(value.replace(/[$,%\s,]/g, "")) || 0;
}

export function formatCurrency(value: number) {
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatMoneyNumber(value: number) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function getInvoiceClientName(invoice: Pick<InvoiceRow, "billToCompany" | "billToName">) {
  return invoice.billToCompany || invoice.billToName || "-";
}

export function getLineTotal(item: InvoiceLineItem) {
  return item.quantity * moneyToNumber(item.unitPrice);
}

export function getSubtotal(lineItems: InvoiceLineItem[]) {
  return lineItems.reduce((total, item) => total + getLineTotal(item), 0);
}

export function getDiscountAmount(
  subtotal: number,
  discountType: DiscountType,
  discountValue: string
) {
  const value = moneyToNumber(discountValue);

  if (discountType === "Percent") {
    return Math.min(subtotal * (value / 100), subtotal);
  }

  if (discountType === "Fixed") {
    return Math.min(value, subtotal);
  }

  return 0;
}

export function getTaxAmount(afterDiscountSubtotal: number, taxRate: string) {
  const rate = moneyToNumber(taxRate);
  return afterDiscountSubtotal * (rate / 100);
}

export function getInvoiceTotals(invoice: InvoiceRow) {
  const subtotal = getSubtotal(invoice.lineItems || []);
  const discount = getDiscountAmount(
    subtotal,
    invoice.discountType || "None",
    invoice.discountValue || "0"
  );
  const taxableSubtotal = Math.max(subtotal - discount, 0);
  const tax = getTaxAmount(taxableSubtotal, invoice.taxRate || "0");
  const total = taxableSubtotal + tax;

  return {
    subtotal,
    discount,
    taxableSubtotal,
    tax,
    total,
  };
}

export function safeParseInvoices(value: string | null): InvoiceRow[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function loadSavedInvoices() {
  return readStoredJson(storageKeys.invoices, [] as InvoiceRow[]);
}

export function saveSavedInvoices(invoices: InvoiceRow[]) {
  writeStoredJson(storageKeys.invoices, invoices);
}
