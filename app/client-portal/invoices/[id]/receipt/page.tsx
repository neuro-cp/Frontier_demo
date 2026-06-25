"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import PortalSubpageShell from "@/components/PortalSubpageShell";

type InvoicePayment = {
  id: string;
  amount_cents: number | string;
  status: string | null;
  payment_date: string | null;
  method: string | null;
  reference: string | null;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  created_at: string | null;
};

type ClientInvoice = {
  id: string;
  invoice_number: string | null;
  status: string | null;
  paid_at: string | null;
  invoice_payments?: InvoicePayment[];
};

function formatDateTime(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

function paymentReference(payment: InvoicePayment | undefined) {
  if (!payment) return "-";
  return payment.reference || payment.stripe_payment_intent_id || payment.stripe_checkout_session_id || "-";
}

function paymentStatusClass(status: string | null | undefined) {
  if (status === "Succeeded") return "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-200";
  if (status === "Failed" || status === "Refunded") return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200";
  return "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200";
}

export default function ClientPortalInvoiceReceiptPage() {
  const routeParams = useParams<{ id: string }>();
  const invoiceId = routeParams.id;
  const [invoice, setInvoice] = useState<ClientInvoice | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!invoiceId) return;
    let cancelled = false;

    fetch(`/api/client-portal/invoices/${invoiceId}`)
      .then((response) => response.json().then((payload) => ({ ok: response.ok, payload })))
      .then(({ ok, payload }) => {
        if (cancelled) return;
        if (!ok || payload.error) throw new Error(payload.error ?? "Unable to load receipt.");
        setInvoice(payload.invoice as ClientInvoice);
      })
      .catch((loadError) => {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Unable to load receipt.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [invoiceId]);

  const latestPayment = useMemo(() => {
    return [...(invoice?.invoice_payments ?? [])].sort((a, b) => {
      const aTime = new Date(a.created_at || a.payment_date || "").getTime();
      const bTime = new Date(b.created_at || b.payment_date || "").getTime();
      return bTime - aTime;
    })[0];
  }, [invoice]);

  return (
    <PortalSubpageShell
      portalName="Client Portal"
      dashboardHref="/client-portal"
      title="Payment Receipt"
      description="Review the latest Stripe payment status for this invoice."
    >
      {isLoading && <p className="text-sm text-gray-500 dark:text-gray-400">Loading receipt...</p>}

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}

      {!isLoading && !error && invoice && (
        <div className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-bold">{invoice.invoice_number ?? "Invoice"}</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Invoice status: {invoice.status ?? "-"}</p>
            </div>
            {latestPayment && (
              <span className={`w-fit rounded-full px-3 py-1 text-sm font-bold ${paymentStatusClass(latestPayment.status)}`}>
                {latestPayment.status ?? "Succeeded"}
              </span>
            )}
          </div>

          {latestPayment ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-800">
                <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Payment Amount</div>
                <div className="mt-1 text-lg font-bold">{formatMoney(Number(latestPayment.amount_cents ?? 0))}</div>
              </div>
              <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-800">
                <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Payment Timestamp</div>
                <div className="mt-1 text-lg font-bold">
                  {formatDateTime(latestPayment.created_at || latestPayment.payment_date || invoice.paid_at)}
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-800">
                <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Method</div>
                <div className="mt-1 text-lg font-bold">{latestPayment.method ?? "Stripe"}</div>
              </div>
              <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-800">
                <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Stripe Reference</div>
                <div className="mt-1 break-all font-mono text-sm">{paymentReference(latestPayment)}</div>
              </div>
            </div>
          ) : (
            <p className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-900 dark:bg-yellow-950/40 dark:text-yellow-200">
              No Stripe payment record is available for this invoice yet.
            </p>
          )}

          <Link
            href="/client-portal/invoices"
            className="inline-flex rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Back to invoices
          </Link>
        </div>
      )}
    </PortalSubpageShell>
  );
}
