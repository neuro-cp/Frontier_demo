"use client";

import Link from "next/link";

import StatCard from "../../components/Statcard";
import { useWorkspace } from "@/components/WorkspaceContext";
import { storageKeys, useStoredJsonState } from "@/lib/clientStorage";
import type { Job } from "@/lib/jobTypes";
import type { ClientRow } from "@/lib/clientTypes";
import type { Expense } from "@/lib/expenseTypes";
import { getInvoiceTotals, InvoiceRow } from "@/lib/frontierInvoices";

type DashboardInventoryItem = {
  workspaceId: string;
  warning: boolean;
};

function moneyToNumber(value: string) {
  return Number(value.replace(/[$,]/g, ""));
}

function formatMoney(value: number) {
  return `$${value.toLocaleString()}`;
}

export default function DashboardPage() {
  const { activeWorkspace } = useWorkspace();

  const [jobItems] = useStoredJsonState<Job[]>(storageKeys.jobs, []);
  const [clientItems] = useStoredJsonState<ClientRow[]>(
    storageKeys.clients,
    []
  );
  const [invoiceItems] = useStoredJsonState<InvoiceRow[]>(
    storageKeys.invoices,
    []
  );
  const [inventoryItems] = useStoredJsonState<DashboardInventoryItem[]>(
    storageKeys.inventory,
    []
  );
  const [expenseItems] = useStoredJsonState<Expense[]>(
    storageKeys.expenses,
    []
  );

  const workspaceClients = clientItems.filter(
    (client) => client.workspaceId === activeWorkspace.id
  );

  const workspaceJobs = jobItems.filter(
    (job) => job.workspaceId === activeWorkspace.id
  );

  const workspaceInvoices = invoiceItems.filter(
    (invoice) => invoice.workspaceId === activeWorkspace.id
  );

  const workspaceInventory = inventoryItems.filter(
    (item) => item.workspaceId === activeWorkspace.id
  );

  const workspaceExpenses = expenseItems.filter(
    (expense) => expense.workspaceId === activeWorkspace.id
  );

  const activeClients = workspaceClients.length;

  const openQuotes = workspaceJobs.filter(
    (job) => job.status === "Quoted"
  ).length;

  const scheduledJobs = workspaceJobs.filter(
    (job) => job.status === "Scheduled"
  ).length;

  const outstandingInvoices = workspaceInvoices
    .filter((invoice) => invoice.status !== "Paid")
    .reduce((total, invoice) => total + getInvoiceTotals(invoice).total, 0);

  const totalExpenses = workspaceExpenses.reduce(
    (total, expense) => total + moneyToNumber(expense.amount),
    0
  );

  const inventoryAlerts = workspaceInventory.filter(
    (item) => item.warning
  ).length;

  const recentActivity = [
    `- ${activeClients} active client(s)`,
    `- ${workspaceJobs.length} total job(s)`,
    `- ${openQuotes} open quote(s)`,
    `- ${scheduledJobs} scheduled job(s)`,
    `- ${inventoryAlerts} inventory alert(s)`,
    `- ${workspaceInvoices.length} invoice(s) in system`,
    `- ${formatMoney(totalExpenses)} tracked expense(s)`,
  ];

  return (
    <div className="w-full max-w-full">


      <div className="mb-6 rounded-lg bg-white p-4 shadow dark:bg-gray-900">
        <h2 className="mb-3 text-lg font-semibold text-gray-950 dark:text-gray-100">
          Quick Actions
        </h2>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/clients"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + Client
          </Link>

          <Link
            href="/jobs"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + Job
          </Link>

          <Link
            href="/invoices/new"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + Invoice
          </Link>

          <button
            type="button"
            disabled
            title="Coming with document and voice capture workflows"
            className="cursor-not-allowed rounded-lg bg-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-400"
          >
            Speech
          </button>
          <button
            type="button"
            disabled
            title="Coming with document and image extraction workflows"
            className="cursor-not-allowed rounded-lg bg-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-400"
          >
            Image
          </button>
        </div>
      </div>

      <div
        className="mb-8"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: "8px",
          width: "100%",
          maxWidth: "100%",
        }}
      >
        <StatCard title="Active Clients" value={String(activeClients)} />

        <StatCard title="Open Quotes" value={String(openQuotes)} />

        <StatCard
          title="Outstanding Invoices"
          value={formatMoney(outstandingInvoices)}
        />

        <StatCard title="Inventory Alerts" value={String(inventoryAlerts)} />
      </div>

      <div className="mt-6 rounded-lg bg-white p-6 shadow dark:bg-gray-900">
        <h2 className="mb-4 text-xl font-semibold text-gray-950 dark:text-gray-100">
          Recent Activity
        </h2>

        <ul className="space-y-3 break-words text-gray-900 dark:text-gray-100">
          {recentActivity.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
