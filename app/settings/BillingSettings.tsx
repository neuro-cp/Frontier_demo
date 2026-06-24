"use client";

import { useEffect, useState } from "react";

import type { WorkspaceBillingStatus } from "@/lib/billing/types";

type BillingResponse = {
  billing: WorkspaceBillingStatus;
  stripe: {
    configured: boolean;
    hasPublishableKey: boolean;
    hasSecretKey: boolean;
    hasWebhookSecret: boolean;
    priceIds: {
      basic: boolean;
      professional: boolean;
      business: boolean;
    };
  };
};

function formatValue(value: string | null) {
  return value && value.trim() ? value : "-";
}

export default function BillingSettings({ workspaceId }: { workspaceId: string }) {
  const hasWorkspace = Boolean(workspaceId && workspaceId !== "create-workspace");
  const [data, setData] = useState<BillingResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadBilling() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `/api/billing/status?workspaceId=${encodeURIComponent(workspaceId)}`
        );
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to load billing status.");
        }

        if (!cancelled) setData(payload as BillingResponse);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load billing status.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (hasWorkspace) void loadBilling();

    return () => {
      cancelled = true;
    };
  }, [hasWorkspace, workspaceId]);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
      <h2 className="text-2xl font-bold">Billing</h2>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Subscription tracking is ready for Stripe, but checkout and webhooks are not connected yet.
      </p>

      {!hasWorkspace && (
        <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm font-semibold text-gray-600 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300">
          Create a workspace before viewing billing status.
        </div>
      )}

      {hasWorkspace && loading && (
        <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm font-semibold text-gray-600 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300">
          Loading billing status...
        </div>
      )}

      {error && (
        <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      {data && (
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
            <h3 className="font-bold">Workspace Plan</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500 dark:text-gray-400">Plan</dt>
                <dd className="font-semibold capitalize">{data.billing.plan}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500 dark:text-gray-400">Billing Status</dt>
                <dd className="font-semibold">{data.billing.billingStatus}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500 dark:text-gray-400">Current Period End</dt>
                <dd className="font-semibold">{formatValue(data.billing.currentPeriodEnd)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500 dark:text-gray-400">Cancel At Period End</dt>
                <dd className="font-semibold">{data.billing.cancelAtPeriodEnd ? "Yes" : "No"}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
            <h3 className="font-bold">Stripe Readiness</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500 dark:text-gray-400">Configured</dt>
                <dd className="font-semibold">{data.stripe.configured ? "Yes" : "No"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500 dark:text-gray-400">Publishable Key</dt>
                <dd className="font-semibold">{data.stripe.hasPublishableKey ? "Set" : "Missing"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500 dark:text-gray-400">Secret Key</dt>
                <dd className="font-semibold">{data.stripe.hasSecretKey ? "Set" : "Missing"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500 dark:text-gray-400">Webhook Secret</dt>
                <dd className="font-semibold">{data.stripe.hasWebhookSecret ? "Set" : "Missing"}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950 lg:col-span-2">
            <h3 className="font-bold">Stripe Records</h3>
            <dl className="mt-4 grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Customer</dt>
                <dd className="mt-1 font-semibold break-all">{formatValue(data.billing.stripeCustomerId)}</dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Subscription</dt>
                <dd className="mt-1 font-semibold break-all">{formatValue(data.billing.stripeSubscriptionId)}</dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Price</dt>
                <dd className="mt-1 font-semibold break-all">{formatValue(data.billing.stripePriceId)}</dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {data && !data.stripe.configured && (
        <div className="mt-5 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm font-semibold text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          Billing is not configured in this environment. Existing app features remain available under the current alpha plan rules.
        </div>
      )}
    </section>
  );
}
