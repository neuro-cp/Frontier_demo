"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useAuthSession } from "@/components/AuthSessionProvider";
import { useWorkspace } from "@/components/WorkspaceContext";
import {
  readStoredJson,
  removeStoredValue,
  storageKeys,
  useStoredJsonState,
} from "@/lib/clientStorage";
import { createClientsRepository } from "@/lib/db/clients";
import { createInvoicesRepository } from "@/lib/db/invoices";
import type { ClientRow as SharedClientRow } from "@/lib/clientTypes";
import type { InvoiceRow as SharedInvoiceRow } from "@/lib/frontierInvoices";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";


type InvoiceStatus = "Estimate" | "Draft" | "Sent" | "Overdue" | "Paid";
type DiscountType = "None" | "Percent" | "Fixed";

type InvoiceLineItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: string;
};

type InvoiceRow = {
  id: string;
  workspaceId: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  status: InvoiceStatus;

  companyName: string;
  companyAddress: string;
  companyCity: string;
  companyState: string;
  companyZip: string;
  companyPhone?: string;
  companyEmail?: string;

  sourceClientId?: string;
  billToCompany?: string;
  billToName?: string;
  billToAddress?: string;
  billToCity?: string;
  billToState?: string;
  billToZip?: string;
  billToPhone?: string;
  billToEmail?: string;

  jobId?: string;
  jobName?: string;
  jobLocation?: string;

  lineItems: InvoiceLineItem[];
  discountType: DiscountType;
  discountValue: string;
  taxRate: string;

  subtotal: string;
  discountAmount: string;
  taxAmount: string;
  total: string;

  notes?: string;
  terms?: string;
  contactMessage?: string;
};

type ClientRow = {
  id: string;
  workspaceId: string;
  name: string;
  status?: string;
  balance?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  notes?: string;
};

type InvoiceSetupDraft = Partial<InvoiceRow> & {
  id?: string;
  workspaceId?: string;
  lineItems?: InvoiceLineItem[];
  editExisting?: boolean;
};

function moneyToNumber(value: string | number | undefined) {
  if (typeof value === "number") return value;
  if (!value) return 0;
  return Number(String(value).replace(/[$,]/g, "")) || 0;
}

function formatMoney(value: number) {
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function getEmptyLineItem(): InvoiceLineItem {
  return {
    id: crypto.randomUUID(),
    description: "",
    quantity: 1,
    unitPrice: "",
  };
}

function cleanText(value: string | undefined) {
  return value?.trim() ?? "";
}

function getFallbackDraft(activeWorkspace: { id: string; name: string }) {
  return {
    id: crypto.randomUUID(),
    workspaceId: activeWorkspace.id,
    invoiceNumber: `INV-${Date.now().toString().slice(-5)}`,
    invoiceDate: todayString(),
    companyName: activeWorkspace.name ?? "",
    companyAddress: "",
    companyCity: "",
    companyState: "",
    companyZip: "",
  } satisfies InvoiceSetupDraft;
}

export default function InvoiceBuilderPage() {
  const router = useRouter();
  const { activeWorkspace } = useWorkspace();
  const { isSupabaseConfigured, user } = useAuthSession();
  const isDatabaseMode = Boolean(isSupabaseConfigured && user);
  const [savedInvoices, setSavedInvoices] = useStoredJsonState<InvoiceRow[]>(
    storageKeys.invoices,
    []
  );
  const [savedClients, setSavedClients] = useStoredJsonState<ClientRow[]>(
    storageKeys.clients,
    []
  );
  const [databaseClients, setDatabaseClients] = useState<SharedClientRow[]>([]);
  const [saveError, setSaveError] = useState("");
  const supabase = useMemo(() => (isDatabaseMode ? createBrowserSupabaseClient() : null), [isDatabaseMode]);
  const invoicesRepo = useMemo(() => createInvoicesRepository({ isSignedIn: isDatabaseMode, supabase, localInvoices: savedInvoices as unknown as SharedInvoiceRow[], setLocalInvoices: setSavedInvoices as unknown as (value: SharedInvoiceRow[] | ((current: SharedInvoiceRow[]) => SharedInvoiceRow[])) => void }), [isDatabaseMode, savedInvoices, setSavedInvoices, supabase]);
  const clientsRepo = useMemo(() => createClientsRepository({ isSignedIn: isDatabaseMode, supabase, localClients: savedClients as SharedClientRow[], setLocalClients: setSavedClients as unknown as (value: SharedClientRow[] | ((current: SharedClientRow[]) => SharedClientRow[])) => void }), [isDatabaseMode, savedClients, setSavedClients, supabase]);

  const [draft] = useState<InvoiceSetupDraft>(() => {
    return (
      readStoredJson<InvoiceSetupDraft | null>(storageKeys.invoiceDraft, null) ??
      getFallbackDraft(activeWorkspace)
    );
  });
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>(
    draft.lineItems && draft.lineItems.length > 0
      ? draft.lineItems
      : [getEmptyLineItem()]
  );
  const [discountType, setDiscountType] = useState<DiscountType>(
    draft.discountType ?? "None"
  );
  const [discountValue, setDiscountValue] = useState(
    draft.discountValue ?? ""
  );
  const [taxRate, setTaxRate] = useState(draft.taxRate ?? "");
  const [status, setStatus] = useState<InvoiceStatus>(draft.status ?? "Draft");

  useEffect(() => {
    if (!isDatabaseMode) return;
    let cancelled = false;
    clientsRepo.getClients(activeWorkspace.id).then((clients) => {
      if (!cancelled) setDatabaseClients(clients);
    }).catch((error) => {
      if (!cancelled) setSaveError(error instanceof Error ? error.message : "Unable to load clients.");
    });
    return () => { cancelled = true; };
  }, [activeWorkspace.id, clientsRepo, isDatabaseMode]);

  const totals = useMemo(() => {
    const subtotal = lineItems.reduce((sum, item) => {
      return sum + (Number(item.quantity) || 0) * moneyToNumber(item.unitPrice);
    }, 0);

    const rawDiscount = moneyToNumber(discountValue);
    const discountAmount =
      discountType === "Percent"
        ? subtotal * (rawDiscount / 100)
        : discountType === "Fixed"
          ? rawDiscount
          : 0;

    const taxableSubtotal = Math.max(subtotal - discountAmount, 0);
    const taxAmount = taxableSubtotal * (moneyToNumber(taxRate) / 100);
    const total = taxableSubtotal + taxAmount;

    return {
      subtotal,
      discountAmount,
      taxableSubtotal,
      taxAmount,
      total,
    };
  }, [discountType, discountValue, lineItems, taxRate]);

  function updateLineItem(itemId: string, field: keyof InvoiceLineItem, value: string) {
    setLineItems((current) =>
      current.map((item) =>
        item.id === itemId
          ? {
              ...item,
              [field]: field === "quantity" ? Number(value) || 0 : value,
            }
          : item
      )
    );
  }

  function addLineItem() {
    setLineItems((current) => [...current, getEmptyLineItem()]);
  }

  function removeLineItem(itemId: string) {
    setLineItems((current) =>
      current.length === 1 ? current : current.filter((item) => item.id !== itemId)
    );
  }

  async function upsertClientFromInvoice(invoice: InvoiceRow) {
    const existingClients = isDatabaseMode ? databaseClients : savedClients;
    const existingClientId = cleanText(invoice.sourceClientId);

    const matchingClientById = existingClientId
      ? existingClients.find(
          (client) =>
            client.id === existingClientId &&
            client.workspaceId === invoice.workspaceId
        )
      : undefined;

    if (matchingClientById) {
      const updatedClients = existingClients.map((client) =>
        client.id === matchingClientById.id
          ? {
              ...client,
              status: client.status === "Lead" ? "Active" : client.status,
              balance: invoice.total,
              email: invoice.billToEmail || client.email,
              phone: invoice.billToPhone || client.phone,
              address: invoice.billToAddress || client.address,
              city: invoice.billToCity || client.city,
              state: invoice.billToState || client.state,
              zip: invoice.billToZip || client.zip,
            }
          : client
      );

      if (!isDatabaseMode) setSavedClients(updatedClients);
      else {
        const saved = await clientsRepo.updateClient(updatedClients.find((client) => client.id === matchingClientById.id) as SharedClientRow);
        if (saved) setDatabaseClients((current) => current.map((client) => client.id === saved.id ? saved : client));
      }
      return matchingClientById.id;
    }

    // Legacy/manual invoices may only identify the client by bill-to name.
    const clientName = cleanText(invoice.billToCompany) || cleanText(invoice.billToName);

    if (!clientName) return undefined;

    const matchingClient = existingClients.find(
      (client) =>
        client.workspaceId === invoice.workspaceId &&
        client.name.trim().toLowerCase() === clientName.toLowerCase()
    );

    if (matchingClient) {
      const updatedClients = existingClients.map((client) =>
        client.id === matchingClient.id
          ? {
              ...client,
              status: client.status === "Lead" ? "Active" : client.status,
              balance: invoice.total,
              email: invoice.billToEmail || client.email,
              phone: invoice.billToPhone || client.phone,
              address: invoice.billToAddress || client.address,
              city: invoice.billToCity || client.city,
              state: invoice.billToState || client.state,
              zip: invoice.billToZip || client.zip,
            }
          : client
      );

      if (!isDatabaseMode) setSavedClients(updatedClients);
      else {
        const saved = await clientsRepo.updateClient(updatedClients.find((client) => client.id === matchingClient.id) as SharedClientRow);
        if (saved) setDatabaseClients((current) => current.map((client) => client.id === saved.id ? saved : client));
      }
      return matchingClient.id;
    }

    const newClient: ClientRow = {
      id: crypto.randomUUID(),
      workspaceId: invoice.workspaceId,
      name: clientName,
      status: "Active",
      balance: invoice.total,
      email: invoice.billToEmail ?? "",
      phone: invoice.billToPhone ?? "",
      address: invoice.billToAddress ?? "",
      city: invoice.billToCity ?? "",
      state: invoice.billToState ?? "",
      zip: invoice.billToZip ?? "",
      notes: `Created from ${invoice.invoiceNumber}`,
    };

    const created = await clientsRepo.createClient(newClient as SharedClientRow);
    if (!isDatabaseMode) setSavedClients([...existingClients, newClient]);
    else if (created) setDatabaseClients((current) => [...current, created]);
    return newClient.id;
  }

  async function saveInvoice() {
    if (!draft) return;

    const validLineItems = lineItems.filter(
      (item) => item.description.trim() || moneyToNumber(item.unitPrice) > 0
    );

    if (validLineItems.length === 0) {
      alert("Add at least one line item before saving.");
      return;
    }

    const invoiceBeforeClientUpdate: InvoiceRow = {
      id: draft.id ?? `invoice-${Date.now()}`,
      workspaceId: draft.workspaceId ?? activeWorkspace.id,
      invoiceNumber: draft.invoiceNumber ?? `INV-${Date.now().toString().slice(-5)}`,
      invoiceDate: draft.invoiceDate ?? todayString(),
      dueDate: draft.dueDate ?? "",
      status,

      companyName: draft.companyName ?? activeWorkspace.name ?? "",
      companyAddress: draft.companyAddress ?? "",
      companyCity: draft.companyCity ?? "",
      companyState: draft.companyState ?? "",
      companyZip: draft.companyZip ?? "",
      companyPhone: draft.companyPhone ?? "",
      companyEmail: draft.companyEmail ?? "",

      sourceClientId: draft.sourceClientId ?? "",
      billToCompany: draft.billToCompany ?? "",
      billToName: draft.billToName ?? "",
      billToAddress: draft.billToAddress ?? "",
      billToCity: draft.billToCity ?? "",
      billToState: draft.billToState ?? "",
      billToZip: draft.billToZip ?? "",
      billToPhone: draft.billToPhone ?? "",
      billToEmail: draft.billToEmail ?? "",

      jobId: draft.jobId ?? "",
      jobName: draft.jobName ?? "",
      jobLocation: draft.jobLocation ?? "",

      lineItems: validLineItems.map((item) => ({
        id: item.id,
        description: item.description.trim(),
        quantity: Number(item.quantity) || 1,
        unitPrice: item.unitPrice.trim(),
      })),
      discountType,
      discountValue,
      taxRate,

      subtotal: formatMoney(totals.subtotal),
      discountAmount: formatMoney(totals.discountAmount),
      taxAmount: formatMoney(totals.taxAmount),
      total: formatMoney(totals.total),

      notes: draft.notes ?? "",
      terms: draft.terms ?? "",
      contactMessage: draft.contactMessage ?? "",
    };

    setSaveError("");

    try {
      const resolvedClientId = await upsertClientFromInvoice(invoiceBeforeClientUpdate);

      const savedInvoice: InvoiceRow = {
        ...invoiceBeforeClientUpdate,
        sourceClientId: resolvedClientId ?? invoiceBeforeClientUpdate.sourceClientId ?? "",
      };

      const isEditingExisting = Boolean(draft.editExisting);
      const updatedInvoices = isEditingExisting
        ? savedInvoices.map((invoice) => invoice.id === savedInvoice.id ? savedInvoice : invoice)
        : [
            ...savedInvoices.filter((invoice) => invoice.id !== savedInvoice.id),
            savedInvoice,
          ];

      const saved = isEditingExisting
        ? await invoicesRepo.updateInvoice(savedInvoice as unknown as SharedInvoiceRow)
        : await invoicesRepo.createInvoice(savedInvoice as unknown as SharedInvoiceRow);
      if (!saved) return;
      if (!isDatabaseMode) setSavedInvoices(updatedInvoices);
      removeStoredValue(storageKeys.invoiceDraft);
      router.push(`/invoices/${savedInvoice.id}`);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Unable to save invoice.");
    }
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#020617] text-white">
      <div className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-400">Invoices / Builder</p>
            <h1 className="text-2xl font-semibold">Build Invoice</h1>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/invoices/new"
              className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-200 hover:bg-gray-900"
            >
              Back
            </Link>
            <button
              type="button"
              onClick={saveInvoice}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
            >
              Save Invoice
            </button>
          </div>
        </div>

        {saveError && (
          <div className="rounded-lg border border-red-900 bg-red-950/50 p-3 text-sm text-red-200">
            {saveError}
          </div>
        )}

        <div className="grid gap-4 rounded-2xl border border-gray-800 bg-gray-950 p-4 sm:grid-cols-4">
          <div>
            <p className="text-xs uppercase text-gray-500">Invoice</p>
            <p className="mt-1 font-medium">{draft.invoiceNumber}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-500">Date</p>
            <p className="mt-1 font-medium">{draft.invoiceDate}</p>
          </div>
          <label className="block">
            <span className="text-xs uppercase text-gray-500">Status</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as InvoiceStatus)}
              className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white"
            >
              <option>Draft</option>
              <option>Estimate</option>
              <option>Sent</option>
              <option>Overdue</option>
              <option>Paid</option>
            </select>
          </label>
          <div>
            <p className="text-xs uppercase text-gray-500">Total</p>
            <p className="mt-1 text-xl font-semibold">{formatMoney(totals.total)}</p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-2xl border border-gray-800 bg-gray-950 p-4">
            <h2 className="text-lg font-semibold">From</h2>
            <div className="mt-3 space-y-1 text-sm text-gray-300">
              <p className="font-medium text-white">{draft.companyName}</p>
              <p>{draft.companyAddress}</p>
              <p>
                {[draft.companyCity, draft.companyState, draft.companyZip]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              <p>{draft.companyPhone}</p>
              <p>{draft.companyEmail}</p>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-800 bg-gray-950 p-4">
            <h2 className="text-lg font-semibold">Bill To</h2>
            <div className="mt-3 space-y-1 text-sm text-gray-300">
              <p className="font-medium text-white">
                {draft.billToCompany || draft.billToName || "No client selected"}
              </p>
              <p>{draft.billToAddress}</p>
              <p>
                {[draft.billToCity, draft.billToState, draft.billToZip]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              <p>{draft.billToPhone}</p>
              <p>{draft.billToEmail}</p>
            </div>
          </section>
        </div>

        <section className="rounded-2xl border border-gray-800 bg-gray-950 p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Line Items</h2>
            <button
              type="button"
              onClick={addLineItem}
              className="rounded-lg border border-blue-500 px-3 py-2 text-sm text-blue-300 hover:bg-blue-950"
            >
              Add Item
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {lineItems.map((item) => (
              <div
                key={item.id}
                className="grid gap-3 rounded-xl border border-gray-800 bg-gray-900 p-3 md:grid-cols-[1fr_110px_140px_90px]"
              >
                <label className="block">
                  <span className="text-xs text-gray-500">Description</span>
                  <input
                    value={item.description}
                    onChange={(event) =>
                      updateLineItem(item.id, "description", event.target.value)
                    }
                    className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white"
                    placeholder="Labor, materials, service..."
                  />
                </label>

                <label className="block">
                  <span className="text-xs text-gray-500">Qty</span>
                  <input
                    type="number"
                    min="0"
                    value={item.quantity}
                    onChange={(event) => updateLineItem(item.id, "quantity", event.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white"
                  />
                </label>

                <label className="block">
                  <span className="text-xs text-gray-500">Unit Price</span>
                  <input
                    value={item.unitPrice}
                    onChange={(event) => updateLineItem(item.id, "unitPrice", event.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white"
                    placeholder="0.00"
                  />
                </label>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeLineItem(item.id)}
                    className="w-full rounded-lg border border-red-700 px-3 py-2 text-sm text-red-300 hover:bg-red-950"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 rounded-2xl border border-gray-800 bg-gray-950 p-4 lg:grid-cols-[1fr_360px]">
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block">
              <span className="text-xs text-gray-500">Discount Type</span>
              <select
                value={discountType}
                onChange={(event) => setDiscountType(event.target.value as DiscountType)}
                className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white"
              >
                <option>None</option>
                <option>Percent</option>
                <option>Fixed</option>
              </select>
            </label>

            <label className="block">
              <span className="text-xs text-gray-500">Discount Value</span>
              <input
                value={discountValue}
                onChange={(event) => setDiscountValue(event.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white"
                placeholder="0"
              />
            </label>

            <label className="block">
              <span className="text-xs text-gray-500">Tax Rate %</span>
              <input
                value={taxRate}
                onChange={(event) => setTaxRate(event.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white"
                placeholder="0"
              />
            </label>
          </div>

          <div className="space-y-2 rounded-xl border border-gray-800 bg-gray-900 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Subtotal</span>
              <span>{formatMoney(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Discount</span>
              <span>-{formatMoney(totals.discountAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Tax</span>
              <span>{formatMoney(totals.taxAmount)}</span>
            </div>
            <div className="border-t border-gray-700 pt-2">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>{formatMoney(totals.total)}</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
