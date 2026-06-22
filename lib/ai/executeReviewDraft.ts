import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { createClientAction, type ClientActionsRepository } from "@/lib/actions/clients";
import { createExpenseAction, type ExpenseActionsRepository } from "@/lib/actions/expenses";
import { createInvoiceAction, type InvoiceActionsRepository } from "@/lib/actions/invoices";
import { createJobAction, type JobActionsRepository } from "@/lib/actions/jobs";
import type { SuggestedAction } from "@/lib/ai/types";
import type { ClientRow } from "@/lib/clientTypes";
import type { AiReviewDraft } from "@/lib/db/aiReviewDrafts";
import type { ExpenseRow } from "@/lib/db/expenses";
import type { InvoiceLineItem, InvoiceRow, InvoiceStatus } from "@/lib/frontierInvoices";
import type { Job, JobMaterial, JobStatus } from "@/lib/jobTypes";

export type ReviewDraftExecutionResult = {
  executedActions: Array<{
    type: string;
    recordId: string;
    label: string;
  }>;
};

type ExecuteReviewDraftInput = {
  draft: AiReviewDraft;
  serviceClient: SupabaseClient;
};

const executableActionTypes = new Set([
  "create_client",
  "update_client",
  "create_job",
  "update_job",
  "create_invoice",
  "update_invoice",
  "create_expense",
  "update_inventory",
  "create_calendar_event",
]);

function textValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function optionalTextValue(value: unknown) {
  const text = textValue(value);
  return text || "";
}

function numberValue(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const numericValue = Number(value.replace(/[$,%\s,]/g, ""));
    return Number.isFinite(numericValue) ? numericValue : 0;
  }
  return 0;
}

function dateValue(value: unknown) {
  const text = textValue(value);
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : "";
}

function statusValue<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T
) {
  const text = textValue(value);
  return allowed.includes(text as T) ? (text as T) : fallback;
}

function moneyStringToCents(value: unknown) {
  return Math.round(numberValue(value) * 100);
}

function centsToMoneyString(value: number | null | undefined) {
  const cents = Number.isFinite(value) ? value ?? 0 : 0;
  return (cents / 100).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

function mapDatabaseClientToClientRow(client: {
  id: string;
  workspace_id: string;
  name: string;
  status: string;
  balance_cents: number | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  notes: string | null;
  latitude: number | null;
  longitude: number | null;
}): ClientRow {
  const balanceCents = client.balance_cents ?? 0;
  return {
    id: client.id,
    workspaceId: client.workspace_id,
    name: client.name,
    status: client.status,
    balance: centsToMoneyString(balanceCents),
    email: client.email ?? "",
    phone: client.phone ?? "",
    address: client.address ?? "",
    city: client.city ?? "",
    state: client.state ?? "",
    zip: client.zip ?? "",
    notes: client.notes ?? "",
    latitude: client.latitude ?? undefined,
    longitude: client.longitude ?? undefined,
  };
}

function mapDatabaseExpenseToExpenseRow(expense: {
  id: string;
  workspace_id: string;
  description: string;
  category: string;
  amount_cents: number;
}): ExpenseRow {
  return {
    id: expense.id,
    workspaceId: expense.workspace_id,
    description: expense.description,
    category: expense.category,
    amount: centsToMoneyString(expense.amount_cents),
  };
}

function mapDatabaseJobToJob(row: {
  id: string;
  workspace_id: string;
  client_id: string | null;
  client_name_snapshot: string | null;
  name: string;
  status: JobStatus;
  estimated_value_cents: number;
  scheduled_date: string | null;
  notes: string | null;
  job_materials?: Array<{ name: string; quantity: number }>;
}): Job {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    clientId: row.client_id ?? undefined,
    client: row.client_name_snapshot ?? "",
    name: row.name,
    status: row.status,
    value: centsToMoneyString(row.estimated_value_cents),
    date: row.scheduled_date ?? "",
    notes: row.notes ?? "",
    materials: (row.job_materials ?? []).map((material) => ({
      name: material.name,
      quantity: Number(material.quantity),
    })),
  };
}

function mapDatabaseInvoiceToInvoice(row: {
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
  status: InvoiceStatus;
  invoice_line_items?: Array<{
    id: string;
    description: string;
    quantity: number;
    unit_price_cents: number;
    sort_order: number;
  }>;
}): InvoiceRow {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    invoiceNumber: row.invoice_number,
    invoiceDate: row.invoice_date,
    jobId: row.job_id ?? undefined,
    sourceClientId: row.client_id ?? undefined,
    companyName: row.company_name ?? "",
    companyAddress: row.company_address ?? "",
    companyCity: row.company_city ?? "",
    companyState: row.company_state ?? "",
    companyZip: row.company_zip ?? "",
    companyPhone: row.company_phone ?? "",
    companyEmail: row.company_email ?? "",
    billToName: row.bill_to_name ?? "",
    billToCompany: row.bill_to_company ?? "",
    billToAddress: row.bill_to_address ?? "",
    billToCity: row.bill_to_city ?? "",
    billToState: row.bill_to_state ?? "",
    billToZip: row.bill_to_zip ?? "",
    billToPhone: row.bill_to_phone ?? "",
    billToEmail: row.bill_to_email ?? "",
    lineItems: (row.invoice_line_items ?? [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((line) => ({
        id: line.id,
        description: line.description,
        quantity: Number(line.quantity),
        unitPrice: centsToMoneyString(line.unit_price_cents),
      })),
    discountType: row.discount_type,
    discountValue: String(row.discount_value ?? 0),
    taxRate: String(row.tax_rate ?? 0),
    footerMessage: row.footer_message ?? "",
    contactMessage: row.contact_message ?? "",
    status: row.status,
  };
}

function createServerClientRepository(
  serviceClient: SupabaseClient
): ClientActionsRepository {
  return {
    async createClient(client) {
      const { data, error } = await serviceClient
        .from("clients")
        .insert({
          id: client.id,
          workspace_id: client.workspaceId,
          name: client.name,
          status: client.status,
          balance_cents: moneyStringToCents(client.balance),
          email: client.email?.trim() || null,
          phone: client.phone?.trim() || null,
          address: client.address?.trim() || null,
          city: client.city?.trim() || null,
          state: client.state?.trim() || null,
          zip: client.zip?.trim() || null,
          notes: client.notes?.trim() || null,
          latitude: client.latitude ?? null,
          longitude: client.longitude ?? null,
        })
        .select(
          "id, workspace_id, name, status, balance_cents, email, phone, address, city, state, zip, notes, latitude, longitude"
        )
        .single();

      if (error || !data) {
        throw new Error(error?.message || "Unable to create client.");
      }

      return mapDatabaseClientToClientRow(data);
    },
    async updateClient() {
      throw new Error("update_client execution is not enabled yet.");
    },
    async deleteClient() {
      throw new Error("delete_client execution is forbidden.");
    },
  };
}

function createServerExpenseRepository(
  serviceClient: SupabaseClient
): ExpenseActionsRepository {
  return {
    async createExpense(expense) {
      const { data, error } = await serviceClient
        .from("expenses")
        .insert({
          id: expense.id,
          workspace_id: expense.workspaceId,
          description: expense.description,
          category: expense.category,
          amount_cents: moneyStringToCents(expense.amount),
          expense_date: null,
          notes: null,
        })
        .select("*")
        .single();

      if (error || !data) throw new Error(error?.message || "Unable to create expense.");
      return mapDatabaseExpenseToExpenseRow(data);
    },
    async updateExpense() {
      throw new Error("update_expense execution is not enabled yet.");
    },
    async deleteExpense() {
      throw new Error("delete_expense execution is forbidden.");
    },
  };
}

function createServerJobRepository(
  serviceClient: SupabaseClient
): JobActionsRepository {
  return {
    async createJob(job) {
      const { data: insertedJob, error: jobError } = await serviceClient
        .from("jobs")
        .insert({
          id: job.id,
          workspace_id: job.workspaceId,
          client_id: job.clientId ?? null,
          client_name_snapshot: job.client || null,
          name: job.name,
          status: job.status,
          estimated_value_cents: moneyStringToCents(job.value),
          scheduled_date: job.date || null,
          notes: job.notes?.trim() || null,
        })
        .select("*")
        .single();

      if (jobError || !insertedJob) {
        throw new Error(jobError?.message || "Unable to create job.");
      }

      try {
        if (job.materials.length > 0) {
          const { error: materialsError } = await serviceClient
            .from("job_materials")
            .insert(
              job.materials.map((material) => ({
                workspace_id: job.workspaceId,
                job_id: insertedJob.id,
                name: material.name,
                quantity: material.quantity,
              }))
            );
          if (materialsError) throw materialsError;
        }
      } catch (error) {
        await serviceClient.from("jobs").delete().eq("id", insertedJob.id);
        throw error;
      }

      const { data, error } = await serviceClient
        .from("jobs")
        .select("*, job_materials(*)")
        .eq("id", insertedJob.id)
        .single();

      if (error || !data) throw new Error(error?.message || "Unable to load job.");
      return mapDatabaseJobToJob(data);
    },
    async updateJob() {
      throw new Error("update_job execution is not enabled yet.");
    },
    async deleteJob() {
      throw new Error("delete_job execution is forbidden.");
    },
  };
}

function createServerInvoiceRepository(
  serviceClient: SupabaseClient
): InvoiceActionsRepository {
  return {
    async createInvoice(invoice) {
      const { data: insertedInvoice, error: invoiceError } = await serviceClient
        .from("invoices")
        .insert({
          id: invoice.id,
          workspace_id: invoice.workspaceId,
          client_id: invoice.sourceClientId ?? null,
          job_id: invoice.jobId ?? null,
          invoice_number: invoice.invoiceNumber,
          invoice_date: invoice.invoiceDate,
          company_name: invoice.companyName || null,
          company_address: invoice.companyAddress || null,
          company_city: invoice.companyCity || null,
          company_state: invoice.companyState || null,
          company_zip: invoice.companyZip || null,
          company_phone: invoice.companyPhone || null,
          company_email: invoice.companyEmail || null,
          bill_to_name: invoice.billToName || null,
          bill_to_company: invoice.billToCompany || null,
          bill_to_address: invoice.billToAddress || null,
          bill_to_city: invoice.billToCity || null,
          bill_to_state: invoice.billToState || null,
          bill_to_zip: invoice.billToZip || null,
          bill_to_phone: invoice.billToPhone || null,
          bill_to_email: invoice.billToEmail || null,
          discount_type: invoice.discountType,
          discount_value: numberValue(invoice.discountValue),
          tax_rate: numberValue(invoice.taxRate),
          footer_message: invoice.footerMessage || null,
          contact_message: invoice.contactMessage || null,
          status: invoice.status,
        })
        .select("*")
        .single();

      if (invoiceError || !insertedInvoice) {
        throw new Error(invoiceError?.message || "Unable to create invoice.");
      }

      try {
        if (invoice.lineItems.length > 0) {
          const { error: linesError } = await serviceClient
            .from("invoice_line_items")
            .insert(
              invoice.lineItems.map((line, index) => ({
                id: line.id,
                workspace_id: invoice.workspaceId,
                invoice_id: insertedInvoice.id,
                description: line.description,
                quantity: line.quantity,
                unit_price_cents: moneyStringToCents(line.unitPrice),
                sort_order: index,
              }))
            );
          if (linesError) throw linesError;
        }
      } catch (error) {
        await serviceClient.from("invoices").delete().eq("id", insertedInvoice.id);
        throw error;
      }

      const { data, error } = await serviceClient
        .from("invoices")
        .select("*, invoice_line_items(*)")
        .eq("id", insertedInvoice.id)
        .single();

      if (error || !data) throw new Error(error?.message || "Unable to load invoice.");
      return mapDatabaseInvoiceToInvoice(data);
    },
    async updateInvoice() {
      throw new Error("update_invoice execution is not enabled yet.");
    },
    async deleteInvoice() {
      throw new Error("delete_invoice execution is forbidden.");
    },
  };
}

function validateAction(action: SuggestedAction) {
  if (!executableActionTypes.has(action.type)) {
    throw new Error(`Action type ${action.type} is not allowed for execution.`);
  }
  if (action.type.startsWith("delete_")) {
    throw new Error("Delete actions are forbidden.");
  }
  if (
    action.type !== "create_client" &&
    action.type !== "create_expense" &&
    action.type !== "create_job" &&
    action.type !== "create_invoice"
  ) {
    throw new Error(`${action.type} execution is not enabled yet.`);
  }
}

async function executeCreateClient(
  serviceClient: SupabaseClient,
  workspaceId: string,
  action: SuggestedAction
) {
  const payload = action.payload;
  const name = textValue(payload.name);
  if (!name) throw new Error("Client name is required.");

  const client: ClientRow = {
    id: crypto.randomUUID(),
    workspaceId,
    name,
    status: optionalTextValue(payload.status) || "Active",
    balance: String(numberValue(payload.balance)),
    email: optionalTextValue(payload.email),
    phone: optionalTextValue(payload.phone),
    address: optionalTextValue(payload.address),
    city: optionalTextValue(payload.city),
    state: optionalTextValue(payload.state),
    zip: optionalTextValue(payload.zip),
    notes: optionalTextValue(payload.notes),
  };

  const result = await createClientAction(
    createServerClientRepository(serviceClient),
    client
  );

  if (!result.ok) throw new Error(result.error);
  return {
    type: action.type,
    recordId: result.data.id,
    label: result.data.name,
  };
}

async function executeCreateExpense(
  serviceClient: SupabaseClient,
  workspaceId: string,
  action: SuggestedAction
) {
  const payload = action.payload;
  const description =
    textValue(payload.description) ||
    textValue(payload.vendor) ||
    textValue(payload.name) ||
    "AI expense";
  const amount = numberValue(payload.amount);
  if (amount <= 0) throw new Error("Expense amount is required.");

  const expense: ExpenseRow = {
    id: crypto.randomUUID(),
    workspaceId,
    description,
    category: optionalTextValue(payload.category) || "AI Review",
    amount: String(amount),
  };

  const result = await createExpenseAction(
    createServerExpenseRepository(serviceClient),
    expense
  );

  if (!result.ok) throw new Error(result.error);
  return {
    type: action.type,
    recordId: result.data.id ?? "",
    label: result.data.description,
  };
}

async function findClientByName(
  serviceClient: SupabaseClient,
  workspaceId: string,
  name: string
) {
  if (!name) return null;
  const { data, error } = await serviceClient
    .from("clients")
    .select("id, name")
    .eq("workspace_id", workspaceId)
    .ilike("name", name)
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message || "Unable to match client.");
  return data as { id: string; name: string } | null;
}

function materialsFromPayload(value: unknown): JobMaterial[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string") {
        return { name: item.trim(), quantity: 1 };
      }
      if (typeof item === "object" && item !== null) {
        const record = item as Record<string, unknown>;
        return {
          name: textValue(record.name),
          quantity: numberValue(record.quantity) || 1,
        };
      }
      return { name: "", quantity: 0 };
    })
    .filter((item) => item.name);
}

async function executeCreateJob(
  serviceClient: SupabaseClient,
  workspaceId: string,
  action: SuggestedAction
) {
  const payload = action.payload;
  const name = textValue(payload.name) || textValue(payload.title);
  if (!name) throw new Error("Job name is required.");

  const matchedClient = await findClientByName(
    serviceClient,
    workspaceId,
    textValue(payload.clientName) || textValue(payload.client)
  );

  const job: Job = {
    id: crypto.randomUUID(),
    workspaceId,
    clientId: matchedClient?.id,
    client: matchedClient?.name ?? optionalTextValue(payload.clientName),
    name,
    status: statusValue(
      payload.status,
      ["Lead", "Quoted", "Scheduled", "Completed", "Paid"] as const,
      "Lead"
    ),
    value: String(numberValue(payload.value) || numberValue(payload.amount)),
    date: dateValue(payload.date) || dateValue(payload.scheduledDate),
    materials: materialsFromPayload(payload.materials),
    notes: optionalTextValue(payload.notes),
  };

  const result = await createJobAction(createServerJobRepository(serviceClient), job);
  if (!result.ok) throw new Error(result.error);
  return {
    type: action.type,
    recordId: result.data.id,
    label: result.data.name,
  };
}

function lineItemsFromPayload(payload: Record<string, unknown>): InvoiceLineItem[] {
  const rawLineItems = Array.isArray(payload.lineItems) ? payload.lineItems : [];
  const lineItems = rawLineItems
    .map((item) => {
      if (typeof item === "string") {
        return {
          id: crypto.randomUUID(),
          description: item.trim(),
          quantity: 1,
          unitPrice: "0",
        };
      }
      if (typeof item === "object" && item !== null) {
        const record = item as Record<string, unknown>;
        return {
          id: crypto.randomUUID(),
          description: textValue(record.description) || textValue(record.name),
          quantity: numberValue(record.quantity) || 1,
          unitPrice: String(
            numberValue(record.unitPrice) ||
              numberValue(record.price) ||
              numberValue(record.amount)
          ),
        };
      }
      return null;
    })
    .filter((item): item is InvoiceLineItem => Boolean(item?.description));

  if (lineItems.length > 0) return lineItems;

  const description = textValue(payload.description) || "AI invoice item";
  return [
    {
      id: crypto.randomUUID(),
      description,
      quantity: 1,
      unitPrice: String(numberValue(payload.amount)),
    },
  ];
}

async function executeCreateInvoice(
  serviceClient: SupabaseClient,
  workspaceId: string,
  action: SuggestedAction
) {
  const payload = action.payload;
  const matchedClient = await findClientByName(
    serviceClient,
    workspaceId,
    textValue(payload.clientName) || textValue(payload.client)
  );
  const invoiceDate = dateValue(payload.invoiceDate) || new Date().toISOString().slice(0, 10);
  const invoice: InvoiceRow = {
    id: crypto.randomUUID(),
    workspaceId,
    invoiceNumber:
      textValue(payload.invoiceNumber) || `INV-AI-${Date.now().toString(36).toUpperCase()}`,
    invoiceDate,
    sourceClientId: matchedClient?.id,
    jobId: textValue(payload.jobId) || undefined,
    companyName: "",
    companyAddress: "",
    companyCity: "",
    companyState: "",
    companyZip: "",
    companyPhone: "",
    companyEmail: "",
    billToName: matchedClient?.name ?? optionalTextValue(payload.clientName),
    billToCompany: "",
    billToAddress: "",
    billToCity: "",
    billToState: "",
    billToZip: "",
    billToPhone: "",
    billToEmail: "",
    lineItems: lineItemsFromPayload(payload),
    discountType: "None",
    discountValue: "0",
    taxRate: String(numberValue(payload.taxRate)),
    footerMessage: "",
    contactMessage: "",
    status: "Draft",
  };

  const result = await createInvoiceAction(
    createServerInvoiceRepository(serviceClient),
    invoice
  );
  if (!result.ok) throw new Error(result.error);
  return {
    type: action.type,
    recordId: result.data.id,
    label: result.data.invoiceNumber,
  };
}

export async function executeReviewDraft({
  draft,
  serviceClient,
}: ExecuteReviewDraftInput): Promise<ReviewDraftExecutionResult> {
  if (draft.status !== "Approved") {
    throw new Error("Only approved review drafts can be executed.");
  }
  if (draft.executionStatus === "Executed") {
    throw new Error("Review draft has already been executed.");
  }
  if (draft.actions.length !== 1) {
    throw new Error("Execution currently requires exactly one action draft.");
  }

  const action = draft.actions[0];
  validateAction(action);
  const executedAction =
    action.type === "create_client"
      ? await executeCreateClient(serviceClient, draft.workspaceId, action)
      : action.type === "create_expense"
        ? await executeCreateExpense(serviceClient, draft.workspaceId, action)
        : action.type === "create_job"
          ? await executeCreateJob(serviceClient, draft.workspaceId, action)
          : await executeCreateInvoice(serviceClient, draft.workspaceId, action);

  return {
    executedActions: [executedAction],
  };
}
