"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useWorkspace } from "@/components/WorkspaceContext";

type EstimateLineItem = {
  id: string;
  description: string;
  quantity: number | string;
  unit_price_cents: number | string;
  sort_order: number | string | null;
};

type EstimateRow = {
  id: string;
  client_id: string | null;
  job_id: string | null;
  estimate_number: string | null;
  estimate_date: string | null;
  status: string | null;
  bill_to_name: string | null;
  bill_to_email: string | null;
  converted_invoice_id: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  estimate_line_items?: EstimateLineItem[];
};

const statusFilters = ["All", "Draft", "Sent", "Accepted", "Declined", "Converted"] as const;

function formatDate(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

function estimateTotal(estimate: EstimateRow) {
  return (estimate.estimate_line_items ?? []).reduce((total, item) => {
    return total + Number(item.quantity ?? 0) * Number(item.unit_price_cents ?? 0);
  }, 0);
}

function statusClass(status: string | null) {
  if (status === "Accepted" || status === "Converted") return "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-200";
  if (status === "Declined") return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200";
  if (status === "Sent") return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-200";
  return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200";
}

export default function EstimatesPage() {
  const { activeWorkspace } = useWorkspace();
  const [items, setItems] = useState<EstimateRow[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof statusFilters)[number]>("All");

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) {
        setIsLoading(true);
        setError("");
      }
    });

    fetch(`/api/estimates?workspaceId=${encodeURIComponent(activeWorkspace.id)}`)
      .then((response) => response.json().then((payload) => ({ ok: response.ok, payload })))
      .then(({ ok, payload }) => {
        if (cancelled) return;
        if (!ok || payload.error) throw new Error(payload.error ?? "Unable to load estimates.");
        setItems((payload.items ?? []) as EstimateRow[]);
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
  }, [activeWorkspace.id]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((estimate) => {
      const matchesStatus = statusFilter === "All" || estimate.status === statusFilter;
      const matchesSearch =
        !query ||
        [estimate.estimate_number, estimate.bill_to_name, estimate.bill_to_email]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));
      return matchesStatus && matchesSearch;
    });
  }, [items, search, statusFilter]);

  const totals = useMemo(() => {
    return {
      total: items.length,
      accepted: items.filter((estimate) => estimate.status === "Accepted").length,
      converted: items.filter((estimate) => estimate.status === "Converted" || estimate.converted_invoice_id).length,
      openValue: items
        .filter((estimate) => estimate.status !== "Declined" && estimate.status !== "Converted")
        .reduce((total, estimate) => total + estimateTotal(estimate), 0),
    };
  }, [items]);

  return (
    <div className="space-y-6 text-gray-950 dark:text-gray-100">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Estimates</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Track estimate approvals, rejections, and conversions for {activeWorkspace.name}.
          </p>
        </div>
        <Link href="/invoices/new" className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">
          Create Estimate
        </Link>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl bg-white p-4 shadow dark:bg-gray-900"><p className="text-sm text-gray-500">Total Estimates</p><p className="mt-1 text-2xl font-bold">{totals.total}</p></div>
        <div className="rounded-xl bg-white p-4 shadow dark:bg-gray-900"><p className="text-sm text-gray-500">Accepted</p><p className="mt-1 text-2xl font-bold">{totals.accepted}</p></div>
        <div className="rounded-xl bg-white p-4 shadow dark:bg-gray-900"><p className="text-sm text-gray-500">Converted</p><p className="mt-1 text-2xl font-bold">{totals.converted}</p></div>
        <div className="rounded-xl bg-white p-4 shadow dark:bg-gray-900"><p className="text-sm text-gray-500">Open Value</p><p className="mt-1 text-2xl font-bold">{formatMoney(totals.openValue)}</p></div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow dark:bg-gray-900 md:flex-row">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search estimate, client, or email"
          className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
        />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as (typeof statusFilters)[number])}
          className="rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
        >
          {statusFilters.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg bg-white shadow dark:bg-gray-900">
        <table className="w-full min-w-[900px] text-left">
          <thead className="bg-gray-100 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            <tr>
              <th className="p-4">Estimate #</th>
              <th className="p-4">Date</th>
              <th className="p-4">Client</th>
              <th className="p-4">Status</th>
              <th className="p-4">Conversion</th>
              <th className="p-4 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading estimates...</td></tr>
            ) : filteredItems.length > 0 ? (
              filteredItems.map((estimate) => (
                <tr key={estimate.id} className="border-t border-gray-200 dark:border-gray-800">
                  <td className="p-4 font-semibold">
                    <Link href={`/estimates/${estimate.id}`} className="text-blue-600 hover:underline dark:text-blue-400">
                      {estimate.estimate_number ?? "Estimate"}
                    </Link>
                  </td>
                  <td className="p-4">{formatDate(estimate.estimate_date)}</td>
                  <td className="p-4">
                    <div>{estimate.bill_to_name ?? "-"}</div>
                    {estimate.bill_to_email && <div className="text-xs text-gray-500">{estimate.bill_to_email}</div>}
                  </td>
                  <td className="p-4">
                    <span className={`rounded-full px-2 py-1 text-xs font-bold ${statusClass(estimate.status)}`}>
                      {estimate.status ?? "Draft"}
                    </span>
                  </td>
                  <td className="p-4">
                    {estimate.converted_invoice_id ? (
                      <Link href={`/invoices/${estimate.converted_invoice_id}`} className="text-blue-600 hover:underline dark:text-blue-400">
                        Open invoice
                      </Link>
                    ) : estimate.status === "Accepted" ? (
                      <Link href={`/estimates/${estimate.id}`} className="text-blue-600 hover:underline dark:text-blue-400">
                        Ready to convert
                      </Link>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="p-4 text-right font-semibold">{formatMoney(estimateTotal(estimate))}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">No estimates match the current filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
