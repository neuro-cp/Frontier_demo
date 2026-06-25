"use client";

import { useEffect, useState } from "react";

import { useWorkspace } from "@/components/WorkspaceContext";

type ActivityPayload = {
  customerActivity?: Array<{ id: string; sender_type: string; body: string; created_at: string }>;
  employeeActivity?: Array<{ id: string; update_type: string; body: string; completion_percent: number | null; created_at: string }>;
  paymentActivity?: Array<{ id: string; amount_cents: number; status: string; payment_date: string | null; created_at: string }>;
  estimatePipeline?: Record<string, number>;
  invoiceAging?: { unpaid: number; overdue: number; paid: number };
  error?: string;
};

function formatDate(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function formatMoney(cents: number) {
  return `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function OperationsActivityPanel() {
  const { activeWorkspace } = useWorkspace();
  const [payload, setPayload] = useState<ActivityPayload>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const query = new URLSearchParams({ workspaceId: activeWorkspace.id });

    fetch(`/api/workspace-activity?${query.toString()}`)
      .then((response) => response.json())
      .then((data: ActivityPayload) => {
        if (cancelled) return;
        setPayload(data);
      })
      .catch(() => {
        if (!cancelled) setPayload({ error: "Unable to load operations activity." });
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeWorkspace.id]);

  if (isLoading) {
    return (
      <div className="mt-6 rounded-lg bg-white p-6 shadow dark:bg-gray-900">
        <h2 className="text-xl font-semibold text-gray-950 dark:text-gray-100">Operations Activity</h2>
        <p className="mt-3 text-sm text-gray-500">Loading activity...</p>
      </div>
    );
  }

  if (payload.error) {
    return (
      <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
        {payload.error}
      </div>
    );
  }

  const estimates = payload.estimatePipeline ?? {};
  const aging = payload.invoiceAging ?? { unpaid: 0, overdue: 0, paid: 0 };

  return (
    <div className="mt-6 grid gap-4 xl:grid-cols-2">
      <section className="rounded-lg bg-white p-6 shadow dark:bg-gray-900">
        <h2 className="mb-4 text-xl font-semibold text-gray-950 dark:text-gray-100">Customer Activity</h2>
        <div className="space-y-3">
          {(payload.customerActivity ?? []).length > 0 ? (
            payload.customerActivity?.map((message) => (
              <div key={message.id} className="rounded-lg border border-gray-200 p-3 dark:border-gray-800">
                <div className="text-xs text-gray-500">{message.sender_type} - {formatDate(message.created_at)}</div>
                <p className="mt-1 text-sm">{message.body}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No recent customer messages.</p>
          )}
        </div>
      </section>

      <section className="rounded-lg bg-white p-6 shadow dark:bg-gray-900">
        <h2 className="mb-4 text-xl font-semibold text-gray-950 dark:text-gray-100">Employee Activity</h2>
        <div className="space-y-3">
          {(payload.employeeActivity ?? []).length > 0 ? (
            payload.employeeActivity?.map((update) => (
              <div key={update.id} className="rounded-lg border border-gray-200 p-3 dark:border-gray-800">
                <div className="text-xs text-gray-500">{update.update_type} - {formatDate(update.created_at)}</div>
                <p className="mt-1 text-sm">{update.body}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No recent employee updates.</p>
          )}
        </div>
      </section>

      <section className="rounded-lg bg-white p-6 shadow dark:bg-gray-900">
        <h2 className="mb-4 text-xl font-semibold text-gray-950 dark:text-gray-100">Payment Activity</h2>
        <div className="space-y-2">
          {(payload.paymentActivity ?? []).length > 0 ? (
            payload.paymentActivity?.map((payment) => (
              <div key={payment.id} className="flex justify-between gap-3 rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-800">
                <span>{payment.status}</span>
                <span className="font-semibold">{formatMoney(payment.amount_cents)}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No recent payments.</p>
          )}
        </div>
      </section>

      <section className="rounded-lg bg-white p-6 shadow dark:bg-gray-900">
        <h2 className="mb-4 text-xl font-semibold text-gray-950 dark:text-gray-100">Pipeline</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-800">Pending estimates: {estimates.Draft ?? estimates.Sent ?? 0}</div>
          <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-800">Accepted estimates: {estimates.Accepted ?? 0}</div>
          <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-800">Unpaid invoices: {aging.unpaid}</div>
          <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-800">Overdue invoices: {aging.overdue}</div>
        </div>
      </section>
    </div>
  );
}
