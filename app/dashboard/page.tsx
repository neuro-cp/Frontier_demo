"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import StatCard from "../../components/Statcard";
import { useAuthSession } from "@/components/AuthSessionProvider";
import { useWorkspace } from "@/components/WorkspaceContext";
import { storageKeys, useStoredJsonState } from "@/lib/clientStorage";
import type { Job } from "@/lib/jobTypes";
import type { ClientRow } from "@/lib/clientTypes";
import type { Expense } from "@/lib/expenseTypes";
import { createClientsRepository } from "@/lib/db/clients";
import { createExpensesRepository, type ExpenseRow } from "@/lib/db/expenses";
import { createInventoryRepository, type InventoryRow } from "@/lib/db/inventory";
import { createInvoicesRepository } from "@/lib/db/invoices";
import { createJobsRepository } from "@/lib/db/jobs";
import { getInvoiceTotals, InvoiceRow } from "@/lib/frontierInvoices";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import OperationsActivityPanel from "@/app/dashboard/OperationsActivityPanel";

function moneyToNumber(value: string) {
  return Number(value.replace(/[$,]/g, ""));
}

function formatMoney(value: number) {
  return `$${value.toLocaleString()}`;
}

export default function DashboardPage() {
  const { activeWorkspace } = useWorkspace();
  const { isSupabaseConfigured, user } = useAuthSession();
  const isDatabaseMode = Boolean(isSupabaseConfigured && user);

  const [localJobItems, setLocalJobItems] = useStoredJsonState<Job[]>(storageKeys.jobs, []);
  const [localClientItems, setLocalClientItems] = useStoredJsonState<ClientRow[]>(
    storageKeys.clients,
    []
  );
  const [localInvoiceItems, setLocalInvoiceItems] = useStoredJsonState<InvoiceRow[]>(
    storageKeys.invoices,
    []
  );
  const [localInventoryItems, setLocalInventoryItems] = useStoredJsonState<InventoryRow[]>(
    storageKeys.inventory,
    []
  );
  const [localExpenseItems, setLocalExpenseItems] = useStoredJsonState<Expense[]>(
    storageKeys.expenses,
    []
  );
  const [databaseJobItems, setDatabaseJobItems] = useState<Job[]>([]);
  const [databaseClientItems, setDatabaseClientItems] = useState<ClientRow[]>([]);
  const [databaseInvoiceItems, setDatabaseInvoiceItems] = useState<InvoiceRow[]>([]);
  const [databaseInventoryItems, setDatabaseInventoryItems] = useState<InventoryRow[]>([]);
  const [databaseExpenseItems, setDatabaseExpenseItems] = useState<ExpenseRow[]>([]);
  const [dataError, setDataError] = useState("");

  const supabase = useMemo(() => (isDatabaseMode ? createBrowserSupabaseClient() : null), [isDatabaseMode]);
  const jobsRepo = useMemo(() => createJobsRepository({ isSignedIn: isDatabaseMode, supabase, localJobs: localJobItems, setLocalJobs: setLocalJobItems }), [isDatabaseMode, localJobItems, setLocalJobItems, supabase]);
  const clientsRepo = useMemo(() => createClientsRepository({ isSignedIn: isDatabaseMode, supabase, localClients: localClientItems, setLocalClients: setLocalClientItems }), [isDatabaseMode, localClientItems, setLocalClientItems, supabase]);
  const invoicesRepo = useMemo(() => createInvoicesRepository({ isSignedIn: isDatabaseMode, supabase, localInvoices: localInvoiceItems, setLocalInvoices: setLocalInvoiceItems }), [isDatabaseMode, localInvoiceItems, setLocalInvoiceItems, supabase]);
  const inventoryRepo = useMemo(() => createInventoryRepository({ isSignedIn: isDatabaseMode, supabase, localItems: localInventoryItems, setLocalItems: setLocalInventoryItems }), [isDatabaseMode, localInventoryItems, setLocalInventoryItems, supabase]);
  const expensesRepo = useMemo(() => createExpensesRepository({ isSignedIn: isDatabaseMode, supabase, localExpenses: localExpenseItems as ExpenseRow[], setLocalExpenses: setLocalExpenseItems as (value: ExpenseRow[] | ((current: ExpenseRow[]) => ExpenseRow[])) => void }), [isDatabaseMode, localExpenseItems, setLocalExpenseItems, supabase]);

  useEffect(() => {
    if (!isDatabaseMode) return;
    let cancelled = false;
    Promise.all([
      jobsRepo.getJobs(activeWorkspace.id),
      clientsRepo.getClients(activeWorkspace.id),
      invoicesRepo.getInvoices(activeWorkspace.id),
      inventoryRepo.getInventoryItems(activeWorkspace.id),
      expensesRepo.getExpenses(activeWorkspace.id),
    ]).then(([jobs, clients, invoices, inventory, expenses]) => {
      if (!cancelled) {
        setDatabaseJobItems(jobs);
        setDatabaseClientItems(clients);
        setDatabaseInvoiceItems(invoices);
        setDatabaseInventoryItems(inventory);
        setDatabaseExpenseItems(expenses);
        setDataError("");
      }
    }).catch((error) => {
      if (!cancelled) {
        setDataError(error instanceof Error ? error.message : "Unable to load dashboard data.");
      }
    });
    return () => { cancelled = true; };
  }, [activeWorkspace.id, clientsRepo, expensesRepo, inventoryRepo, invoicesRepo, isDatabaseMode, jobsRepo]);

  const jobItems = isDatabaseMode ? databaseJobItems : localJobItems;
  const clientItems = isDatabaseMode ? databaseClientItems : localClientItems;
  const invoiceItems = isDatabaseMode ? databaseInvoiceItems : localInvoiceItems;
  const inventoryItems = isDatabaseMode ? databaseInventoryItems : localInventoryItems;
  const expenseItems = isDatabaseMode ? databaseExpenseItems : localExpenseItems;

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
  const activeJobs = workspaceJobs.filter(
    (job) => job.status !== "Completed" && job.status !== "Paid"
  ).length;

  const outstandingInvoices = workspaceInvoices
    .filter((invoice) => invoice.status !== "Paid")
    .reduce((total, invoice) => total + getInvoiceTotals(invoice).total, 0);
  const paidRevenue = workspaceInvoices
    .filter((invoice) => invoice.status === "Paid")
    .reduce((total, invoice) => total + getInvoiceTotals(invoice).total, 0);
  const unpaidInvoiceCount = workspaceInvoices.filter((invoice) => invoice.status !== "Paid").length;
  const overdueInvoiceCount = workspaceInvoices.filter((invoice) => invoice.status === "Overdue").length;

  const totalExpenses = workspaceExpenses.reduce(
    (total, expense) => total + moneyToNumber(expense.amount),
    0
  );

  const inventoryAlerts = workspaceInventory.filter(
    (item) => item.warning
  ).length;

  const recentActivity = [
    `- ${activeClients} active client(s)`,
    `- ${activeJobs} active job(s)`,
    `- ${workspaceJobs.length} total job(s)`,
    `- ${openQuotes} open quote(s)`,
    `- ${scheduledJobs} scheduled job(s)`,
    `- ${unpaidInvoiceCount} unpaid invoice(s)`,
    `- ${overdueInvoiceCount} overdue invoice(s)`,
    `- ${inventoryAlerts} inventory alert(s)`,
    `- ${workspaceInvoices.length} invoice(s) in system`,
    `- ${formatMoney(paidRevenue)} paid invoice revenue`,
    `- ${formatMoney(totalExpenses)} tracked expense(s)`,
  ];

  return (
    <div className="w-full max-w-full">
      {!user && (
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
          Local demo mode stores data only in this browser. Sign in to use cloud storage, OCR, speech, AI drafts, and external route services.
        </div>
      )}
      {dataError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {dataError}
        </div>
      )}


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

          {user ? (
            <Link
              href="/review#audio-intake"
              title="Upload audio for transcription and review"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              Speech
            </Link>
          ) : (
            <button type="button" disabled title="Sign in to use speech transcription" className="cursor-not-allowed rounded-lg bg-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-400">Speech</button>
          )}
          <Link
            href="/documents"
            title="Upload a document for OCR extraction"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Image
          </Link>
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

        <StatCard title="Active Jobs" value={String(activeJobs)} />

        <StatCard
          title="Outstanding Invoices"
          value={formatMoney(outstandingInvoices)}
        />

        <StatCard title="Paid Revenue" value={formatMoney(paidRevenue)} />

        <StatCard title="Open Quotes" value={String(openQuotes)} />

        <StatCard title="Overdue Invoices" value={String(overdueInvoiceCount)} />

        <StatCard title="Inventory Alerts" value={String(inventoryAlerts)} />

        <StatCard title="Scheduled Jobs" value={String(scheduledJobs)} />
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

      {user && <OperationsActivityPanel />}
    </div>
  );
}
