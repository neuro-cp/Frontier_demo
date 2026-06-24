"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type EstimateLineItem = {
  id: string;
  description: string;
  quantity: number | string;
  unit_price_cents: number | string;
  sort_order: number | string | null;
};

type Estimate = {
  id: string;
  estimate_number: string | null;
  estimate_date: string | null;
  status: string | null;
  bill_to_name: string | null;
  bill_to_email: string | null;
  bill_to_address: string | null;
  bill_to_city: string | null;
  bill_to_state: string | null;
  bill_to_zip: string | null;
  converted_invoice_id: string | null;
  convertedInvoice?: { id: string; invoice_number: string | null } | null;
  estimate_line_items?: EstimateLineItem[];
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

function lineTotal(line: EstimateLineItem) {
  return Number(line.quantity ?? 0) * Number(line.unit_price_cents ?? 0);
}

function estimateTotal(estimate: Estimate) {
  return (estimate.estimate_line_items ?? []).reduce((total, line) => total + lineTotal(line), 0);
}

function statusClass(status: string | null) {
  if (status === "Accepted" || status === "Converted") {
    return "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-200";
  }
  if (status === "Declined") return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200";
  return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-200";
}

export default function EstimateDetailPage() {
  const params = useParams<{ id: string }>();
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [canConvert, setCanConvert] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadEstimate() {
    const response = await fetch(`/api/estimates/${params.id}`);
    const payload = await response.json();
    if (!response.ok || payload.error) throw new Error(payload.error ?? "Unable to load estimate.");
    setEstimate(payload.estimate as Estimate);
    setCanConvert(Boolean(payload.canConvert));
  }

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/estimates/${params.id}`)
      .then((response) => response.json().then((payload) => ({ ok: response.ok, payload })))
      .then(({ ok, payload }) => {
        if (cancelled) return;
        if (!ok || payload.error) throw new Error(payload.error ?? "Unable to load estimate.");
        setEstimate(payload.estimate as Estimate);
        setCanConvert(Boolean(payload.canConvert));
      })
      .catch((loadError) => {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load estimate.");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const sortedLines = useMemo(
    () =>
      [...(estimate?.estimate_line_items ?? [])].sort(
        (a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0)
      ),
    [estimate]
  );

  async function convertEstimate() {
    if (!estimate) return;
    const confirmed = window.confirm(`Convert estimate ${estimate.estimate_number ?? ""} to an invoice?`);
    if (!confirmed) return;

    setIsConverting(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch(`/api/estimates/${estimate.id}/convert-to-invoice`, { method: "POST" });
      const payload = await response.json();
      if (!response.ok || payload.error) throw new Error(payload.error ?? "Unable to convert estimate.");
      setNotice(`Invoice ${payload.invoiceNumber ?? ""} created.`);
      await loadEstimate();
    } catch (conversionError) {
      setError(conversionError instanceof Error ? conversionError.message : "Unable to convert estimate.");
    } finally {
      setIsConverting(false);
    }
  }

  if (isLoading) {
    return <main className="p-6 text-sm text-gray-500 dark:text-gray-400">Loading estimate...</main>;
  }

  if (error && !estimate) {
    return (
      <main className="p-6">
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      </main>
    );
  }

  if (!estimate) return null;

  const convertedInvoiceId = estimate.converted_invoice_id ?? estimate.convertedInvoice?.id ?? "";
  const canShowConvert = canConvert && estimate.status === "Accepted" && !convertedInvoiceId;

  return (
    <main className="space-y-6 p-6">
      <Link href="/clients" className="text-sm font-semibold text-blue-600 hover:underline">
        Back to clients
      </Link>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}
      {notice && (
        <p className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300">
          {notice}
        </p>
      )}

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold">{estimate.estimate_number ?? "Estimate"}</h1>
              <span className={`rounded-full px-2 py-1 text-xs font-bold ${statusClass(estimate.status)}`}>
                {estimate.status ?? "Draft"}
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Date: {formatDate(estimate.estimate_date)} - Total: {formatMoney(estimateTotal(estimate))}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {convertedInvoiceId && (
              <Link
                href={`/invoices/${convertedInvoiceId}`}
                className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
              >
                Open Invoice
              </Link>
            )}
            {canShowConvert && (
              <button
                type="button"
                onClick={convertEstimate}
                disabled={isConverting}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {isConverting ? "Converting..." : "Convert to Invoice"}
              </button>
            )}
          </div>
        </div>

        {convertedInvoiceId && (
          <p className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300">
            Converted to invoice {estimate.convertedInvoice?.invoice_number ?? convertedInvoiceId}.
          </p>
        )}

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">Bill To</h2>
            <p className="mt-2 text-sm font-semibold">{estimate.bill_to_name ?? "Client"}</p>
            {estimate.bill_to_email && <p className="text-sm text-gray-600 dark:text-gray-300">{estimate.bill_to_email}</p>}
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {[estimate.bill_to_address, estimate.bill_to_city, estimate.bill_to_state, estimate.bill_to_zip]
                .filter(Boolean)
                .join(", ")}
            </p>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              <tr>
                <th className="border-b border-gray-200 px-3 py-2 dark:border-gray-800">Description</th>
                <th className="border-b border-gray-200 px-3 py-2 dark:border-gray-800">Qty</th>
                <th className="border-b border-gray-200 px-3 py-2 dark:border-gray-800">Unit</th>
                <th className="border-b border-gray-200 px-3 py-2 text-right dark:border-gray-800">Total</th>
              </tr>
            </thead>
            <tbody>
              {sortedLines.map((line) => (
                <tr key={line.id}>
                  <td className="border-b border-gray-100 px-3 py-2 dark:border-gray-800">{line.description}</td>
                  <td className="border-b border-gray-100 px-3 py-2 dark:border-gray-800">{line.quantity}</td>
                  <td className="border-b border-gray-100 px-3 py-2 dark:border-gray-800">
                    {formatMoney(Number(line.unit_price_cents ?? 0))}
                  </td>
                  <td className="border-b border-gray-100 px-3 py-2 text-right dark:border-gray-800">
                    {formatMoney(lineTotal(line))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
