# Frontier Project Checkpoint

## Project Tree

```text
📄 .gitignore
📄 AGENTS.md
📁 app
  📁 calendar
    📄 page.tsx
  📁 clients
    📁 [id]
      📄 page.tsx
    📄 page.tsx
  📁 dashboard
    📄 page.tsx
  📁 documents
    📄 page.tsx
  📄 favicon.ico
  📁 financials
    📄 page.tsx
  📄 globals.css
  📁 inventory
    📄 page.tsx
  📁 jobs
    📁 [id]
      📄 page.tsx
    📁 new
      📄 page.tsx
    📄 page.tsx
  📄 layout.tsx
  📁 logistics
    📄 page.tsx
  📄 page.tsx
  📁 settings
    📄 page.tsx
📄 CLAUDE.md
📁 components
  📄 AppShell.tsx
  📄 Sidebar.tsx
  📄 Statcard.tsx
  📄 WorkspaceContext.tsx
📄 eslint.config.mjs
📁 lib
  📄 jobs.ts
📄 next-env.d.ts
📄 next.config.ts
📄 package-lock.json
📄 package.json
📄 postcss.config.mjs
📄 project_checkpoint.md
📁 public
  📄 file.svg
  📄 globe.svg
  📄 next.svg
  📄 vercel.svg
  📄 window.svg
📄 README.md
📄 tsconfig.json
```

## Source Files

## AGENTS.md

```markdown
<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
```

## app\calendar\page.tsx

```tsx
"use client";

import { jobs } from "@/lib/jobs";
import { useWorkspace } from "@/components/WorkspaceContext";

function getJobColor(status: string) {
  switch (status) {
    case "Lead":
      return "bg-gray-500";
    case "Quoted":
      return "bg-yellow-500";
    case "Scheduled":
      return "bg-blue-500";
    case "Completed":
      return "bg-green-500";
    case "Paid":
      return "bg-purple-500";
    default:
      return "bg-gray-500";
  }
}

export default function CalendarPage() {
  const { activeWorkspace } = useWorkspace();

  const workspaceJobs = jobs.filter(
    (job) => job.workspaceId === activeWorkspace.id
  );

  const days = Array.from({ length: 35 }, (_, index) => index + 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-950 dark:text-gray-100">
          Calendar
        </h1>

        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Schedule for {activeWorkspace.name}
        </p>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow dark:bg-gray-900 sm:p-6">
        <h2 className="mb-4 text-xl font-semibold text-gray-950 dark:text-gray-100">
          June 2026
        </h2>

        <div className="overflow-x-auto">
          <div className="grid min-w-full grid-cols-7 gap-1 lg:gap-2">
            {days.map((day) => {
              const dayString = `2026-06-${String(day).padStart(2, "0")}`;

              const dayJobs = workspaceJobs.filter(
                (job) => job.date === dayString
              );

              return (
                <div
                  key={day}
                  className="min-h-24 rounded-lg border border-gray-200 p-2 dark:border-gray-800 lg:min-h-28"
                >
                  <div className="font-semibold text-gray-950 dark:text-gray-100">
                    {day <= 30 ? day : ""}
                  </div>

                  {dayJobs.map((job) => (
                    <div
                      key={job.id}
                      className={`mt-1 rounded px-2 py-1 text-xs font-medium text-white ${getJobColor(
                        job.status
                      )}`}
                    >
                      {job.name}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {workspaceJobs.length === 0 && (
          <div className="mt-8 text-center text-lg text-gray-500 dark:text-gray-400">
            No scheduled jobs for {activeWorkspace.name}
          </div>
        )}
      </div>
    </div>
  );
}
```

## app\clients\[id]\page.tsx

```tsx
export default async function ClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        Client #{id}
      </h1>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">
          Client Information
        </h2>

        <p>Name: John Smith</p>
        <p>Phone: (555) 123-4567</p>
        <p>Email: john@example.com</p>
        <p>Balance Due: $450</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">
          Jobs
        </h2>

        <ul>
          <li>Spring Cleanup</li>
          <li>Mulch Installation</li>
          <li>Weekly Maintenance</li>
        </ul>
      </div>
    </div>
  );
}
```

## app\clients\page.tsx

```tsx
"use client";

import Link from "next/link";
import { useWorkspace } from "@/components/WorkspaceContext";

const clients = [
  {
    id: 1,
    name: "John Smith",
    status: "Active",
    balance: "$450",
    workspaceId: "landscaping",
  },
  {
    id: 2,
    name: "Acme HOA",
    status: "Active",
    balance: "$1,200",
    workspaceId: "properties",
  },
  {
    id: 3,
    name: "Sunset Apartments",
    status: "Lead",
    balance: "$0",
    workspaceId: "properties",
  },
  {
    id: 4,
    name: "City Snow Contract",
    status: "Active",
    balance: "$2,800",
    workspaceId: "snow-removal",
  },
];

export default function ClientsPage() {
  const { activeWorkspace } = useWorkspace();

  const workspaceClients = clients.filter(
    (client) => client.workspaceId === activeWorkspace.id
  );

  return (
    <div className="space-y-6 text-gray-950 dark:text-gray-100">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>

          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {activeWorkspace.name} clients
          </p>
        </div>

        <button className="w-full rounded-lg bg-blue-600 px-4 py-2 text-center text-white hover:bg-blue-700 sm:w-auto">
          + Add Client
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg bg-white shadow dark:bg-gray-900">
        <table className="min-w-[600px] w-full">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr className="text-gray-700 dark:text-gray-300">
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Balance</th>
            </tr>
          </thead>

          <tbody>
            {workspaceClients.length > 0 ? (
              workspaceClients.map((client) => (
                <tr
                  key={client.id}
                  className="border-t border-gray-200 text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
                >
                  <td className="p-4 break-words">
                    <Link
                      href={`/clients/${client.id}`}
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {client.name}
                    </Link>
                  </td>

                  <td className="p-4">{client.status}</td>

                  <td className="p-4">{client.balance}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={3}
                  className="p-10 text-center text-lg text-gray-500 dark:text-gray-400"
                >
                  No clients found for {activeWorkspace.name}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

## app\dashboard\page.tsx

```tsx
"use client";

import StatCard from "../../components/Statcard";
import { useWorkspace } from "@/components/WorkspaceContext";

const dashboardData = {
  landscaping: {
    activeClients: 24,
    openQuotes: 8,
    outstandingInvoices: "$4,200",
    inventoryAlerts: 3,
    activity: [
      "✓ Quote sent to Smith Landscaping",
      "✓ Invoice paid by Green Valley HOA",
      "✓ Inventory order submitted",
      "✓ Job scheduled for Friday",
    ],
  },

  "snow-removal": {
    activeClients: 12,
    openQuotes: 4,
    outstandingInvoices: "$2,850",
    inventoryAlerts: 5,
    activity: [
      "✓ Salt delivery received",
      "✓ Snow route assigned",
      "✓ Invoice paid by City Contract",
      "✓ Equipment maintenance completed",
    ],
  },

  properties: {
    activeClients: 18,
    openQuotes: 2,
    outstandingInvoices: "$7,100",
    inventoryAlerts: 1,
    activity: [
      "✓ New tenant work order created",
      "✓ Property inspection completed",
      "✓ HOA invoice generated",
      "✓ Maintenance request closed",
    ],
  },
};

export default function DashboardPage() {
  const { activeWorkspace } = useWorkspace();

  const data =
    dashboardData[activeWorkspace.id as keyof typeof dashboardData] ??
    dashboardData.landscaping;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-950 dark:text-gray-100">
          Dashboard
        </h1>

        <p className="mt-2 text-gray-500 dark:text-gray-400">
          {activeWorkspace.name}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Active Clients" value={String(data.activeClients)} />

        <StatCard title="Open Quotes" value={String(data.openQuotes)} />

        <StatCard
          title="Outstanding Invoices"
          value={data.outstandingInvoices}
        />

        <StatCard
          title="Inventory Alerts"
          value={String(data.inventoryAlerts)}
        />
      </div>

      <div className="mt-8 rounded-lg bg-white p-6 shadow dark:bg-gray-900">
        <h2 className="mb-4 text-xl font-semibold text-gray-950 dark:text-gray-100">
          Recent Activity
        </h2>

        <ul className="space-y-3 break-words text-gray-900 dark:text-gray-100">
          {data.activity.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

## app\documents\page.tsx

```tsx
"use client";

import { useState } from "react";
import { useWorkspace } from "@/components/WorkspaceContext";

export default function DocumentsPage() {
  const { activeWorkspace } = useWorkspace();
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-950 dark:text-gray-100">
            Documents
          </h1>

          <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
            Contracts, quotes, invoices, and photos for {activeWorkspace.name}
          </p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="w-full rounded-lg bg-blue-600 px-6 py-3 text-center text-white shadow hover:bg-blue-700 sm:w-auto"
        >
          + Upload Document
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <table className="min-w-[650px] w-full">
          <thead>
            <tr className="border-b border-gray-200 text-left text-sm uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:text-gray-400">
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4 text-right">File</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td
                colSpan={3}
                className="px-6 py-16 text-center text-2xl text-gray-500 dark:text-gray-400"
              >
                No documents uploaded for {activeWorkspace.name}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-4 sm:p-6 lg:p-8 shadow-xl dark:bg-gray-900">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-950 dark:text-gray-100">
                Upload Document
              </h2>

              <button
                onClick={() => setIsUploadOpen(false)}
                className="text-2xl text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ×
              </button>
            </div>

            <form className="space-y-6">
              <div>
                <label className="mb-2 block text-lg font-medium text-gray-900 dark:text-gray-100">
                  Workspace
                </label>

                <input
                  value={activeWorkspace.name}
                  readOnly
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-lg text-gray-700 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                />
              </div>

              <div>
                <label className="mb-2 block text-lg font-medium text-gray-900 dark:text-gray-100">
                  Name *
                </label>

                <input
                  type="text"
                  placeholder="Document name"
                  className="w-full rounded-lg border border-blue-500 bg-white px-4 py-3 text-lg text-gray-950 outline-none dark:bg-gray-800 dark:text-gray-100"
                />
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-lg font-medium text-gray-900 dark:text-gray-100">
                    Type
                  </label>

                  <select className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-lg text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
                    <option>Other</option>
                    <option>Contract</option>
                    <option>Quote</option>
                    <option>Invoice</option>
                    <option>Photo</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-lg font-medium text-gray-900 dark:text-gray-100">
                    Client
                  </label>

                  <select className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-lg text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
                    <option>None</option>
                    <option>John Smith</option>
                    <option>Acme HOA</option>
                    <option>Sunset Apartments</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-lg font-medium text-gray-900 dark:text-gray-100">
                  File
                </label>

                <input
                  type="file"
                  className="block w-full text-sm text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-lg font-medium text-gray-900 dark:text-gray-100">
                  Notes
                </label>

                <textarea
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-lg text-gray-900 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="w-full rounded-lg border border-gray-200 px-6 py-3 text-lg text-gray-900 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800 sm:w-auto"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-blue-500 px-6 py-3 text-lg font-semibold text-white hover:bg-blue-600 sm:w-auto"
                >
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
```

## app\financials\page.tsx

```tsx
"use client";

import { useWorkspace } from "@/components/WorkspaceContext";

const invoices = [
  {
    id: "INV-001",
    status: "Paid",
    amount: "$850",
    workspaceId: "landscaping",
  },
  {
    id: "INV-005",
    status: "Sent",
    amount: "$450",
    workspaceId: "landscaping",
  },
  {
    id: "INV-002",
    status: "Overdue",
    amount: "$2,400",
    workspaceId: "snow-removal",
  },
  {
    id: "INV-003",
    status: "Paid",
    amount: "$3,200",
    workspaceId: "properties",
  },
  {
    id: "INV-004",
    status: "Sent",
    amount: "$1,200",
    workspaceId: "properties",
  },
];

const expenses = [
  {
    description: "Mulch bulk order",
    category: "Materials",
    amount: "$1,750",
    workspaceId: "landscaping",
  },
  {
    description: "Fuel for fleet",
    category: "Fuel",
    amount: "$420",
    workspaceId: "landscaping",
  },
  {
    description: "Salt bulk order",
    category: "Materials",
    amount: "$900",
    workspaceId: "snow-removal",
  },
  {
    description: "Snow plow maintenance",
    category: "Equipment",
    amount: "$380",
    workspaceId: "snow-removal",
  },
  {
    description: "Monthly property insurance",
    category: "Insurance",
    amount: "$650",
    workspaceId: "properties",
  },
];

function moneyToNumber(value: string) {
  return Number(value.replace(/[$,]/g, ""));
}

function formatMoney(value: number) {
  return `$${value.toLocaleString()}`;
}

function StatusBadge({ status }: { status: string }) {
  const classes =
    status === "Paid"
      ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
      : status === "Sent"
      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
      : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300";

  return (
    <span className={`rounded-full px-3 py-1 text-sm ${classes}`}>
      {status}
    </span>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  iconClass,
  note,
}: {
  title: string;
  value: string;
  icon: string;
  iconClass: string;
  note?: string;
}) {
  return (
    <div className="flex min-h-36 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div>
        <p className="text-lg text-gray-500 dark:text-gray-400">{title}</p>

        <p className="mt-2 text-4xl font-bold text-gray-950 dark:text-gray-100">
          {value}
        </p>

        {note && <p className="mt-3 text-green-600">{note}</p>}
      </div>

      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${iconClass}`}
      >
        {icon}
      </div>
    </div>
  );
}

export default function FinancialsPage() {
  const { activeWorkspace } = useWorkspace();

  const workspaceInvoices = invoices.filter(
    (invoice) => invoice.workspaceId === activeWorkspace.id
  );

  const workspaceExpenses = expenses.filter(
    (expense) => expense.workspaceId === activeWorkspace.id
  );

  const revenue = workspaceInvoices
    .filter((invoice) => invoice.status === "Paid")
    .reduce((total, invoice) => total + moneyToNumber(invoice.amount), 0);

  const outstanding = workspaceInvoices
    .filter((invoice) => invoice.status !== "Paid")
    .reduce((total, invoice) => total + moneyToNumber(invoice.amount), 0);

  const totalExpenses = workspaceExpenses.reduce(
    (total, expense) => total + moneyToNumber(expense.amount),
    0
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-950 dark:text-gray-100">
          Financials
        </h1>

        <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
          Revenue, expenses, and cash flow for {activeWorkspace.name}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Revenue"
          value={formatMoney(revenue)}
          icon="$"
          iconClass="bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300"
          note="Workspace total"
        />

        <SummaryCard
          title="Expenses"
          value={formatMoney(totalExpenses)}
          icon="↘"
          iconClass="bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300"
        />

        <SummaryCard
          title="Outstanding Invoices"
          value={formatMoney(outstanding)}
          icon="◷"
          iconClass="bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300"
        />

        <SummaryCard
          title="Accounts Receivable"
          value={formatMoney(outstanding)}
          icon="↗"
          iconClass="bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300"
        />
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-200 p-6 dark:border-gray-800">
            <h2 className="text-2xl font-bold text-gray-950 dark:text-gray-100">
              Recent Invoices
            </h2>
          </div>

          <table className="min-w-[650px] w-full">
            <thead>
              <tr className="border-b border-gray-200 text-left text-sm uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:text-gray-400">
                <th className="px-6 py-4">Invoice</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>

            <tbody>
              {workspaceInvoices.length > 0 ? (
                workspaceInvoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="border-b border-gray-200 text-base lg:text-lg last:border-b-0 dark:border-gray-800"
                  >
                    <td className="px-6 py-5 font-medium text-gray-950 dark:text-gray-100">
                      {invoice.id}
                    </td>

                    <td className="px-6 py-5">
                      <StatusBadge status={invoice.status} />
                    </td>

                    <td className="px-6 py-5 text-right font-medium text-gray-950 dark:text-gray-100">
                      {invoice.amount}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-12 text-center text-lg text-gray-500 dark:text-gray-400"
                  >
                    No invoices for {activeWorkspace.name}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-200 p-6 dark:border-gray-800">
            <h2 className="text-2xl font-bold text-gray-950 dark:text-gray-100">
              Recent Expenses
            </h2>
          </div>

          <table className="min-w-[650px] w-full">
            <thead>
              <tr className="border-b border-gray-200 text-left text-sm uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:text-gray-400">
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>

            <tbody>
              {workspaceExpenses.length > 0 ? (
                workspaceExpenses.map((expense) => (
                  <tr
                    key={expense.description}
                    className="border-b border-gray-200 text-base lg:text-lg last:border-b-0 dark:border-gray-800"
                  >
                    <td className="px-6 py-5 font-medium text-gray-950 dark:text-gray-100">
                      {expense.description}
                    </td>

                    <td className="px-6 py-5 text-gray-500 dark:text-gray-400">
                      {expense.category}
                    </td>

                    <td className="px-6 py-5 text-right font-medium text-red-600 dark:text-red-400">
                      {expense.amount}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-12 text-center text-lg text-gray-500 dark:text-gray-400"
                  >
                    No expenses for {activeWorkspace.name}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
```

## app\globals.css

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

:root {
  --background: #f3f4f6;
  --foreground: #111827;
}

body {
  margin: 0;
  background-color: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
  min-height: 100vh;
}

* {
  box-sizing: border-box;
}

.dark .bg-white {
  background-color: #111827;
}

.dark .text-gray-950,
.dark .text-gray-900,
.dark .text-gray-800,
.dark .text-gray-700 {
  color: #f9fafb;
}

.dark .text-gray-600,
.dark .text-gray-500 {
  color: #9ca3af;
}

.dark .border-gray-200,
.dark .border-gray-100 {
  border-color: #374151;
}

.dark input,
.dark select,
.dark textarea {
  background-color: #111827;
  color: #f9fafb;
  border-color: #374151;
}
```

## app\inventory\page.tsx

```tsx
"use client";

import { useWorkspace } from "@/components/WorkspaceContext";

const inventory = [
  {
    name: "Gasoline (gallons)",
    currentQty: 20,
    targetQty: 40,
    warning: false,
    workspaceId: "landscaping",
  },
  {
    name: "Mulch (cubic yards)",
    currentQty: 12,
    targetQty: 50,
    warning: true,
    workspaceId: "landscaping",
  },
  {
    name: "Fertilizer (50lb bags)",
    currentQty: 8,
    targetQty: 25,
    warning: true,
    workspaceId: "landscaping",
  },
  {
    name: "Salt Bags",
    currentQty: 18,
    targetQty: 80,
    warning: true,
    workspaceId: "snow-removal",
  },
  {
    name: "Ice Melt Buckets",
    currentQty: 10,
    targetQty: 30,
    warning: true,
    workspaceId: "snow-removal",
  },
  {
    name: "Snow Shovels",
    currentQty: 14,
    targetQty: 12,
    warning: false,
    workspaceId: "snow-removal",
  },
  {
    name: "HVAC Filters",
    currentQty: 22,
    targetQty: 40,
    warning: true,
    workspaceId: "properties",
  },
  {
    name: "Light Bulbs",
    currentQty: 60,
    targetQty: 50,
    warning: false,
    workspaceId: "properties",
  },
];

export default function InventoryPage() {
  const { activeWorkspace } = useWorkspace();

  const workspaceInventory = inventory.filter(
    (item) => item.workspaceId === activeWorkspace.id
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-950 dark:text-gray-100">
            Inventory
          </h1>

          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Track supplies and materials for {activeWorkspace.name}
          </p>
        </div>

        <button className="w-full rounded-lg bg-blue-600 px-6 py-3 text-center text-white shadow hover:bg-blue-700 sm:w-auto">
          + Add Item
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <table className="min-w-[700px] w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-white text-sm uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
              <th className="px-6 py-4 text-left">Item Name</th>
              <th className="px-6 py-4 text-center">Current Qty</th>
              <th className="px-6 py-4 text-center">Target Qty</th>
              <th className="px-6 py-4 text-right">Suggested Order</th>
            </tr>
          </thead>

          <tbody>
            {workspaceInventory.length > 0 ? (
              workspaceInventory.map((item) => {
                const suggestedOrder = item.targetQty - item.currentQty;

                return (
                  <tr
                    key={item.name}
                    className="border-b border-gray-200 text-base lg:text-lg last:border-b-0 dark:border-gray-800"
                  >
                    <td className="px-6 py-5 font-medium text-gray-950 dark:text-gray-100">
                      <div className="flex items-center gap-3">
                        {item.warning && (
                          <span className="text-orange-500">⚠</span>
                        )}

                        <span>{item.name}</span>
                      </div>
                    </td>

                    <td
                      className={`px-6 py-5 text-center ${
                        item.warning
                          ? "text-red-600 dark:text-red-400"
                          : "text-gray-900 dark:text-gray-100"
                      }`}
                    >
                      {item.currentQty}
                    </td>

                    <td className="px-6 py-5 text-center text-gray-500 dark:text-gray-400">
                      {item.targetQty}
                    </td>

                    <td
                      className={`px-6 py-5 text-right ${
                        item.warning
                          ? "text-orange-600 dark:text-orange-400"
                          : "text-green-600 dark:text-green-400"
                      }`}
                    >
                      {item.warning ? suggestedOrder : "—"}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-16 text-center text-xl text-gray-500 dark:text-gray-400"
                >
                  No inventory items for {activeWorkspace.name}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

## app\jobs\[id]\page.tsx

```tsx
import { jobs } from "@/lib/jobs";

export default async function JobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const job = jobs.find((j) => j.id === id);

  if (!job) {
    return (
      <div className="p-6">
        <h1>Job not found</h1>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {job.name}
        </h1>

        <p className="text-gray-500">
          {job.client}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          Job Information
        </h2>

        <div className="space-y-3">
          <p>
            <strong>Client:</strong> {job.client}
          </p>

          <div className="flex items-center gap-2">
            <strong>Status:</strong>

            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                job.status === "Lead"
                  ? "bg-gray-400 text-gray-700"
                  : job.status === "Quoted"
                  ? "bg-yellow-100 text-yellow-700"
                  : job.status === "Scheduled"
                  ? "bg-blue-100 text-blue-700"
                  : job.status === "Completed"
                  ? "bg-green-100 text-green-700"
                  : "bg-purple-100 text-purple-700"
              }`}
            >
              {job.status}
            </span>
          </div>

          <p>
            <strong>Scheduled Date:</strong> {job.date}
          </p>

          <p>
            <strong>Estimated Value:</strong> {job.value}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          Materials
        </h2>

        <ul className="list-disc ml-6">
          <li>5 bags mulch</li>
          <li>Fertilizer</li>
          <li>Trimmer line</li>
        </ul>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          Notes
        </h2>

        <p>
          Customer requested cleanup around front flower beds.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          Invoice
        </h2>

        <p>Total: {job.value}</p>
        <p>Status: Unpaid</p>
      </div>
    </div>
  );
}
```

## app\jobs\new\page.tsx

```tsx
export default function NewJobPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          New Job
        </h1>

        <p className="text-gray-500">
          Create a new job for a client
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form className="space-y-6">

          <div>
            <label className="block text-sm font-medium mb-2">
              Client
            </label>

            <input
              type="text"
              placeholder="John Smith"
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Job Name
            </label>

            <input
              type="text"
              placeholder="Spring Cleanup"
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Status
            </label>

            <select
              className="w-full border rounded-lg p-3"
              defaultValue="Lead"
            >
              <option>Lead</option>
              <option>Quoted</option>
              <option>Scheduled</option>
              <option>Completed</option>
              <option>Paid</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Estimated Value
            </label>

            <input
              type="text"
              placeholder="$500"
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Notes
            </label>

            <textarea
              rows={5}
              placeholder="Job details..."
              className="w-full border rounded-lg p-3"
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Create Job
          </button>

        </form>
      </div>
    </div>
  );
}
```

## app\jobs\page.tsx

```tsx
"use client";

import Link from "next/link";
import { jobs } from "@/lib/jobs";
import { useWorkspace } from "@/components/WorkspaceContext";

type Job = {
  id: string;
  name: string;
};

function JobColumn({
  title,
  jobs,
}: {
  title: string;
  jobs: Job[];
}) {
  return (
    <div className="rounded-xl bg-white p-4 shadow dark:bg-gray-900">
      <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-gray-100">
        {title}
      </h2>

      <div className="space-y-3">
        {jobs.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-3 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
            No jobs
          </div>
        ) : (
          jobs.map((job) => (
            <div
              key={job.id}
              className="rounded-lg bg-gray-100 p-3 text-gray-900 transition hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
            >
              <Link
                href={`/jobs/${job.id}`}
                className="block w-full"
              >
                {job.name}
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function JobsPage() {
  const { activeWorkspace } = useWorkspace();

  const workspaceJobs = jobs.filter(
    (job) => job.workspaceId === activeWorkspace.id
  );

  const lead = workspaceJobs.filter((job) => job.status === "Lead");
  const quoted = workspaceJobs.filter((job) => job.status === "Quoted");
  const scheduled = workspaceJobs.filter((job) => job.status === "Scheduled");
  const completed = workspaceJobs.filter((job) => job.status === "Completed");
  const paid = workspaceJobs.filter((job) => job.status === "Paid");

  return (
    <div className="space-y-6 text-gray-950 dark:text-gray-100">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Jobs
          </h1>

          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {activeWorkspace.name}
          </p>
        </div>

        <Link
          href="/jobs/new"
          className="w-full rounded-lg bg-blue-600 px-4 py-3 text-center text-white hover:bg-blue-700 sm:w-auto"
        >
          + Add Job
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-5">
        <JobColumn title="Lead" jobs={lead} />
        <JobColumn title="Quoted" jobs={quoted} />
        <JobColumn title="Scheduled" jobs={scheduled} />
        <JobColumn title="Completed" jobs={completed} />
        <JobColumn title="Paid" jobs={paid} />
      </div>
    </div>
  );
}
```

## app\layout.tsx

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";
import { WorkspaceProvider } from "@/components/WorkspaceContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Frontier",
  description: "Business Operations Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body>
        <WorkspaceProvider>
          <AppShell>
            {children}
          </AppShell>
        </WorkspaceProvider>
      </body>
    </html>
  );
}
```

## app\logistics\page.tsx

```tsx
"use client";

import { useMemo, useState } from "react";
import { jobs } from "@/lib/jobs";
import { useWorkspace } from "@/components/WorkspaceContext";

const jobTypes = ["All", "Lead", "Quoted", "Scheduled", "Completed"];

export default function LogisticsPage() {
  const { activeWorkspace } = useWorkspace();
  const [selectedType, setSelectedType] = useState("All");
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([]);

  const workspaceJobs = jobs.filter(
    (job) => job.workspaceId === activeWorkspace.id
  );

  const filteredJobs =
    selectedType === "All"
      ? workspaceJobs
      : workspaceJobs.filter((job) => job.status === selectedType);

  const visibleJobs = useMemo(() => {
    return [...filteredJobs].sort((a, b) => {
      const dateA = a.date ?? "";
      const dateB = b.date ?? "";

      return dateA.localeCompare(dateB);
    });
  }, [filteredJobs]);

  const routeJobs = visibleJobs.filter((job) =>
    selectedJobIds.includes(job.id)
  );

  function toggleJob(jobId: string) {
    setSelectedJobIds((current) =>
      current.includes(jobId)
        ? current.filter((id) => id !== jobId)
        : [...current, jobId]
    );
  }

  function selectAllVisibleJobs() {
    setSelectedJobIds(visibleJobs.map((job) => job.id));
  }

  function clearRoute() {
    setSelectedJobIds([]);
  }

  function getPinPosition(index: number) {
    return {
      left: 12 + ((index * 23) % 72),
      top: 15 + ((index * 31) % 68),
    };
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-950 dark:text-gray-100">
            Logistics
          </h1>

          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Route planning for {activeWorkspace.name}
          </p>
        </div>

        <select
          value={selectedType}
          onChange={(event) => {
            setSelectedType(event.target.value);
            setSelectedJobIds([]);
          }}
          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm lg:w-auto dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
        >
          {jobTypes.map((type) => (
            <option key={type}>{type}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_420px]">
        <div className="relative min-h-[620px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#d1d5db_1px,transparent_1px),linear-gradient(to_bottom,#d1d5db_1px,transparent_1px)] bg-[size:70px_70px] opacity-50 dark:opacity-10" />

          <div className="absolute inset-0 opacity-70 dark:opacity-20">
            <div className="absolute left-[8%] top-[18%] h-3 w-[78%] rotate-[-8deg] rounded-full bg-gray-300 dark:bg-gray-700" />
            <div className="absolute left-[18%] top-[58%] h-3 w-[72%] rotate-[12deg] rounded-full bg-gray-300 dark:bg-gray-700" />
            <div className="absolute left-[40%] top-[8%] h-[80%] w-3 rotate-[6deg] rounded-full bg-gray-300 dark:bg-gray-700" />
            <div className="absolute left-[5%] top-[38%] h-3 w-[40%] rotate-[3deg] rounded-full bg-gray-300 dark:bg-gray-700" />
            <div className="absolute left-[62%] top-[28%] h-[50%] w-3 rotate-[-14deg] rounded-full bg-gray-300 dark:bg-gray-700" />
          </div>

          <div className="relative h-full p-6">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-950 dark:text-gray-100">
                  Client Location Map
                </h2>

                <p className="mt-1 text-gray-500 dark:text-gray-400">
                  Select client pins to build an efficient route
                </p>
              </div>

              <div className="rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                {routeJobs.length} selected
              </div>
            </div>

            <div className="relative h-[500px] overflow-hidden rounded-xl border border-gray-200 bg-green-50 dark:border-gray-800 dark:bg-gray-950">
              {visibleJobs.length > 0 ? (
                visibleJobs.map((job, index) => {
                  const position = getPinPosition(index);
                  const isSelected = selectedJobIds.includes(job.id);
                  const routeNumber =
                    routeJobs.findIndex((routeJob) => routeJob.id === job.id) +
                    1;

                  return (
                    <button
                      key={job.id}
                      type="button"
                      onClick={() => toggleJob(job.id)}
                      className="absolute"
                      style={{
                        left: `${position.left}%`,
                        top: `${position.top}%`,
                      }}
                    >
                      <div className="flex -translate-x-1/2 -translate-y-full flex-col items-center">
                        <div className="relative flex flex-col items-center">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white shadow-lg ring-4 ${
                              isSelected
                                ? "bg-blue-600 ring-white dark:ring-gray-900"
                                : "bg-gray-500 ring-white/80 dark:ring-gray-900"
                            }`}
                          >
                            {isSelected ? routeNumber : "+"}
                          </div>

                          <div
                            className={`-mt-1 h-4 w-4 rotate-45 shadow-lg ${
                              isSelected ? "bg-blue-600" : "bg-gray-500"
                            }`}
                          />
                        </div>

                        <div className="mt-2 max-w-36 rounded-lg bg-white px-3 py-2 text-center text-xs font-medium text-gray-900 shadow dark:bg-gray-800 dark:text-gray-100">
                          {job.name}
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="flex h-full items-center justify-center text-lg text-gray-500 dark:text-gray-400">
                  No jobs found for this filter
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-xl font-bold text-gray-950 dark:text-gray-100">
              Route Builder
            </h2>

            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Add or remove jobs from the route
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={selectAllVisibleJobs}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 sm:w-auto"
              >
                + Add All
              </button>

              <button
                type="button"
                onClick={clearRoute}
                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 sm:w-auto"
              >
                Clear Route
              </button>
            </div>

            <div className="mt-6 space-y-3">
              {visibleJobs.length > 0 ? (
                visibleJobs.map((job) => {
                  const isSelected = selectedJobIds.includes(job.id);

                  return (
                    <button
                      key={job.id}
                      type="button"
                      onClick={() => toggleJob(job.id)}
                      className={`w-full rounded-xl border p-4 text-left ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40"
                          : "border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-gray-950 dark:text-gray-100">
                            {job.name}
                          </h3>

                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {job.status}
                            {job.date ? ` · ${job.date}` : ""}
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-sm font-semibold ${
                            isSelected
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                          }`}
                        >
                          {isSelected ? "−" : "+"}
                        </span>
                      </div>
                    </button>
                  );
                })
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  No jobs available.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-xl font-bold text-gray-950 dark:text-gray-100">
              Suggested Route
            </h2>

            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Current selected stop order
            </p>

            <div className="mt-6 space-y-4">
              {routeJobs.length > 0 ? (
                routeJobs.map((job, index) => (
                  <div
                    key={job.id}
                    className="rounded-xl border border-gray-200 p-4 dark:border-gray-800"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                        {index + 1}
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-950 dark:text-gray-100">
                          {job.name}
                        </h3>

                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {job.status}
                          {job.date ? ` · ${job.date}` : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  Select jobs to build a route.
                </p>
              )}
            </div>

            <button
              type="button"
              disabled={routeJobs.length < 2}
              className="mt-6 w-full rounded-lg bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              Open Route in Google Maps
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## app\page.tsx

```tsx
export default function Home() {
  return (
    <main className="min-h-screen p-10">
      <h1 className="text-5xl font-bold">
        Frontier
      </h1>

      <p className="mt-4 text-gray-500">
        Business Operations Platform
      </p>
    </main>
  );
}
```

## app\settings\page.tsx

```tsx
"use client";

import { useState } from "react";
import { useWorkspace } from "@/components/WorkspaceContext";

const roles = [
  {
    name: "Owner",
    color: "text-purple-600",
    description:
      "Full access to all features. Manage workspace settings, billing, and team members.",
  },
  {
    name: "Manager",
    color: "text-blue-600",
    description:
      "Can manage clients, inventory, and scheduling. Cannot change workspace settings.",
  },
  {
    name: "Employee",
    color: "text-gray-700 dark:text-gray-300",
    description:
      "Can view assigned jobs and notes. Read-only access to other sections.",
  },
];

export default function SettingsPage() {
  const { activeWorkspace } = useWorkspace();

  const [tab, setTab] = useState<"general" | "permissions">("general");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  function handleInviteSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    console.log("Invite sent to:", inviteEmail);
    console.log("Workspace:", activeWorkspace.name);

    setInviteEmail("");
    setInviteOpen(false);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-950 dark:text-gray-100">
          Settings
        </h1>

        <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
          Manage configuration for {activeWorkspace.name}
        </p>
      </div>

      <div className="flex w-full flex-col gap-2 rounded-xl bg-gray-100 p-1 sm:inline-flex sm:w-auto sm:flex-row dark:bg-gray-800">
        <button
          onClick={() => setTab("general")}
          className={`rounded-lg px-4 py-2 text-lg ${
            tab === "general"
              ? "bg-white text-gray-950 shadow dark:bg-gray-900 dark:text-gray-100"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          General
        </button>

        <button
          onClick={() => setTab("permissions")}
          className={`rounded-lg px-4 py-2 text-lg ${
            tab === "permissions"
              ? "bg-white text-gray-950 shadow dark:bg-gray-900 dark:text-gray-100"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          Permissions
        </button>
      </div>

      {tab === "general" && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 lg:p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="space-y-6">
            <div>
              <label className="mb-3 block text-lg font-medium text-gray-900 dark:text-gray-100">
                Workspace Name
              </label>

              <input
                value={activeWorkspace.name}
                readOnly
                className="w-full rounded-lg border border-gray-200 bg-white px-5 py-3 text-xl text-gray-950 shadow-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="mb-3 block text-lg font-medium text-gray-900 dark:text-gray-100">
                Business Type
              </label>

              <select
                defaultValue={activeWorkspace.name}
                className="w-full rounded-lg border border-gray-200 bg-white px-5 py-3 text-lg text-gray-950 shadow-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              >
                <option>Landscaping</option>
                <option>Snow Removal</option>
                <option>Properties</option>
                <option>Construction</option>
                <option>Cleaning</option>
                <option>Property Maintenance</option>
                <option>Other</option>
              </select>
            </div>

            <button 
              className="w-full rounded-lg bg-blue-600 px-6 py-3 text-lg font-semibold text-white shadow hover:bg-blue-700 sm:w-auto"
            >  
              Save Changes
            </button>
          </div>
        </div>
      )}

      {tab === "permissions" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 lg:p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-950 dark:text-gray-100">
                  Team Members
                </h2>

                <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
                  {activeWorkspace.name}
                </p>

                <p className="mt-8 text-lg text-gray-500 dark:text-gray-400">
                  No team members yet
                </p>
              </div>

              <button
                onClick={() => setInviteOpen(true)}
                className="w-full rounded-lg bg-blue-600 px-5 py-3 text-lg font-semibold text-white shadow hover:bg-blue-700 sm:w-auto"
              >
                Invite
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 lg:p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-6 text-2xl font-bold text-gray-950 dark:text-gray-100">
              Role Permissions
            </h2>

            <div className="space-y-5">
              {roles.map((role) => (
                <div
                  key={role.name}
                  className="rounded-xl border border-gray-200 p-5 dark:border-gray-800"
                >
                  <h3 className={`text-lg font-bold ${role.color}`}>
                    {role.name}
                  </h3>

                  <p className="mt-2 text-gray-500 dark:text-gray-400">
                    {role.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {inviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-xl rounded-xl bg-white p-4 sm:p-6 lg:p-8 shadow-xl dark:bg-gray-900">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-950 dark:text-gray-100">
                Invite Team Member
              </h2>

              <button
                type="button"
                onClick={() => setInviteOpen(false)}
                className="text-2xl text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-6">
              <div>
                <label className="mb-2 block text-lg font-medium text-gray-900 dark:text-gray-100">
                  Email Address *
                </label>

                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(event) => setInviteEmail(event.target.value)}
                  placeholder="employee@example.com"
                  required
                  className="w-full rounded-lg border border-blue-500 bg-white px-4 py-3 text-lg text-gray-950 outline-none dark:bg-gray-800 dark:text-gray-100"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setInviteEmail("");
                    setInviteOpen(false);
                  }}
                  className="w-full rounded-lg border border-gray-200 px-6 py-3 text-lg text-gray-900 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800 sm:w-auto"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-blue-600 px-6 py-3 text-lg font-semibold text-white shadow hover:bg-blue-700 sm:w-auto"
                >
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
```

## CLAUDE.md

```markdown
@AGENTS.md
```

## components\AppShell.tsx

```tsx
"use client";

import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import {
  useWorkspace,
  workspaces,
} from "@/components/WorkspaceContext";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [darkMode, setDarkMode] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const { activeWorkspace, setActiveWorkspace } = useWorkspace();

  useEffect(() => {
    const savedTheme = localStorage.getItem("frontier-theme");

    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  function toggleDarkMode() {
    const nextMode = !darkMode;

    setDarkMode(nextMode);

    if (nextMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("frontier-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("frontier-theme", "light");
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-950 dark:bg-gray-950 dark:text-gray-100">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <header className="flex h-20 items-center justify-between border-b border-gray-200 bg-white px-3 sm:px-6 lg:px-8 dark:border-gray-800 dark:bg-gray-900">
          <div className="relative">
            <button
              onClick={() => {
                setWorkspaceOpen(!workspaceOpen);
                setUserOpen(false);
              }}
              className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
            >
              <span className="text-blue-600">
                ▤
              </span>

              <span className="font-semibold">
                {activeWorkspace.name}
              </span>

              <span className="text-gray-500">
                ⌄
              </span>
            </button>

            {workspaceOpen && (
              <div className="absolute left-0 top-14 z-50 w-72 max-w-[90vw] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
                <div className="px-4 py-3 text-sm font-semibold text-gray-500 dark:text-gray-400">
                  Workspaces
                </div>

                {workspaces.map((workspace) => (
                  <button
                    key={workspace.id}
                    onClick={() => {
                      setActiveWorkspace(workspace);
                      setWorkspaceOpen(false);
                    }}
                    className={`flex w-full items-start gap-4 px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800 ${
                      activeWorkspace.id === workspace.id
                        ? "bg-gray-100 dark:bg-gray-800"
                        : ""
                    }`}
                  >
                    <span className="mt-1 text-xl">
                      ▤
                    </span>

                    <span>
                      <span className="block font-semibold">
                        {workspace.name}
                      </span>

                      <span className="block text-sm text-gray-500 dark:text-gray-400">
                        {workspace.type}
                      </span>
                    </span>
                  </button>
                ))}

                <button
                  onClick={() => setWorkspaceOpen(false)}
                  className="flex w-full items-center gap-4 border-t border-gray-200 px-4 py-4 text-left hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  <span className="text-xl">
                    +
                  </span>

                  <span className="font-medium">
                    New Workspace
                  </span>
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-4 lg:gap-8">
            <button
              onClick={toggleDarkMode}
              className="rounded-full px-3 py-2 text-xl hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Toggle dark mode"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>

            <div className="relative">
              <button
                onClick={() => {
                  setUserOpen(!userOpen);
                  setWorkspaceOpen(false);
                }}
                className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950">
                  ♙
                </span>

                <span className="hidden font-semibold md:block">
                  Nicholas Thompson
                </span>

                <span className="text-gray-500">
                  ⌄
                </span>
              </button>

              {userOpen && (
                <div className="absolute right-0 top-14 z-50 w-72 max-w-[90vw] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
                  <div className="border-b border-gray-200 px-4 py-4 font-semibold dark:border-gray-700">
                    thomp3ns@gmail.com
                  </div>

                  <button className="flex w-full items-center gap-4 px-4 py-4 text-left hover:bg-gray-100 dark:hover:bg-gray-800">
                    <span className="text-xl">
                      ↪
                    </span>

                    <span className="font-medium">
                      Sign Out
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-3 sm:p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

## components\Sidebar.tsx

```tsx
"use client";

import Link from "next/link";
import { useState } from "react";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "▦",
  },
  {
    label: "Jobs",
    href: "/jobs",
    icon: "⚒",
  },
  {
    label: "Clients",
    href: "/clients",
    icon: "👥",
  },
  {
    label: "Calendar",
    href: "/calendar",
    icon: "▣",
  },
  {
    label: "Inventory",
    href: "/inventory",
    icon: "◈",
  },
  {
    label: "Financials",
    href: "/financials",
    icon: "$",
  },
  {
    label: "Documents",
    href: "/documents",
    icon: "▤",
  },
    {
    label: "Logistics",
    href: "/logistics",
    icon: "🗺️",
  },
  {
    label: "Settings",
    href: "/settings",
    icon: "⚙",
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <aside
      className={`min-h-screen bg-gray-900 text-white transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex h-full flex-col">
        <div
          className={`flex items-center border-b border-gray-800 p-4 ${
            collapsed ? "justify-center" : "justify-between"
          }`}
        >
          {collapsed ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-3xl font-light">
              ∞
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-3xl font-light">
                ∞
              </div>

              <h1 className="text-2xl font-bold">Frontier</h1>
            </div>
          )}
        </div>

        <nav className="flex flex-col gap-1 p-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`group relative flex items-center rounded-xl px-3 py-2.5 text-gray-300 hover:bg-blue-600 hover:text-white ${
                collapsed ? "justify-center" : "gap-3"
              }`}
            >
              <span className="w-8 text-center text-2xl leading-none">{item.icon}</span>

              {!collapsed && (
                <span className="text-base font-medium">{item.label}</span>
              )}

              {collapsed && (
                <span className="pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded-lg bg-gray-800 px-3 py-2 text-sm text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                  {item.label}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="mt-auto mb-4 p-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`flex w-full items-center rounded-xl px-3 py-3 text-gray-300 hover:bg-gray-800 hover:text-white ${
              collapsed ? "justify-center text-xl" : "gap-3"
            }`}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand" : "Collapse"}
          >
            <span className="text-xl">{collapsed ? "›" : "‹"}</span>

            {!collapsed && (
              <span className="text-base font-medium">Collapse</span>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
```

## components\Statcard.tsx

```tsx
type StatCardProps = {
  title: string;
  value: string;
};

export default function StatCard({
  title,
  value,
}: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow">
      <h2 className="text-gray-500 dark:text-gray-400 text-sm">
        {title}
      </h2>

      <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}
```

## components\WorkspaceContext.tsx

```tsx
"use client";

import { createContext, useContext, useState } from "react";

export type Workspace = {
  id: string;
  name: string;
  type: string;
};

export const workspaces: Workspace[] = [
  {
    id: "landscaping",
    name: "Landscaping",
    type: "Landscaping",
  },
  {
    id: "snow-removal",
    name: "Thompson Snow Removal",
    type: "Snow Removal",
  },
  {
    id: "properties",
    name: "Thompson Properties",
    type: "Property Management",
  },
];

type WorkspaceContextValue = {
  activeWorkspace: Workspace;
  setActiveWorkspace: (workspace: Workspace) => void;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeWorkspace, setActiveWorkspace] = useState(workspaces[0]);

  return (
    <WorkspaceContext.Provider
      value={{
        activeWorkspace,
        setActiveWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);

  if (!context) {
    throw new Error("useWorkspace must be used inside WorkspaceProvider");
  }

  return context;
}
```

## lib\jobs.ts

```typescript
export const jobs = [
  // LANDSCAPING

  {
    id: "1",
    workspaceId: "landscaping",
    name: "Jones Residence",
    client: "Jones Family",
    status: "Lead",
    value: "$200",
    date: "2026-06-10",
  },
  {
    id: "2",
    workspaceId: "landscaping",
    name: "Brown Property",
    client: "Brown Family",
    status: "Lead",
    value: "$350",
    date: "2026-06-12",
  },
  {
    id: "3",
    workspaceId: "landscaping",
    name: "Acme HOA Cleanup",
    client: "Acme HOA",
    status: "Quoted",
    value: "$1,500",
    date: "2026-06-14",
  },
  {
    id: "4",
    workspaceId: "landscaping",
    name: "Spring Cleanup",
    client: "John Smith",
    status: "Scheduled",
    value: "$450",
    date: "2026-06-15",
  },
  {
    id: "5",
    workspaceId: "landscaping",
    name: "Weekly Service",
    client: "Sunset Apartments",
    status: "Completed",
    value: "$120",
    date: "2026-06-18",
  },
  {
    id: "6",
    workspaceId: "landscaping",
    name: "Mulch Installation",
    client: "Johnson Residence",
    status: "Paid",
    value: "$800",
    date: "2026-06-17",
  },

  // SNOW REMOVAL

  {
    id: "7",
    workspaceId: "snow-removal",
    name: "Church Snow Contract",
    client: "Rochester Community Church",
    status: "Lead",
    value: "$3,500",
    date: "2026-11-01",
  },
  {
    id: "8",
    workspaceId: "snow-removal",
    name: "Office Lot Bid",
    client: "Riverside Office Park",
    status: "Quoted",
    value: "$6,800",
    date: "2026-11-05",
  },
  {
    id: "9",
    workspaceId: "snow-removal",
    name: "Condo Association",
    client: "Winter Ridge Condos",
    status: "Scheduled",
    value: "$9,200",
    date: "2026-11-10",
  },
  {
    id: "10",
    workspaceId: "snow-removal",
    name: "Emergency Salt Run",
    client: "Oakland Medical Center",
    status: "Completed",
    value: "$650",
    date: "2026-11-12",
  },
  {
    id: "11",
    workspaceId: "snow-removal",
    name: "Retail Plaza Clearing",
    client: "North Plaza",
    status: "Paid",
    value: "$2,400",
    date: "2026-11-15",
  },

  // PROPERTIES

  {
    id: "12",
    workspaceId: "properties",
    name: "Unit 204 Turnover",
    client: "Maple Grove Apartments",
    status: "Lead",
    value: "$1,200",
    date: "2026-07-01",
  },
  {
    id: "13",
    workspaceId: "properties",
    name: "HVAC Inspection",
    client: "Riverside Office Park",
    status: "Quoted",
    value: "$950",
    date: "2026-07-03",
  },
  {
    id: "14",
    workspaceId: "properties",
    name: "Parking Lot Sealcoat",
    client: "Sunset Strip Mall",
    status: "Scheduled",
    value: "$8,500",
    date: "2026-07-10",
  },
  {
    id: "15",
    workspaceId: "properties",
    name: "Roof Leak Repair",
    client: "Green Valley HOA",
    status: "Completed",
    value: "$2,100",
    date: "2026-07-12",
  },
  {
    id: "16",
    workspaceId: "properties",
    name: "Quarterly Maintenance",
    client: "Johnson Commercial",
    status: "Paid",
    value: "$4,750",
    date: "2026-07-15",
  },
];
```

## next-env.d.ts

```typescript
/// <reference types="next" />
/// <reference types="next/image-types/global" />
import "./.next/types/routes.d.ts";

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.
```

## next.config.ts

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
```

## package.json

```json
{
  "name": "frontier",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "next": "16.2.9",
    "react": "19.2.4",
    "react-dom": "19.2.4"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.2.9",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

## README.md

```markdown
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
```

## tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": ["node_modules"]
}
```

