"use client";

import { useEffect, useMemo, useState } from "react";

type InvoiceLineItem = {
  id: string;
  description: string;
  quantity: number | string;
  unit_price_cents: number | string;
  sort_order: number | string | null;
};

type InvoicePayment = {
  id: string;
  amount_cents: number | string;
  status: string | null;
  payment_date: string | null;
  method: string | null;
};

type ClientInvoice = {
  id: string;
  invoice_number: string | null;
  invoice_date: string | null;
  due_date: string | null;
  status: string | null;
  bill_to_name: string | null;
  bill_to_email: string | null;
  discount_type: "None" | "Percent" | "Fixed" | null;
  discount_value: number | string | null;
  tax_rate: number | string | null;
  invoice_line_items?: InvoiceLineItem[];
  invoice_payments?: InvoicePayment[];
};

function formatDate(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}

function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

function invoiceTotalCents(invoice: ClientInvoice) {
  const subtotal = (invoice.invoice_line_items ?? []).reduce((total, line) => {
    return total + Math.round(Number(line.quantity ?? 0) * Number(line.unit_price_cents ?? 0));
  }, 0);
  const discountValue = Number(invoice.discount_value ?? 0);
  let discount = 0;
  if (invoice.discount_type === "Percent") discount = Math.round(subtotal * (discountValue / 100));
  if (invoice.discount_type === "Fixed") discount = Math.round(discountValue * 100);
  const taxableSubtotal = Math.max(subtotal - Math.min(discount, subtotal), 0);
  const tax = Math.round(taxableSubtotal * (Number(invoice.tax_rate ?? 0) / 100));
  return taxableSubtotal + tax;
}

function paidAmountCents(invoice: ClientInvoice) {
  return (invoice.invoice_payments ?? [])
    .filter((payment) => payment.status === "Succeeded" || payment.status === null)
    .reduce((total, payment) => total + Number(payment.amount_cents ?? 0), 0);
}

function statusClass(status: string | null) {
  if (status === "Paid") return "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-200";
  if (status === "Overdue") return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200";
  return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-200";
}

export default function ClientPortalInvoicesList() {
  const [items, setItems] = useState<ClientInvoice[]>([]);
  const [error, setError] = useState("");
  const [notice] = useState(() => {
    if (typeof window === "undefined") return "";
    const query = new URLSearchParams(window.location.search);
    if (query.get("payment") === "success") {
      return "Payment completed. Invoice status will update after Stripe confirms it.";
    }
    if (query.get("payment") === "cancelled") return "Payment was cancelled.";
    return "";
  });
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    let cancelled = false;

    fetch("/api/client-portal/data?type=invoices")
      .then((response) => response.json().then((payload) => ({ ok: response.ok, payload })))
      .then(({ ok, payload }) => {
        if (cancelled) return;
        if (!ok || payload.error) throw new Error(payload.error ?? "Unable to load invoices.");
        setItems((payload.items ?? []) as ClientInvoice[]);
      })
      .catch((loadError) => {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Unable to load invoices.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const sortedItems = useMemo(
    () =>
      items.map((invoice) => ({
        ...invoice,
        invoice_line_items: [...(invoice.invoice_line_items ?? [])].sort(
          (a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0)
        ),
      })),
    [items]
  );

  async function payInvoice(invoice: ClientInvoice) {
    setBusyId(invoice.id);
    setError("");

    try {
      const response = await fetch(`/api/client-portal/invoices/${invoice.id}/checkout`, {
        method: "POST",
      });
      const payload = await response.json();
      if (!response.ok || payload.error) throw new Error(payload.error ?? "Unable to start payment.");
      if (!payload.url) throw new Error("Stripe did not return a checkout URL.");
      window.location.assign(payload.url);
    } catch (paymentError) {
      setError(paymentError instanceof Error ? paymentError.message : "Unable to start payment.");
      setBusyId("");
    }
  }

  if (isLoading) return <p className="text-sm text-gray-500 dark:text-gray-400">Loading invoices...</p>;

  if (error) {
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
        {error}
      </p>
    );
  }

  if (sortedItems.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
        No invoices are currently linked to this client portal access.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {notice && (
        <p className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
          {notice}
        </p>
      )}

      {sortedItems.map((invoice) => {
        const total = invoiceTotalCents(invoice);
        const paid = paidAmountCents(invoice);
        const balance = Math.max(total - paid, 0);
        const canPay = invoice.status !== "Paid" && balance > 0;

        return (
          <article
            key={invoice.id}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold">{invoice.invoice_number ?? "Invoice"}</h3>
                  <span className={`rounded-full px-2 py-1 text-xs font-bold ${statusClass(invoice.status)}`}>
                    {invoice.status ?? "Draft"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Date: {formatDate(invoice.invoice_date)} - Due: {formatDate(invoice.due_date)}
                </p>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  {invoice.bill_to_name ?? "Client"}
                  {invoice.bill_to_email ? ` - ${invoice.bill_to_email}` : ""}
                </p>
              </div>

              <div className="text-left lg:text-right">
                <div className="text-sm text-gray-500 dark:text-gray-400">Balance</div>
                <div className="text-2xl font-bold">{formatMoney(balance)}</div>
                <button
                  type="button"
                  onClick={() => payInvoice(invoice)}
                  disabled={!canPay || busyId === invoice.id}
                  className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {busyId === invoice.id ? "Opening..." : invoice.status === "Paid" ? "Paid" : "Pay Invoice"}
                </button>
              </div>
            </div>

            {invoice.invoice_line_items && invoice.invoice_line_items.length > 0 && (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    <tr>
                      <th className="border-b border-gray-200 px-3 py-2 dark:border-gray-800">Description</th>
                      <th className="border-b border-gray-200 px-3 py-2 dark:border-gray-800">Qty</th>
                      <th className="border-b border-gray-200 px-3 py-2 dark:border-gray-800">Unit</th>
                      <th className="border-b border-gray-200 px-3 py-2 text-right dark:border-gray-800">Line Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.invoice_line_items.map((line) => {
                      const quantity = Number(line.quantity ?? 0);
                      const unit = Number(line.unit_price_cents ?? 0);
                      return (
                        <tr key={line.id}>
                          <td className="border-b border-gray-100 px-3 py-3 dark:border-gray-800">{line.description}</td>
                          <td className="border-b border-gray-100 px-3 py-3 dark:border-gray-800">{quantity}</td>
                          <td className="border-b border-gray-100 px-3 py-3 dark:border-gray-800">{formatMoney(unit)}</td>
                          <td className="border-b border-gray-100 px-3 py-3 text-right dark:border-gray-800">
                            {formatMoney(quantity * unit)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
