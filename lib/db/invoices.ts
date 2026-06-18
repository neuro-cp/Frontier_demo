"use client";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { InvoiceLineItem, InvoiceRow } from "@/lib/frontierInvoices";
import { centsToMoneyString, moneyStringToCents } from "@/lib/db/money";
type Setter<T> = (value: T | ((current: T) => T)) => void;
type DbInvoiceLine = {
  id: string;
  description: string;
  quantity: number;
  unit_price_cents: number;
  sort_order: number;
};
type DbInvoice = {
  id: string;
  workspace_id: string;
  client_id: string | null;
  job_id: string | null;
  invoice_number: string;
  invoice_date: string;
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
  discount_type: InvoiceRow["discountType"];
  discount_value: number;
  tax_rate: number;
  footer_message: string | null;
  contact_message: string | null;
  status: InvoiceRow["status"];
  invoice_line_items?: DbInvoiceLine[];
};
const selectInvoice = "*, invoice_line_items(*)";
function dbToInvoice(i: DbInvoice): InvoiceRow {
  return { id: i.id, workspaceId: i.workspace_id, invoiceNumber: i.invoice_number, invoiceDate: i.invoice_date, jobId: i.job_id ?? undefined, jobName: undefined, sourceClientId: i.client_id ?? undefined, companyName: i.company_name ?? "", companyAddress: i.company_address ?? "", companyCity: i.company_city ?? "", companyState: i.company_state ?? "", companyZip: i.company_zip ?? "", companyPhone: i.company_phone ?? "", companyEmail: i.company_email ?? "", billToName: i.bill_to_name ?? "", billToCompany: i.bill_to_company ?? "", billToAddress: i.bill_to_address ?? "", billToCity: i.bill_to_city ?? "", billToState: i.bill_to_state ?? "", billToZip: i.bill_to_zip ?? "", billToPhone: i.bill_to_phone ?? "", billToEmail: i.bill_to_email ?? "", lineItems: (i.invoice_line_items ?? []).sort((a, b) => a.sort_order - b.sort_order).map((l) => ({ id: l.id, description: l.description, quantity: Number(l.quantity), unitPrice: centsToMoneyString(l.unit_price_cents) })), discountType: i.discount_type, discountValue: String(i.discount_value ?? 0), taxRate: String(i.tax_rate ?? 0), footerMessage: i.footer_message ?? "", contactMessage: i.contact_message ?? "", status: i.status };
}
function invoiceToDb(i: InvoiceRow) {
  return { id: i.id, workspace_id: i.workspaceId, client_id: i.sourceClientId ?? null, job_id: i.jobId ?? null, invoice_number: i.invoiceNumber, invoice_date: i.invoiceDate, company_name: i.companyName, company_address: i.companyAddress, company_city: i.companyCity, company_state: i.companyState, company_zip: i.companyZip, company_phone: i.companyPhone, company_email: i.companyEmail, bill_to_name: i.billToName, bill_to_company: i.billToCompany, bill_to_address: i.billToAddress, bill_to_city: i.billToCity, bill_to_state: i.billToState, bill_to_zip: i.billToZip, bill_to_phone: i.billToPhone, bill_to_email: i.billToEmail, discount_type: i.discountType, discount_value: Number(i.discountValue) || 0, tax_rate: Number(i.taxRate) || 0, footer_message: i.footerMessage, contact_message: i.contactMessage, status: i.status };
}
export function createInvoicesRepository({ isSignedIn, supabase, localInvoices, setLocalInvoices }: { isSignedIn: boolean; supabase: SupabaseClient | null; localInvoices: InvoiceRow[]; setLocalInvoices: Setter<InvoiceRow[]> }) {
  const useDb = isSignedIn && supabase;
  function invoiceLinesToRpcPayload(invoice: InvoiceRow) {
    return invoice.lineItems.map((l: InvoiceLineItem, index) => ({
      id: l.id,
      description: l.description,
      quantity: l.quantity,
      unit_price_cents: moneyStringToCents(l.unitPrice),
      sort_order: index,
    }));
  }
  async function saveInvoiceWithLines(invoice: InvoiceRow) {
    if (!useDb) return invoice;
    const { error } = await supabase.rpc("upsert_invoice_with_lines", {
      invoice_payload: invoiceToDb(invoice),
      line_items_payload: invoiceLinesToRpcPayload(invoice),
    });
    if (error) throw new Error(error.message || "Unable to save invoice.");
    return invoice;
  }
  return {
    async getInvoices(workspaceId: string) {
      if (!useDb) return localInvoices.filter((i) => i.workspaceId === workspaceId);
      const { data, error } = await supabase.from("invoices").select(selectInvoice).eq("workspace_id", workspaceId).order("invoice_date", { ascending: false });
      if (error) throw new Error(error.message || "Unable to load invoices.");
      return (data ?? []).map(dbToInvoice);
    },
    async getInvoiceById(id: string, workspaceId?: string) {
      if (!useDb) return localInvoices.find((i) => i.id === id && (!workspaceId || i.workspaceId === workspaceId)) ?? null;
      let query = supabase.from("invoices").select(selectInvoice).eq("id", id);
      if (workspaceId) query = query.eq("workspace_id", workspaceId);
      const { data, error } = await query.maybeSingle();
      if (error) throw new Error(error.message || "Unable to load invoice.");
      return data ? dbToInvoice(data) : null;
    },
    async createInvoice(invoice: InvoiceRow) {
      if (!useDb) return setLocalInvoices((c) => [...c, invoice]), invoice;
      return saveInvoiceWithLines(invoice);
    },
    async updateInvoice(invoice: InvoiceRow) {
      if (!useDb) return setLocalInvoices((c) => c.map((i) => i.id === invoice.id ? invoice : i)), invoice;
      return saveInvoiceWithLines(invoice);
    },
    async deleteInvoice(id: string) {
      if (!useDb) return setLocalInvoices((c) => c.filter((i) => i.id !== id)), true;
      const { error } = await supabase.from("invoices").delete().eq("id", id);
      if (error) throw new Error(error.message || "Unable to delete invoice.");
      return true;
    },
  };
}
