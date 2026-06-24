"use client";

import Link from "next/link";

import { useClientPortalAccess } from "@/lib/portals/useClientPortalAccess";
import { usePortalMetrics } from "@/lib/portals/usePortalMetrics";

const portalNav = [
  { label: "Dashboard", href: "/client-portal" },
  { label: "Jobs", href: "/client-portal/jobs" },
  { label: "Invoices", href: "/client-portal/invoices" },
  { label: "Estimates", href: "/client-portal/estimates" },
  { label: "Documents", href: "/client-portal/documents" },
  { label: "Messages", href: "/client-portal/messages" },
];

function PortalCard({
  title,
  value,
  note,
  href,
}: {
  title: string;
  value: string;
  note: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:border-blue-300 hover:bg-blue-50/50 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-800 dark:hover:bg-blue-950/20"
    >
      <div className="text-sm font-semibold text-gray-500 dark:text-gray-400">
        {title}
      </div>
      <div className="mt-3 text-3xl font-bold text-gray-950 dark:text-gray-100">
        {value}
      </div>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{note}</p>
    </Link>
  );
}

export default function ClientPortalPage() {
  const { activeWorkspace, error, isAuthenticated, metrics } = usePortalMetrics();
  const clientPortalAccess = useClientPortalAccess();

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h1 className="text-2xl font-bold text-gray-950 dark:text-gray-100">
          Client Portal
        </h1>
        <p className="mt-3 text-gray-600 dark:text-gray-300">
          Sign in to access client-facing workspace information.
        </p>
        <Link
          href="/login"
          className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
        >
          Log in
        </Link>
      </div>
    );
  }

  if (!clientPortalAccess.hasActiveAccess) {
    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h1 className="text-2xl font-bold text-gray-950 dark:text-gray-100">
          Client Portal
        </h1>
        <p className="mt-3 text-gray-600 dark:text-gray-300">
          You do not have an active client portal connection yet. Ask the company to send you an invite.
        </p>
        {clientPortalAccess.error && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">
            {clientPortalAccess.error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-950 dark:text-gray-100">
            Client Portal
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {activeWorkspace.name} customer-facing portal foundation.
          </p>
        </div>
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
          Role guard ready: Client access will map to workspace-linked client records.
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      <nav className="flex gap-2 overflow-x-auto rounded-xl border border-gray-200 bg-white p-2 dark:border-gray-800 dark:bg-gray-900">
        {portalNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <PortalCard
          title="Active Jobs"
          value={String(metrics.activeJobs)}
          note="Workspace-scoped until client identity mapping is enabled."
          href="/client-portal/jobs"
        />
        <PortalCard
          title="Open Invoices"
          value={String(metrics.openInvoices)}
          note="Paid invoices are excluded."
          href="/client-portal/invoices"
        />
        <PortalCard
          title="Pending Estimates"
          value={String(metrics.pendingEstimates)}
          note="Estimate approval workflow is not built yet."
          href="/client-portal/estimates"
        />
        <PortalCard
          title="Documents"
          value={String(metrics.documents)}
          note="Uploads and document review are handled in Documents."
          href="/client-portal/documents"
        />
        <PortalCard title="Messages" value="Coming Soon" note="Messaging is not built yet." href="/client-portal/messages" />
      </div>
    </div>
  );
}
