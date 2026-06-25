"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type EstimateLineItem = {
  id: string;
  description: string;
  quantity: number | string;
  unit_price_cents: number | string;
  sort_order: number | string | null;
};

type ClientEstimate = {
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
  approved_at: string | null;
  approval_notes: string | null;
  rejected_at: string | null;
  rejection_notes: string | null;
  converted_invoice_id: string | null;
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

function estimateTotal(estimate: ClientEstimate) {
  return (estimate.estimate_line_items ?? []).reduce((total, item) => {
    const quantity = Number(item.quantity ?? 0);
    const cents = Number(item.unit_price_cents ?? 0);
    return total + quantity * cents;
  }, 0);
}

function statusClass(status: string | null) {
  if (status === "Accepted" || status === "Converted") {
    return "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-200";
  }
  if (status === "Declined") return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200";
  return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-200";
}

export default function ClientPortalEstimatesList() {
  const [items, setItems] = useState<ClientEstimate[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState("");

  async function loadEstimates(showLoading = false) {
    if (showLoading) setIsLoading(true);
    setError("");
    const response = await fetch("/api/client-portal/data?type=estimates");
    const payload = await response.json();
    if (!response.ok || payload.error) {
      throw new Error(payload.error ?? "Unable to load estimates.");
    }
    setItems((payload.items ?? []) as ClientEstimate[]);
  }

  useEffect(() => {
    let cancelled = false;

    fetch("/api/client-portal/data?type=estimates")
      .then((response) => response.json().then((payload) => ({ ok: response.ok, payload })))
      .then(({ ok, payload }) => {
        if (cancelled) return;
        if (!ok || payload.error) {
          throw new Error(payload.error ?? "Unable to load estimates.");
        }
        setItems((payload.items ?? []) as ClientEstimate[]);
      })
      .catch((loadError) => {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Unable to load estimates.");
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
      items.map((estimate) => ({
        ...estimate,
        estimate_line_items: [...(estimate.estimate_line_items ?? [])].sort(
          (a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0)
        ),
      })),
    [items]
  );

  async function mutateEstimate(estimate: ClientEstimate, action: "approve" | "reject") {
    const verb = action === "approve" ? "approve" : "reject";
    const confirmed = window.confirm(`Are you sure you want to ${verb} estimate ${estimate.estimate_number ?? ""}?`);
    if (!confirmed) return;

    const notes = window.prompt(`Optional ${action === "approve" ? "approval" : "rejection"} notes:`) ?? "";
    setBusyId(`${estimate.id}:${action}`);
    setError("");
    setNotice("");

    try {
      const response = await fetch(`/api/client-portal/estimates/${estimate.id}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      const payload = await response.json();
      if (!response.ok || payload.error) throw new Error(payload.error ?? `Unable to ${verb} estimate.`);
      await loadEstimates(false);
      setNotice(`Estimate ${action === "approve" ? "approved" : "rejected"}.`);
    } catch (mutationError) {
      setError(mutationError instanceof Error ? mutationError.message : `Unable to ${verb} estimate.`);
    } finally {
      setBusyId("");
    }
  }

  if (isLoading) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">Loading estimates...</p>;
  }

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
        No estimates are currently linked to this client portal access.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {notice && (
        <p className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300">
          {notice}
        </p>
      )}

      {sortedItems.map((estimate) => {
        const canAct = estimate.status !== "Accepted" && estimate.status !== "Declined" && estimate.status !== "Converted";
        return (
          <article
            key={estimate.id}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold">{estimate.estimate_number ?? "Estimate"}</h3>
                  <span className={`rounded-full px-2 py-1 text-xs font-bold ${statusClass(estimate.status)}`}>
                    {estimate.status ?? "Draft"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Date: {formatDate(estimate.estimate_date)} - Total: {formatMoney(estimateTotal(estimate))}
                </p>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  {estimate.bill_to_name ?? "Client"}
                  {estimate.bill_to_email ? ` - ${estimate.bill_to_email}` : ""}
                </p>
                {(estimate.bill_to_address || estimate.bill_to_city) && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {[estimate.bill_to_address, estimate.bill_to_city, estimate.bill_to_state, estimate.bill_to_zip]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => mutateEstimate(estimate, "approve")}
                  disabled={!canAct || busyId === `${estimate.id}:approve`}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {busyId === `${estimate.id}:approve` ? "Approving..." : "Approve"}
                </button>
                <button
                  type="button"
                  onClick={() => mutateEstimate(estimate, "reject")}
                  disabled={!canAct || busyId === `${estimate.id}:reject`}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {busyId === `${estimate.id}:reject` ? "Rejecting..." : "Reject"}
                </button>
              </div>
            </div>

            {estimate.estimate_line_items && estimate.estimate_line_items.length > 0 && (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    <tr>
                      <th className="border-b border-gray-200 px-3 py-2 dark:border-gray-800">Description</th>
                      <th className="border-b border-gray-200 px-3 py-2 dark:border-gray-800">Qty</th>
                      <th className="border-b border-gray-200 px-3 py-2 dark:border-gray-800">Unit</th>
                      <th className="border-b border-gray-200 px-3 py-2 dark:border-gray-800">Line Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estimate.estimate_line_items.map((line) => {
                      const quantity = Number(line.quantity ?? 0);
                      const unit = Number(line.unit_price_cents ?? 0);
                      return (
                        <tr key={line.id}>
                          <td className="border-b border-gray-100 px-3 py-3 dark:border-gray-800">{line.description}</td>
                          <td className="border-b border-gray-100 px-3 py-3 dark:border-gray-800">{quantity}</td>
                          <td className="border-b border-gray-100 px-3 py-3 dark:border-gray-800">{formatMoney(unit)}</td>
                          <td className="border-b border-gray-100 px-3 py-3 dark:border-gray-800">
                            {formatMoney(quantity * unit)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {estimate.approved_at && (
              <p className="mt-3 text-sm font-semibold text-green-700 dark:text-green-300">
                Approved {formatDate(estimate.approved_at)}
                {estimate.approval_notes ? ` - ${estimate.approval_notes}` : ""}
              </p>
            )}
            {estimate.rejected_at && (
              <p className="mt-3 text-sm font-semibold text-red-700 dark:text-red-300">
                Rejected {formatDate(estimate.rejected_at)}
                {estimate.rejection_notes ? ` - ${estimate.rejection_notes}` : ""}
              </p>
            )}
            {estimate.converted_invoice_id && (
              <p className="mt-3 text-sm font-semibold text-green-700 dark:text-green-300">
                Converted to invoice.{" "}
                <Link href="/client-portal/invoices" className="text-blue-600 hover:underline">
                  View invoices
                </Link>
              </p>
            )}
          </article>
        );
      })}
    </div>
  );
}
