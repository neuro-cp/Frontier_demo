"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useWorkspace } from "@/components/WorkspaceContext";
import { clients as defaultClients } from "@/lib/clients";


type InvoiceStatus = "Draft" | "Sent" | "Overdue" | "Paid";
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
};

const INVOICE_DRAFT_KEY = "frontier-invoice-draft";
const INVOICES_KEY = "frontier-invoices";
const CLIENTS_KEY = "frontier-clients";

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
    id: `line-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    description: "",
    quantity: 1,
    unitPrice: "",
  };
}

function loadSavedInvoices(): InvoiceRow[] {
  if (typeof window === "undefined") return [];

  const saved = localStorage.getItem(INVOICES_KEY);

  if (!saved) return [];

  try {
    return JSON.parse(saved) as InvoiceRow[];
  } catch {
    return [];
  }
}

function saveSavedInvoices(invoices: InvoiceRow[]) {
  localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
}

function loadSavedClients(): ClientRow[] {
  if (typeof window === "undefined") return [];

  const saved = localStorage.getItem(CLIENTS_KEY);
  if (!saved) return defaultClients as ClientRow[];

  try {
    return JSON.parse(saved) as ClientRow[];
  } catch {
    return defaultClients as ClientRow[];
  }
}

function saveSavedClients(clients: ClientRow[]) {
  localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
}

function cleanText(value: string | undefined) {
  return value?.trim() ?? "";
}

export default function InvoiceBuilderPage() {
  const router = useRouter();
  const { activeWorkspace } = useWorkspace();

  const [draft, setDraft] = useState<InvoiceSetupDraft | null>(null);
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([getEmptyLineItem()]);
  const [discountType, setDiscountType] = useState<DiscountType>("None");
  const [discountValue, setDiscountValue] = useState("");
  const [taxRate, setTaxRate] = useState("");
  const [status, setStatus] = useState<InvoiceStatus>("Draft");

  useEffect(() => {
    const savedDraft = localStorage.getItem(INVOICE_DRAFT_KEY);

    if (!savedDraft) {
      const fallbackDraft: InvoiceSetupDraft = {
        id: `invoice-${Date.now()}`,
        workspaceId: activeWorkspace.id,
        invoiceNumber: `INV-${Date.now().toString().slice(-5)}`,
        invoiceDate: todayString(),
        companyName: activeWorkspace.name ?? "",
        companyAddress: "",
        companyCity: "",
        companyState: "",
        companyZip: "",
      };

      setDraft(fallbackDraft);
      return;
    }

    try {
      const parsedDraft = JSON.parse(savedDraft) as InvoiceSetupDraft;
      setDraft(parsedDraft);
      setLineItems(
        parsedDraft.lineItems && parsedDraft.lineItems.length > 0
          ? parsedDraft.lineItems
          : [getEmptyLineItem()]
      );
      setDiscountType(parsedDraft.discountType ?? "None");
      setDiscountValue(parsedDraft.discountValue ?? "");
      setTaxRate(parsedDraft.taxRate ?? "");
      setStatus(parsedDraft.status ?? "Draft");
    } catch {
      setDraft({
        id: `invoice-${Date.now()}`,
        workspaceId: activeWorkspace.id,
        invoiceNumber: `INV-${Date.now().toString().slice(-5)}`,
        invoiceDate: todayString(),
        companyName: activeWorkspace.name ?? "",
        companyAddress: "",
        companyCity: "",
        companyState: "",
        companyZip: "",
      });
    }
  }, [activeWorkspace.id, activeWorkspace.name]);

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

  function upsertClientFromInvoice(invoice: InvoiceRow) {
    const existingClients = loadSavedClients();
    const existingClientId = cleanText(invoice.sourceClientId);

    if (existingClientId) {
      const updatedClients = existingClients.map((client) =>
        client.id === existingClientId
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

      saveSavedClients(updatedClients);
      return existingClientId;
    }

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

      saveSavedClients(updatedClients);
      return matchingClient.id;
    }

    const newClient: ClientRow = {
      id: `client-${Date.now()}`,
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

    saveSavedClients([...existingClients, newClient]);
    return newClient.id;
  }

  function saveInvoice() {
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

    const resolvedClientId = upsertClientFromInvoice(invoiceBeforeClientUpdate);

    const savedInvoice: InvoiceRow = {
      ...invoiceBeforeClientUpdate,
      sourceClientId: resolvedClientId ?? invoiceBeforeClientUpdate.sourceClientId ?? "",
    };

    const existingInvoices = loadSavedInvoices();
    const updatedInvoices = [
      ...existingInvoices.filter((invoice) => invoice.id !== savedInvoice.id),
      savedInvoice,
    ];

    saveSavedInvoices(updatedInvoices);
    localStorage.removeItem(INVOICE_DRAFT_KEY);
    router.push(`/invoices/${savedInvoice.id}`);
  }

  if (!draft) {
    return <div className="p-6 text-sm text-gray-300">Loading invoice builder...</div>;
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
