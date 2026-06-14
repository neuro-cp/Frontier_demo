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
  📄 clients.ts
  📄 expenses.ts
  📄 inventory.ts
  📄 invoices.ts
  📄 jobs.ts
  📄 jobStorage.ts
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

import { useEffect, useState } from "react";
import Link from "next/link";

import { jobs as defaultJobs } from "@/lib/jobs";
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

  const [view, setView] = useState("month");
  const [jobItems, setJobItems] = useState(defaultJobs);

  useEffect(() => {
    const savedJobs = localStorage.getItem("frontier-jobs");

    if (savedJobs) {
      try {
        setJobItems(JSON.parse(savedJobs));
      } catch {
        setJobItems(defaultJobs);
      }
    }
  }, []);

  const workspaceJobs = jobItems
    .filter((job) => job.workspaceId === activeWorkspace.id)
    .filter((job) => job.date)
    .sort((a, b) => a.date.localeCompare(b.date));

  const days = Array.from({ length: 35 }, (_, index) => index + 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-950 dark:text-gray-100">
            Calendar
          </h1>

          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Schedule for {activeWorkspace.name}
          </p>
        </div>

        <select
          value={view}
          onChange={(event) => setView(event.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
        >
          <option value="month">Month View</option>
          <option value="week">Week View</option>
          <option value="agenda">Agenda View</option>
        </select>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow dark:bg-gray-900 sm:p-6">
        {view === "month" && (
          <>
            <h2 className="mb-4 text-xl font-semibold text-gray-950 dark:text-gray-100">
              June 2026
            </h2>

            <div className="overflow-x-auto">
              <div className="grid min-w-[900px] grid-cols-7 gap-1 lg:gap-2">
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
                        <Link
                          key={job.id}
                          href={`/jobs/${job.id}`}
                          className={`mt-1 block rounded px-2 py-1 text-xs font-medium text-white hover:opacity-90 ${getJobColor(
                            job.status
                          )}`}
                        >
                          {job.name}
                        </Link>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 border-t border-gray-200 pt-4 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Lead
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-yellow-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Quoted
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-blue-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Scheduled
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-green-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Completed
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-purple-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Paid
                </span>
              </div>
            </div>
          </>
        )}

        {view === "week" && (
          <>
            <h2 className="mb-4 text-xl font-semibold text-gray-950 dark:text-gray-100">
              Upcoming Week
            </h2>

            <div className="space-y-3">
              {workspaceJobs.slice(0, 7).map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="block rounded-xl border border-gray-200 p-4 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-blue-600 hover:underline dark:text-blue-400">
                        {job.name}
                      </div>

                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {job.date}
                      </div>
                    </div>

                    <span
                      className={`rounded px-3 py-1 text-xs font-medium text-white ${getJobColor(
                        job.status
                      )}`}
                    >
                      {job.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {view === "agenda" && (
          <>
            <h2 className="mb-4 text-xl font-semibold text-gray-950 dark:text-gray-100">
              Agenda
            </h2>

            <div className="space-y-3">
              {workspaceJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="block rounded-xl border border-gray-200 p-4 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="font-semibold text-blue-600 hover:underline dark:text-blue-400">
                        {job.name}
                      </div>

                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {job.date}
                      </div>
                    </div>

                    <span
                      className={`w-fit rounded px-3 py-1 text-xs font-medium text-white ${getJobColor(
                        job.status
                      )}`}
                    >
                      {job.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

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

import { useState } from "react";
import Link from "next/link";
import { useWorkspace } from "@/components/WorkspaceContext";
import { clients as defaultClients } from "@/lib/clients";

export default function ClientsPage() {
const { activeWorkspace } = useWorkspace();

const [clientItems, setClientItems] = useState(defaultClients);
const [selectedClients, setSelectedClients] = useState<string[]>([]);
const [showDeleteModal, setShowDeleteModal] = useState(false);

const workspaceClients = clientItems.filter(
(client) => client.workspaceId === activeWorkspace.id
);

function toggleClient(clientId: string) {
setSelectedClients((current) =>
current.includes(clientId)
? current.filter((id) => id !== clientId)
: [...current, clientId]
);
}

function removeSelectedClients() {
setClientItems(
clientItems.filter(
(client) => !selectedClients.includes(client.id)
)
);


setSelectedClients([]);
setShowDeleteModal(false);


}

return ( <div className="space-y-6 text-gray-950 dark:text-gray-100"> <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"> <div> <h1 className="text-3xl font-bold">Clients</h1>

```
      <p className="mt-2 text-gray-500 dark:text-gray-400">
        {activeWorkspace.name} clients
      </p>
    </div>

    <div className="flex flex-col gap-2 sm:flex-row">
      <button className="w-full rounded-lg bg-blue-600 px-4 py-2 text-center text-white hover:bg-blue-700 sm:w-auto">
        + Add Client
      </button>

      <button
        onClick={() => setShowDeleteModal(true)}
        disabled={selectedClients.length === 0}
        className="w-full rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400 sm:w-auto"
      >
        Remove Selected
      </button>
    </div>
  </div>

  <div className="overflow-x-auto rounded-lg bg-white shadow dark:bg-gray-900">
    <table className="min-w-[650px] w-full">
      <thead className="bg-gray-100 dark:bg-gray-800">
        <tr className="text-gray-700 dark:text-gray-300">
          <th className="p-4 w-12">
            <input
              type="checkbox"
              checked={
                workspaceClients.length > 0 &&
                selectedClients.length === workspaceClients.length
              }
              onChange={(e) =>
                setSelectedClients(
                  e.target.checked
                    ? workspaceClients.map((client) => client.id)
                    : []
                )
              }
            />
          </th>

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
              <td className="p-4">
                <input
                  type="checkbox"
                  checked={selectedClients.includes(client.id)}
                  onChange={() => toggleClient(client.id)}
                />
              </td>

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
              colSpan={4}
              className="p-10 text-center text-lg text-gray-500 dark:text-gray-400"
            >
              No clients found for {activeWorkspace.name}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>

  {showDeleteModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Remove Clients
        </h2>

        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Are you sure you want to remove the selected client(s)?
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Cancel
          </button>

          <button
            onClick={removeSelectedClients}
            className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  )}
</div>


);
}
```

## app\dashboard\page.tsx

```tsx
"use client";

import { useEffect, useState } from "react";

import StatCard from "../../components/Statcard";
import { useWorkspace } from "@/components/WorkspaceContext";
import { jobs as defaultJobs } from "@/lib/jobs";
import { clients } from "@/lib/clients";
import { invoices } from "@/lib/invoices";
import { inventory } from "@/lib/inventory";

function moneyToNumber(value: string) {
  return Number(value.replace(/[$,]/g, ""));
}

function formatMoney(value: number) {
  return `$${value.toLocaleString()}`;
}

export default function DashboardPage() {
  const { activeWorkspace } = useWorkspace();

  const [jobItems, setJobItems] = useState(defaultJobs);

  useEffect(() => {
    const savedJobs = localStorage.getItem("frontier-jobs");

    if (savedJobs) {
      try {
        setJobItems(JSON.parse(savedJobs));
      } catch {
        setJobItems(defaultJobs);
      }
    }
  }, []);

  const workspaceClients = clients.filter(
    (client) => client.workspaceId === activeWorkspace.id
  );

  const workspaceJobs = jobItems.filter(
    (job) => job.workspaceId === activeWorkspace.id
  );

  const workspaceInvoices = invoices.filter(
    (invoice) => invoice.workspaceId === activeWorkspace.id
  );

  const workspaceInventory = inventory.filter(
    (item) => item.workspaceId === activeWorkspace.id
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
    .reduce((total, invoice) => total + moneyToNumber(invoice.amount), 0);

  const inventoryAlerts = workspaceInventory.filter(
    (item) => item.warning
  ).length;

  const recentActivity = [
    `✓ ${activeClients} active client(s)`,
    `✓ ${workspaceJobs.length} total job(s)`,
    `✓ ${openQuotes} open quote(s)`,
    `✓ ${scheduledJobs} scheduled job(s)`,
    `✓ ${inventoryAlerts} inventory alert(s)`,
    `✓ ${workspaceInvoices.length} invoice(s) in system`,
  ];

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
        <StatCard title="Active Clients" value={String(activeClients)} />

        <StatCard title="Open Quotes" value={String(openQuotes)} />

        <StatCard
          title="Outstanding Invoices"
          value={formatMoney(outstandingInvoices)}
        />

        <StatCard title="Inventory Alerts" value={String(inventoryAlerts)} />
      </div>

      <div className="mt-8 rounded-lg bg-white p-6 shadow dark:bg-gray-900">
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

import { useState } from "react";
import { useWorkspace } from "@/components/WorkspaceContext";
import { invoices as defaultInvoices } from "@/lib/invoices";
import { expenses as defaultExpenses } from "@/lib/expenses";
import { clients } from "@/lib/clients";

const invoiceStatuses = ["Draft", "Sent", "Overdue", "Paid"] as const;

type InvoiceStatus = (typeof invoiceStatuses)[number];

function moneyToNumber(value: string) {
  return Number(value.replace(/[$,]/g, ""));
}

function formatMoney(value: number) {
  return `$${value.toLocaleString()}`;
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
    <div className="flex min-h-36 flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:flex-row sm:items-start sm:justify-between dark:border-gray-800 dark:bg-gray-900">
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

  const [invoiceItems, setInvoiceItems] = useState(defaultInvoices);
  const [expenseItems, setExpenseItems] = useState(defaultExpenses);

  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);

  const [newInvoiceOpen, setNewInvoiceOpen] = useState(false);
  const [newExpenseOpen, setNewExpenseOpen] = useState(false);

  const [invoiceClient, setInvoiceClient] = useState("");
  const [invoiceStatus, setInvoiceStatus] = useState<InvoiceStatus>("Draft");
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [invoiceFileName, setInvoiceFileName] = useState("");

  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("Materials");
  const [expenseAmount, setExpenseAmount] = useState("");

  const workspaceInvoices = invoiceItems.filter(
    (invoice) => invoice.workspaceId === activeWorkspace.id
  );

  const workspaceExpenses = expenseItems.filter(
    (expense) => expense.workspaceId === activeWorkspace.id
  );

  const workspaceClients = clients.filter(
    (client) => client.workspaceId === activeWorkspace.id
  );

  function toggleInvoice(id: string) {
    setSelectedInvoices((current) =>
      current.includes(id)
        ? current.filter((invoiceId) => invoiceId !== id)
        : [...current, id]
    );
  }

  function toggleExpense(id: string) {
    setSelectedExpenses((current) =>
      current.includes(id)
        ? current.filter((expenseId) => expenseId !== id)
        : [...current, id]
    );
  }

  function removeSelectedInvoices() {
    setInvoiceItems((current) =>
      current.filter((invoice) => !selectedInvoices.includes(invoice.id))
    );

    setSelectedInvoices([]);
  }

  function removeSelectedExpenses() {
    setExpenseItems((current) =>
      current.filter(
        (expense) =>
          !selectedExpenses.includes(
            `${expense.workspaceId}-${expense.description}`
          )
      )
    );

    setSelectedExpenses([]);
  }

  function updateInvoiceStatus(id: string, status: InvoiceStatus) {
    setInvoiceItems((current) =>
      current.map((invoice) =>
        invoice.id === id ? { ...invoice, status } : invoice
      )
    );
  }

  function closeInvoiceModal() {
    setNewInvoiceOpen(false);
    setInvoiceClient("");
    setInvoiceStatus("Draft");
    setInvoiceAmount("");
    setInvoiceFileName("");
  }

  function closeExpenseModal() {
    setNewExpenseOpen(false);
    setExpenseDescription("");
    setExpenseCategory("Materials");
    setExpenseAmount("");
  }

  function addInvoice() {
    if (!invoiceClient.trim()) return;

    const amount = Number(invoiceAmount);

    if (Number.isNaN(amount) || amount <= 0) return;

    const nextInvoiceNumber = invoiceItems.length + 1;
    const nextInvoiceId = `INV-${String(nextInvoiceNumber).padStart(3, "0")}`;

    setInvoiceItems((current) => [
      ...current,
      {
        id: nextInvoiceId,
        client: invoiceClient,
        status: invoiceStatus,
        amount: formatMoney(amount),
        workspaceId: activeWorkspace.id,
        supportingFile: invoiceFileName,
      },
    ]);

    closeInvoiceModal();
  }

  function addExpense() {
    if (!expenseDescription.trim()) return;

    const amount = Number(expenseAmount);

    if (Number.isNaN(amount) || amount <= 0) return;

    setExpenseItems((current) => [
      ...current,
      {
        description: expenseDescription.trim(),
        category: expenseCategory,
        amount: formatMoney(amount),
        workspaceId: activeWorkspace.id,
      },
    ]);

    closeExpenseModal();
  }

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

  const profit = revenue - totalExpenses;

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
          note="Paid invoices"
        />

        <SummaryCard
          title="Expenses"
          value={formatMoney(totalExpenses)}
          icon="↘"
          iconClass="bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300"
        />

        <SummaryCard
          title="Outstanding"
          value={formatMoney(outstanding)}
          icon="◷"
          iconClass="bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300"
        />

        <SummaryCard
          title="Profit"
          value={formatMoney(profit)}
          icon="↗"
          iconClass="bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300"
        />
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-800">
            <h2 className="text-2xl font-bold text-gray-950 dark:text-gray-100">
              Recent Invoices
            </h2>

            <div className="flex gap-2">
              <button
                onClick={() => setNewInvoiceOpen(true)}
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
              >
                + Add Invoice
              </button>

              <button
                onClick={removeSelectedInvoices}
                disabled={selectedInvoices.length === 0}
                className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          </div>

          <table className="min-w-[720px] w-full">
            <thead>
              <tr className="border-b border-gray-200 text-left text-sm uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:text-gray-400">
                <th className="w-12 px-4 py-4"></th>
                <th className="px-6 py-4">Invoice</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>

            <tbody>
              {workspaceInvoices.length > 0 ? (
                workspaceInvoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="border-b border-gray-200 text-base last:border-b-0 dark:border-gray-800 lg:text-lg"
                  >
                    <td className="px-4 py-5 text-center">
                      <input
                        type="checkbox"
                        checked={selectedInvoices.includes(invoice.id)}
                        onChange={() => toggleInvoice(invoice.id)}
                        className="h-4 w-4"
                      />
                    </td>

                    <td className="px-6 py-5 font-medium text-gray-950 dark:text-gray-100">
                      {invoice.id}
                    </td>

                    <td className="px-6 py-5 text-gray-500 dark:text-gray-400">
                      {invoice.client}
                    </td>

                    <td className="px-6 py-5">
                      <select
                        value={invoice.status}
                        onChange={(event) =>
                          updateInvoiceStatus(
                            invoice.id,
                            event.target.value as InvoiceStatus
                          )
                        }
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                      >
                        {invoiceStatuses.map((status) => (
                          <option key={status}>{status}</option>
                        ))}
                      </select>
                    </td>

                    <td className="px-6 py-5 text-right font-medium text-gray-950 dark:text-gray-100">
                      {invoice.amount}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
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
          <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-800">
            <h2 className="text-2xl font-bold text-gray-950 dark:text-gray-100">
              Recent Expenses
            </h2>

            <div className="flex gap-2">
              <button
                onClick={() => setNewExpenseOpen(true)}
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
              >
                + Add Expense
              </button>

              <button
                onClick={removeSelectedExpenses}
                disabled={selectedExpenses.length === 0}
                className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          </div>

          <table className="min-w-[700px] w-full">
            <thead>
              <tr className="border-b border-gray-200 text-left text-sm uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:text-gray-400">
                <th className="w-12 px-4 py-4"></th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>

            <tbody>
              {workspaceExpenses.length > 0 ? (
                workspaceExpenses.map((expense) => {
                  const expenseId = `${expense.workspaceId}-${expense.description}`;

                  return (
                    <tr
                      key={expenseId}
                      className="border-b border-gray-200 text-base last:border-b-0 dark:border-gray-800 lg:text-lg"
                    >
                      <td className="px-4 py-5 text-center">
                        <input
                          type="checkbox"
                          checked={selectedExpenses.includes(expenseId)}
                          onChange={() => toggleExpense(expenseId)}
                          className="h-4 w-4"
                        />
                      </td>

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
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={4}
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

      {newInvoiceOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-950 dark:text-gray-100">
                Add Invoice
              </h2>

              <button
                onClick={closeInvoiceModal}
                className="text-2xl text-gray-500"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <select
                value={invoiceClient}
                onChange={(event) => setInvoiceClient(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
              >
                <option value="">Select Client</option>
                {workspaceClients.map((client) => (
                  <option key={client.id} value={client.name}>
                    {client.name}
                  </option>
                ))}
              </select>

              <select
                value={invoiceStatus}
                onChange={(event) =>
                  setInvoiceStatus(event.target.value as InvoiceStatus)
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
              >
                {invoiceStatuses.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>

              <input
                type="number"
                value={invoiceAmount}
                onChange={(event) => setInvoiceAmount(event.target.value)}
                placeholder="Amount"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
              />

              <input
                type="file"
                onChange={(event) =>
                  setInvoiceFileName(event.target.files?.[0]?.name ?? "")
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
              />

              {invoiceFileName && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Attached: {invoiceFileName}
                </p>
              )}

              <button
                onClick={addInvoice}
                className="w-full rounded-lg bg-blue-600 py-3 text-white hover:bg-blue-700"
              >
                Add Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {newExpenseOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-950 dark:text-gray-100">
                Add Expense
              </h2>

              <button
                onClick={closeExpenseModal}
                className="text-2xl text-gray-500"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={expenseDescription}
                onChange={(event) => setExpenseDescription(event.target.value)}
                placeholder="Description"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
              />

              <select
                value={expenseCategory}
                onChange={(event) => setExpenseCategory(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
              >
                <option>Materials</option>
                <option>Fuel</option>
                <option>Equipment</option>
                <option>Insurance</option>
                <option>Maintenance</option>
                <option>Labor</option>
                <option>Other</option>
              </select>

              <input
                type="number"
                value={expenseAmount}
                onChange={(event) => setExpenseAmount(event.target.value)}
                placeholder="Amount"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
              />

              <button
                onClick={addExpense}
                className="w-full rounded-lg bg-blue-600 py-3 text-white hover:bg-blue-700"
              >
                Add Expense
              </button>
            </div>
          </div>
        </div>
      )}
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

html,
body {
  min-height: 100%;
}

body {
  margin: 0;
  background-color: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
  min-height: 100vh;
}

html.dark,
html.dark body {
  background-color: #030712;
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

import { useEffect, useState } from "react";

import { useWorkspace } from "@/components/WorkspaceContext";
import { inventory as defaultInventory } from "@/lib/inventory";
import { jobs as defaultJobs } from "@/lib/jobs";

type InventoryRow = {
  name: string;
  currentQty: number | null;
  targetQty: number | null;
  warning: boolean;
  workspaceId: string;
  autoGenerated?: boolean;
};

export default function InventoryPage() {
  const { activeWorkspace } = useWorkspace();

  const [inventoryItems, setInventoryItems] = useState<InventoryRow[]>(
    defaultInventory
  );
  const [jobItems, setJobItems] = useState(defaultJobs);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const [newItemOpen, setNewItemOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [currentQty, setCurrentQty] = useState("");
  const [targetQty, setTargetQty] = useState("");

  useEffect(() => {
    const savedJobs = localStorage.getItem("frontier-jobs");

    if (savedJobs) {
      try {
        setJobItems(JSON.parse(savedJobs));
      } catch {
        setJobItems(defaultJobs);
      }
    }
  }, []);

  const workspaceInventory = inventoryItems.filter(
    (item) => item.workspaceId === activeWorkspace.id
  );

  const activeMaterialJobs = jobItems.filter(
    (job) =>
      job.workspaceId === activeWorkspace.id &&
      (job.status === "Scheduled" || job.status === "Completed")
  );

  const autoMaterialRows: InventoryRow[] = activeMaterialJobs
    .flatMap((job) =>
      job.materials.map((material) => ({
        name: material.name.trim(),
        currentQty: null,
        targetQty: null,
        warning: true,
        workspaceId: activeWorkspace.id,
        autoGenerated: true,
      }))
    )
    .filter((material, index, materials) => {
      const normalizedName = material.name.toLowerCase();

      return (
        material.name.length > 0 &&
        materials.findIndex(
          (candidate) => candidate.name.toLowerCase() === normalizedName
        ) === index
      );
    });

  const mergedInventory = [
    ...workspaceInventory,
    ...autoMaterialRows.filter(
      (material) =>
        !workspaceInventory.some(
          (item) =>
            item.name.trim().toLowerCase() === material.name.trim().toLowerCase()
        )
    ),
  ];

  function getReservedForItem(itemName: string) {
    return activeMaterialJobs.flatMap((job) =>
      job.materials
        .filter(
          (material) =>
            material.name.trim().toLowerCase() === itemName.trim().toLowerCase()
        )
        .map((material) => ({
          jobId: job.id,
          jobName: job.name,
          jobStatus: job.status,
          quantity: material.quantity,
        }))
    );
  }

  function toggleItem(itemName: string) {
    setSelectedItems((current) =>
      current.includes(itemName)
        ? current.filter((name) => name !== itemName)
        : [...current, itemName]
    );
  }

  function removeSelectedItems() {
    setInventoryItems((current) =>
      current.filter((item) => !selectedItems.includes(item.name))
    );

    setSelectedItems([]);
  }

  function resetNewItemForm() {
    setItemName("");
    setCurrentQty("");
    setTargetQty("");
  }

  function closeNewItemModal() {
    setNewItemOpen(false);
    resetNewItemForm();
  }

  function addInventoryItem() {
    if (!itemName.trim()) return;

    const current = Number(currentQty);
    const target = Number(targetQty);

    if (Number.isNaN(current) || Number.isNaN(target)) return;

    setInventoryItems((existing) => [
      ...existing,
      {
        name: itemName.trim(),
        currentQty: current,
        targetQty: target,
        warning: current < target,
        workspaceId: activeWorkspace.id,
      },
    ]);

    closeNewItemModal();
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-950 dark:text-gray-100">
            Inventory
          </h1>

          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Scheduled and completed job material needs for{" "}
            {activeWorkspace.name}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setNewItemOpen(true)}
            className="rounded-lg bg-blue-600 px-6 py-3 text-white shadow hover:bg-blue-700"
          >
            + Add Item
          </button>

          <button
            type="button"
            onClick={removeSelectedItems}
            disabled={selectedItems.length === 0}
            className="rounded-lg bg-red-600 px-6 py-3 text-white shadow hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Remove Item
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
        Inventory demand is calculated only from{" "}
        <strong>Scheduled</strong> and <strong>Completed</strong> jobs. Lead,
        Quoted, and Paid jobs do not reserve inventory. Materials from jobs will
        auto-appear even if no inventory item exists yet.
      </div>

      {selectedItems.length > 0 && (
        <div className="rounded-xl bg-gray-900 p-4 text-white">
          {selectedItems.length} item
          {selectedItems.length !== 1 ? "s" : ""} selected
        </div>
      )}

      {newItemOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-950 dark:text-gray-100">
                Add Inventory Item
              </h2>

              <button
                type="button"
                onClick={closeNewItemModal}
                className="text-2xl text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={itemName}
                onChange={(event) => setItemName(event.target.value)}
                placeholder="Item Name"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
              />

              <input
                type="number"
                value={currentQty}
                onChange={(event) => setCurrentQty(event.target.value)}
                placeholder="Current Quantity"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
              />

              <input
                type="number"
                value={targetQty}
                onChange={(event) => setTargetQty(event.target.value)}
                placeholder="Target Quantity"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
              />

              <button
                type="button"
                onClick={addInventoryItem}
                className="w-full rounded-lg bg-blue-600 py-3 text-white hover:bg-blue-700"
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <table className="min-w-[1100px] w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-white text-sm uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
              <th className="w-12 px-4 py-4"></th>
              <th className="px-6 py-4 text-left">Item Name</th>
              <th className="px-6 py-4 text-center">Current Qty</th>
              <th className="px-6 py-4 text-center">Reserved</th>
              <th className="px-6 py-4 text-center">Available</th>
              <th className="px-6 py-4 text-center">Target Qty</th>
              <th className="px-6 py-4 text-left">Tied Jobs</th>
              <th className="px-6 py-4 text-right">Suggested Order</th>
            </tr>
          </thead>

          <tbody>
            {mergedInventory.length > 0 ? (
              mergedInventory.map((item) => {
                const reservedJobs = getReservedForItem(item.name);

                const reservedQty = reservedJobs.reduce(
                  (total, reserved) => total + reserved.quantity,
                  0
                );

                const availableAfterJobs =
                  item.currentQty === null ? null : item.currentQty - reservedQty;

                const suggestedOrder =
                  item.targetQty === null || availableAfterJobs === null
                    ? null
                    : Math.max(item.targetQty - availableAfterJobs, 0);

                const warning =
                  item.currentQty === null ||
                  item.targetQty === null ||
                  (availableAfterJobs !== null &&
                    availableAfterJobs < item.targetQty);

                return (
                  <tr
                    key={`${item.workspaceId}-${item.name}`}
                    className="border-b border-gray-200 text-base last:border-b-0 dark:border-gray-800 lg:text-lg"
                  >
                    <td className="px-4 py-5 text-center">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.name)}
                        onChange={() => toggleItem(item.name)}
                        disabled={item.autoGenerated}
                        className="h-4 w-4 disabled:cursor-not-allowed disabled:opacity-40"
                        title={
                          item.autoGenerated
                            ? "Auto-generated from job materials"
                            : undefined
                        }
                      />
                    </td>

                    <td className="px-6 py-5 font-medium text-gray-950 dark:text-gray-100">
                      <div className="flex items-center gap-3">
                        {warning && (
                          <span className="text-orange-500">⚠</span>
                        )}

                        <span>{item.name}</span>

                        {item.autoGenerated && (
                          <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                            Job material
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-5 text-center text-gray-900 dark:text-gray-100">
                      {item.currentQty ?? "—"}
                    </td>

                    <td className="px-6 py-5 text-center text-blue-600 dark:text-blue-400">
                      {reservedQty}
                    </td>

                    <td
                      className={`px-6 py-5 text-center ${
                        warning
                          ? "text-red-600 dark:text-red-400"
                          : "text-green-600 dark:text-green-400"
                      }`}
                    >
                      {availableAfterJobs ?? "—"}
                    </td>

                    <td className="px-6 py-5 text-center text-gray-500 dark:text-gray-400">
                      {item.targetQty ?? "—"}
                    </td>

                    <td className="px-6 py-5 text-sm text-gray-600 dark:text-gray-400">
                      {reservedJobs.length > 0 ? (
                        <div className="space-y-1">
                          {reservedJobs.map((reserved) => (
                            <div key={`${reserved.jobId}-${reserved.quantity}`}>
                              {reserved.quantity} → {reserved.jobName} (
                              {reserved.jobStatus})
                            </div>
                          ))}
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td
                      className={`px-6 py-5 text-right ${
                        warning
                          ? "text-orange-600 dark:text-orange-400"
                          : "text-green-600 dark:text-green-400"
                      }`}
                    >
                      {suggestedOrder ?? "—"}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-16 text-center text-xl text-gray-500 dark:text-gray-400"
                >
                  No inventory items or scheduled job materials for{" "}
                  {activeWorkspace.name}
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
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { jobs as defaultJobs } from "@/lib/jobs";

function getStatusClasses(status: string) {
  switch (status) {
    case "Lead":
      return "bg-gray-400 text-gray-900";
    case "Quoted":
      return "bg-yellow-100 text-yellow-700";
    case "Scheduled":
      return "bg-blue-100 text-blue-700";
    case "Completed":
      return "bg-green-100 text-green-700";
    case "Paid":
      return "bg-purple-100 text-purple-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function JobPage() {
  const params = useParams();
  const id = String(params.id);

  const [jobItems, setJobItems] = useState(defaultJobs);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const savedJobs = localStorage.getItem("frontier-jobs");

    if (savedJobs) {
      try {
        setJobItems(JSON.parse(savedJobs));
      } catch {
        setJobItems(defaultJobs);
      }
    }

    setLoaded(true);
  }, []);

  const job = jobItems.find((job) => job.id === id);

  if (!loaded) {
    return null;
  }

  if (!job) {
    return (
      <div className="space-y-4 p-6 text-gray-950 dark:text-gray-100">
        <h1 className="text-3xl font-bold">Job not found</h1>

        <p className="text-gray-500 dark:text-gray-400">
          This job does not exist in the current saved job list.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-gray-950 dark:text-gray-100">
      <div>
        <h1 className="text-3xl font-bold">{job.name}</h1>

        <p className="mt-2 text-gray-500 dark:text-gray-400">{job.client}</p>
      </div>

      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-900">
        <h2 className="mb-4 text-xl font-semibold">Job Information</h2>

        <div className="space-y-3">
          <p>
            <strong>Client:</strong> {job.client}
          </p>

          <div className="flex items-center gap-2">
            <strong>Status:</strong>

            <span
              className={`rounded-full px-3 py-1 text-sm font-semibold ${getStatusClasses(
                job.status
              )}`}
            >
              {job.status}
            </span>
          </div>

          <p>
            <strong>Scheduled Date:</strong> {job.date || "—"}
          </p>

          <p>
            <strong>Estimated Value:</strong> {job.value}
          </p>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-900">
        <h2 className="mb-4 text-xl font-semibold">Materials</h2>

        {job.materials && job.materials.length > 0 ? (
          <ul className="ml-6 list-disc">
            {job.materials.map((material, index) => (
              <li key={`${material.name}-${index}`}>
                {material.quantity} × {material.name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">
            No materials added.
          </p>
        )}
      </div>

      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-900">
        <h2 className="mb-4 text-xl font-semibold">Notes</h2>

        <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
          {job.notes || "No notes added."}
        </p>
      </div>

      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-900">
        <h2 className="mb-4 text-xl font-semibold">Invoice</h2>

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

import { useEffect, useState } from "react";
import Link from "next/link";

import { useWorkspace } from "@/components/WorkspaceContext";
import { jobs as defaultJobs, JobMaterial, JobStatus } from "@/lib/jobs";
import { clients } from "@/lib/clients";

function getStatusColor(status: JobStatus) {
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

export default function JobsPage() {
  const { activeWorkspace } = useWorkspace();

  const [jobItems, setJobItems] = useState(defaultJobs);
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [newJobOpen, setNewJobOpen] = useState(false);

  const [client, setClient] = useState("");
  const [jobName, setJobName] = useState("");
  const [status, setStatus] = useState<JobStatus>("Lead");
  const [value, setValue] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");

  const [materialName, setMaterialName] = useState("");
  const [materialQuantity, setMaterialQuantity] = useState("");
  const [materials, setMaterials] = useState<JobMaterial[]>([]);

  useEffect(() => {
    const savedJobs = localStorage.getItem("frontier-jobs");

    if (savedJobs) {
      try {
        setJobItems(JSON.parse(savedJobs));
      } catch {
        setJobItems(defaultJobs);
      }
    }
  }, []);

  const workspaceClients = clients.filter(
    (client) => client.workspaceId === activeWorkspace.id
  );

  const workspaceJobs = jobItems.filter(
    (job) => job.workspaceId === activeWorkspace.id
  );

  const allWorkspaceJobsSelected =
    workspaceJobs.length > 0 &&
    workspaceJobs.every((job) => selectedJobs.includes(job.id));

  function saveJobs(updatedJobs: typeof defaultJobs) {
    setJobItems(updatedJobs);
    localStorage.setItem("frontier-jobs", JSON.stringify(updatedJobs));
  }

  function resetForm() {
    setClient("");
    setJobName("");
    setStatus("Lead");
    setValue("");
    setDate("");
    setNotes("");
    setMaterialName("");
    setMaterialQuantity("");
    setMaterials([]);
  }

  function closeNewJobBox() {
    setNewJobOpen(false);
    resetForm();
  }

  function toggleJob(jobId: string) {
    setSelectedJobs((current) =>
      current.includes(jobId)
        ? current.filter((id) => id !== jobId)
        : [...current, jobId]
    );
  }

  function toggleAllWorkspaceJobs() {
    if (allWorkspaceJobsSelected) {
      setSelectedJobs((current) =>
        current.filter(
          (jobId) => !workspaceJobs.some((job) => job.id === jobId)
        )
      );

      return;
    }

    setSelectedJobs((current) => {
      const workspaceJobIds = workspaceJobs.map((job) => job.id);
      const preservedOtherWorkspaceSelections = current.filter(
        (jobId) => !workspaceJobIds.includes(jobId)
      );

      return [...preservedOtherWorkspaceSelections, ...workspaceJobIds];
    });
  }

  function deleteSelectedJobs() {
    const updatedJobs = jobItems.filter(
      (job) => !selectedJobs.includes(job.id)
    );

    saveJobs(updatedJobs);
    setSelectedJobs([]);
  }

  function addMaterial() {
    if (!materialName.trim()) return;

    const quantity = Number(materialQuantity);
    if (Number.isNaN(quantity) || quantity <= 0) return;

    setMaterials((current) => [
      ...current,
      {
        name: materialName.trim(),
        quantity,
      },
    ]);

    setMaterialName("");
    setMaterialQuantity("");
  }

  function removeMaterial(indexToRemove: number) {
    setMaterials((current) =>
      current.filter((_, index) => index !== indexToRemove)
    );
  }

  function createJob(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!client.trim() || !jobName.trim()) return;

    const formattedValue = value.trim()
      ? value.trim().startsWith("$")
        ? value.trim()
        : `$${value.trim()}`
      : "$0";

    const newJob = {
      id: crypto.randomUUID(),
      workspaceId: activeWorkspace.id,
      name: jobName.trim(),
      client,
      status,
      value: formattedValue,
      date,
      materials,
      notes,
    };

    saveJobs([...jobItems, newJob]);
    closeNewJobBox();
  }

  return (
    <div className="space-y-6 text-gray-950 dark:text-gray-100">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Jobs</h1>

          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Jobs for {activeWorkspace.name}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => setNewJobOpen(true)}
            className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
          >
            + Add New Job
          </button>

          <button
            type="button"
            onClick={deleteSelectedJobs}
            disabled={selectedJobs.length === 0}
            className="rounded-lg bg-red-600 px-6 py-3 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Delete Job
          </button>
        </div>
      </div>

      {selectedJobs.length > 0 && (
        <div className="rounded-lg bg-gray-900 p-4 text-white">
          {selectedJobs.length} job{selectedJobs.length === 1 ? "" : "s"} selected
        </div>
      )}

      {newJobOpen && (
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-900">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold">Add New Job</h2>

            <button
              type="button"
              onClick={closeNewJobBox}
              className="text-2xl text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              ×
            </button>
          </div>

          <form onSubmit={createJob} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium">Client</label>

              <select
                value={client}
                onChange={(event) => setClient(event.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800"
              >
                <option value="">Select Client</option>

                {workspaceClients.map((client) => (
                  <option key={client.id} value={client.name}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Job Name
              </label>

              <input
                type="text"
                value={jobName}
                onChange={(event) => setJobName(event.target.value)}
                placeholder="Spring Cleanup"
                required
                className="w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Status</label>

              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as JobStatus)
                }
                className="w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800"
              >
                <option>Lead</option>
                <option>Quoted</option>
                <option>Scheduled</option>
                <option>Completed</option>
                <option>Paid</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Scheduled Date
              </label>

              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Estimated Value
              </label>

              <input
                type="number"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder="450"
                className="w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800"
              />
            </div>

            <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
              <h3 className="text-xl font-semibold">Materials</h3>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_160px_auto]">
                <input
                  type="text"
                  value={materialName}
                  onChange={(event) => setMaterialName(event.target.value)}
                  placeholder="Material name"
                  className="rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800"
                />

                <input
                  type="number"
                  value={materialQuantity}
                  onChange={(event) =>
                    setMaterialQuantity(event.target.value)
                  }
                  placeholder="Quantity"
                  className="rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800"
                />

                <button
                  type="button"
                  onClick={addMaterial}
                  className="rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
                >
                  Add Material
                </button>
              </div>

              <div className="mt-4 space-y-2">
                {materials.length > 0 ? (
                  materials.map((material, index) => (
                    <div
                      key={`${material.name}-${index}`}
                      className="flex items-center justify-between rounded-lg bg-gray-100 p-3 dark:bg-gray-800"
                    >
                      <span>
                        {material.quantity} × {material.name}
                      </span>

                      <button
                        type="button"
                        onClick={() => removeMaterial(index)}
                        className="text-sm text-red-600 hover:underline dark:text-red-400"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No materials added yet.
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Notes</label>

              <textarea
                rows={5}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Job details..."
                className="w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
              >
                Create Job
              </button>

              <button
                type="button"
                onClick={closeNewJobBox}
                className="rounded-lg bg-red-600 px-6 py-3 text-white hover:bg-red-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg bg-white shadow dark:bg-gray-900">
        <table className="min-w-[820px] w-full">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr className="text-left text-gray-700 dark:text-gray-300">
              <th className="w-12 p-4">
                <input
                  type="checkbox"
                  checked={allWorkspaceJobsSelected}
                  onChange={toggleAllWorkspaceJobs}
                  disabled={workspaceJobs.length === 0}
                  className="h-4 w-4"
                />
              </th>
              <th className="p-4">Job</th>
              <th className="p-4">Client</th>
              <th className="p-4">Status</th>
              <th className="p-4">Date</th>
              <th className="p-4 text-right">Value</th>
            </tr>
          </thead>

          <tbody>
            {workspaceJobs.length > 0 ? (
              workspaceJobs.map((job) => (
                <tr
                  key={job.id}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedJobs.includes(job.id)}
                      onChange={() => toggleJob(job.id)}
                      className="h-4 w-4"
                    />
                  </td>

                  <td className="p-4 font-medium">
                    <Link
                      href={`/jobs/${job.id}`}
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {job.name}
                    </Link>
                  </td>

                  <td className="p-4">{job.client}</td>

                  <td className="p-4">
                    <span
                      className={`rounded px-3 py-1 text-xs font-medium text-white ${getStatusColor(
                        job.status
                      )}`}
                    >
                      {job.status}
                    </span>
                  </td>

                  <td className="p-4">{job.date || "—"}</td>

                  <td className="p-4 text-right font-medium">{job.value}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="p-10 text-center text-lg text-gray-500 dark:text-gray-400"
                >
                  No jobs found for {activeWorkspace.name}
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
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="text-center">
        <div className="mt-6 text-8xl font-black text-blue-500">
          ⌖
        </div>

        <h1 className="mt-4 text-6xl font-black tracking-[0.25em] text-gray-950 dark:text-gray-100">
          FRONTIER
        </h1>

        <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
          Business Operations Platform
        </p>

        <div className="mt-8 inline-flex rounded-full border border-green-500 px-5 py-2">
          <span className="animate-pulse font-mono text-sm text-green-400">
            SYSTEM ONLINE _
          </span>
        </div>

        <div className="mt-10 text-sm tracking-widest text-gray-500 dark:text-gray-400">
          Built for the New Frontier.
        </div>

        <p className="mt-16 text-center text-xs tracking-wide text-gray-500 dark:text-gray-400">
          © 2026 Thompson Ventures MI. All Rights Reserved.
        </p>

        <p className="mt-3 text-center">
          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=thompsonrelay@proton.me"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-blue-500 hover:text-blue-400 hover:underline"
          >
            Contact Us
          </a>
        </p>

      </div>
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
import { useWorkspace } from "@/components/WorkspaceContext";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [darkMode, setDarkMode] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [newWorkspaceOpen, setNewWorkspaceOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceType, setWorkspaceType] = useState("Landscaping");
  const [customWorkspaceType, setCustomWorkspaceType] = useState("");

  const {
    workspaces,
    activeWorkspace,
    setActiveWorkspace,
    addWorkspace,
  } = useWorkspace();

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
    <div className="flex min-h-screen min-w-max bg-gray-100 text-gray-950 dark:bg-gray-950 dark:text-gray-100">
      <Sidebar />

      <div className="flex flex-1 flex-col bg-gray-100 dark:bg-gray-950">
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
                  onClick={() => {
                    setWorkspaceOpen(false);
                    setNewWorkspaceOpen(true);
                  }}
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

        <main className="flex-1 min-w-max min-h-screen p-3 sm:p-4 lg:p-6">
          {children}
        </main>
        
        {newWorkspaceOpen && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold">
          New Workspace
        </h2>

        <button
          onClick={() => {
            setNewWorkspaceOpen(false);
            setWorkspaceOpen(false);
            setUserOpen(false);
            setWorkspaceName("");
            setWorkspaceType("Landscaping");
            setCustomWorkspaceType("");
          }}

          className="text-2xl text-gray-500"
        >
          ×
        </button>
      </div>

      <div className="space-y-4">
        <input
          type="text"
          value={workspaceName}
          onChange={(e) => setWorkspaceName(e.target.value)}
          placeholder="Workspace Name"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
        />

        <select
          value={workspaceType}
          onChange={(e) => setWorkspaceType(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
        >
          <option>Landscaping</option>
          <option>Tree Service</option>
          <option>Lawn Care</option>
          <option>Snow Removal</option>
          <option>Property Management</option>
          <option>Construction</option>
          <option>Auto Repair</option>
          <option>IT Services</option>
          <option>Plumbing</option>
          <option>Electrical</option>
          <option>Cleaning</option>
          <option>Restaurant</option>
          <option>Other</option>
        </select>

        {workspaceType === "Other" && (
          <input
            type="text"
            value={customWorkspaceType}
            onChange={(e) =>
              setCustomWorkspaceType(e.target.value)
            }
            placeholder="Specify Business Type"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
          />
        )}

        <button
          onClick={() => {
            if (!workspaceName.trim()) return;

            const type =
              workspaceType === "Other"
                ? customWorkspaceType.trim()
                : workspaceType;
            if (!type) return;

            addWorkspace({
              id: crypto.randomUUID(),
              name: workspaceName,
              type,
            });

            setWorkspaceName("");
            setWorkspaceType("Landscaping");
            setCustomWorkspaceType("");
            setNewWorkspaceOpen(false);
          }}
          className="w-full rounded-lg bg-blue-600 py-3 text-white hover:bg-blue-700"
        >
          Create Workspace
        </button>
      </div>
    </div>
  </div>
)}

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

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

export type Workspace = {
  id: string;
  name: string;
  type: string;
};

const defaultWorkspaces: Workspace[] = [
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
  workspaces: Workspace[];
  activeWorkspace: Workspace;
  setActiveWorkspace: (workspace: Workspace) => void;
  addWorkspace: (workspace: Workspace) => void;
};

const WorkspaceContext =
  createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [workspaces, setWorkspaces] =
    useState<Workspace[]>(defaultWorkspaces);

  const [activeWorkspace, setActiveWorkspace] =
    useState(defaultWorkspaces[0]);

  useEffect(() => {
    const savedWorkspaces =
      localStorage.getItem("frontier-workspaces");

    const savedActiveWorkspace =
      localStorage.getItem("frontier-active-workspace");

    if (savedWorkspaces) {
      try {
        const parsedWorkspaces: Workspace[] =
          JSON.parse(savedWorkspaces);

        setWorkspaces(parsedWorkspaces);

        if (savedActiveWorkspace) {
          const foundWorkspace =
            parsedWorkspaces.find(
              (workspace) =>
                workspace.id === savedActiveWorkspace
            );

          if (foundWorkspace) {
            setActiveWorkspace(foundWorkspace);
          }
        }
      } catch (error) {
        console.error(
          "Failed to load workspaces",
          error
        );
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "frontier-workspaces",
      JSON.stringify(workspaces)
    );
  }, [workspaces]);

  useEffect(() => {
    localStorage.setItem(
      "frontier-active-workspace",
      activeWorkspace.id
    );
  }, [activeWorkspace]);

  function addWorkspace(workspace: Workspace) {
    setWorkspaces((current) => [
      ...current,
      workspace,
    ]);

    setActiveWorkspace(workspace);
  }

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        setActiveWorkspace,
        addWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);

  if (!context) {
    throw new Error(
      "useWorkspace must be used inside WorkspaceProvider"
    );
  }

  return context;
}
```

## lib\clients.ts

```typescript
export const clients = [
  // LANDSCAPING

  {
    id: "1",
    workspaceId: "landscaping",
    name: "Jones Family",
    status: "Active",
    balance: "$200",
    email: "jones@example.com",
    phone: "(555) 100-0001",
  },
  {
    id: "2",
    workspaceId: "landscaping",
    name: "Brown Family",
    status: "Active",
    balance: "$350",
    email: "brown@example.com",
    phone: "(555) 100-0002",
  },
  {
    id: "3",
    workspaceId: "landscaping",
    name: "Acme HOA",
    status: "Active",
    balance: "$1,500",
    email: "contact@acmehoa.com",
    phone: "(555) 100-0003",
  },
  {
    id: "4",
    workspaceId: "landscaping",
    name: "John Smith",
    status: "Active",
    balance: "$450",
    email: "john@example.com",
    phone: "(555) 100-0004",
  },
  {
    id: "5",
    workspaceId: "landscaping",
    name: "Sunset Apartments",
    status: "Active",
    balance: "$120",
    email: "office@sunsetapartments.com",
    phone: "(555) 100-0005",
  },
  {
    id: "6",
    workspaceId: "landscaping",
    name: "Johnson Residence",
    status: "Active",
    balance: "$800",
    email: "johnson@example.com",
    phone: "(555) 100-0006",
  },

  // SNOW REMOVAL

  {
    id: "7",
    workspaceId: "snow-removal",
    name: "Rochester Community Church",
    status: "Lead",
    balance: "$3,500",
    email: "office@church.org",
    phone: "(555) 200-0001",
  },
  {
    id: "8",
    workspaceId: "snow-removal",
    name: "Riverside Office Park",
    status: "Active",
    balance: "$6,800",
    email: "manager@riverside.com",
    phone: "(555) 200-0002",
  },
  {
    id: "9",
    workspaceId: "snow-removal",
    name: "Winter Ridge Condos",
    status: "Active",
    balance: "$9,200",
    email: "hoa@winterridge.com",
    phone: "(555) 200-0003",
  },
  {
    id: "10",
    workspaceId: "snow-removal",
    name: "Oakland Medical Center",
    status: "Active",
    balance: "$650",
    email: "facilities@oaklandmedical.com",
    phone: "(555) 200-0004",
  },
  {
    id: "11",
    workspaceId: "snow-removal",
    name: "North Plaza",
    status: "Active",
    balance: "$2,400",
    email: "management@northplaza.com",
    phone: "(555) 200-0005",
  },

  // PROPERTIES

  {
    id: "12",
    workspaceId: "properties",
    name: "Maple Grove Apartments",
    status: "Active",
    balance: "$1,200",
    email: "office@maplegrove.com",
    phone: "(555) 300-0001",
  },
  {
    id: "13",
    workspaceId: "properties",
    name: "Riverside Office Park",
    status: "Active",
    balance: "$950",
    email: "manager@riverside.com",
    phone: "(555) 300-0002",
  },
  {
    id: "14",
    workspaceId: "properties",
    name: "Sunset Strip Mall",
    status: "Active",
    balance: "$8,500",
    email: "leasing@sunsetstripmall.com",
    phone: "(555) 300-0003",
  },
  {
    id: "15",
    workspaceId: "properties",
    name: "Green Valley HOA",
    status: "Active",
    balance: "$2,100",
    email: "board@greenvalleyhoa.com",
    phone: "(555) 300-0004",
  },
  {
    id: "16",
    workspaceId: "properties",
    name: "Johnson Commercial",
    status: "Active",
    balance: "$4,750",
    email: "admin@johnsoncommercial.com",
    phone: "(555) 300-0005",
  },
];
```

## lib\expenses.ts

```typescript
// lib/expenses.ts

export type Expense = {
  description: string;
  category: string;
  amount: string;
  workspaceId: string;
};

export const expenses: Expense[] = [
  // LANDSCAPING

  {
    description: "Mulch Bulk Order",
    category: "Materials",
    amount: "$1,750",
    workspaceId: "landscaping",
  },
  {
    description: "Fuel For Fleet",
    category: "Fuel",
    amount: "$420",
    workspaceId: "landscaping",
  },
  {
    description: "Trimmer Line Restock",
    category: "Materials",
    amount: "$180",
    workspaceId: "landscaping",
  },
  {
    description: "Equipment Maintenance",
    category: "Equipment",
    amount: "$320",
    workspaceId: "landscaping",
  },

  // SNOW REMOVAL

  {
    description: "Salt Bulk Order",
    category: "Materials",
    amount: "$900",
    workspaceId: "snow-removal",
  },
  {
    description: "Snow Plow Maintenance",
    category: "Equipment",
    amount: "$380",
    workspaceId: "snow-removal",
  },
  {
    description: "Diesel Fuel",
    category: "Fuel",
    amount: "$540",
    workspaceId: "snow-removal",
  },
  {
    description: "Hydraulic Repair",
    category: "Equipment",
    amount: "$650",
    workspaceId: "snow-removal",
  },

  // PROPERTIES

  {
    description: "Monthly Property Insurance",
    category: "Insurance",
    amount: "$650",
    workspaceId: "properties",
  },
  {
    description: "HVAC Service Contract",
    category: "Maintenance",
    amount: "$1,200",
    workspaceId: "properties",
  },
  {
    description: "Lighting Replacement",
    category: "Materials",
    amount: "$340",
    workspaceId: "properties",
  },
  {
    description: "Parking Lot Repairs",
    category: "Maintenance",
    amount: "$875",
    workspaceId: "properties",
  },
];
```

## lib\inventory.ts

```typescript
// lib/inventory.ts

export type InventoryItem = {
  name: string;
  currentQty: number;
  targetQty: number;
  warning: boolean;
  workspaceId: string;
};

export const inventory: InventoryItem[] = [
  // LANDSCAPING

  {
    name: "Gasoline (gallons)",
    currentQty: 20,
    targetQty: 40,
    warning: true,
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
    name: "Trimmer Line",
    currentQty: 6,
    targetQty: 15,
    warning: true,
    workspaceId: "landscaping",
  },
  {
    name: "Topsoil (cubic yards)",
    currentQty: 22,
    targetQty: 20,
    warning: false,
    workspaceId: "landscaping",
  },

  // SNOW REMOVAL

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
    name: "Fuel (gallons)",
    currentQty: 30,
    targetQty: 50,
    warning: true,
    workspaceId: "snow-removal",
  },
  {
    name: "Hydraulic Fluid",
    currentQty: 12,
    targetQty: 10,
    warning: false,
    workspaceId: "snow-removal",
  },

  // PROPERTIES

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
  {
    name: "Smoke Detectors",
    currentQty: 8,
    targetQty: 20,
    warning: true,
    workspaceId: "properties",
  },
  {
    name: "Paint (gallons)",
    currentQty: 14,
    targetQty: 10,
    warning: false,
    workspaceId: "properties",
  },
  {
    name: "Air Fresheners",
    currentQty: 5,
    targetQty: 15,
    warning: true,
    workspaceId: "properties",
  },
];
```

## lib\invoices.ts

```typescript
export type Invoice = {
  id: string;
  client: string;
  status: "Draft" | "Sent" | "Overdue" | "Paid";
  amount: string;
  workspaceId: string;
};

export const invoices: Invoice[] = [
  // LANDSCAPING

  {
    id: "INV-001",
    client: "Acme HOA",
    status: "Paid",
    amount: "$850",
    workspaceId: "landscaping",
  },
  {
    id: "INV-005",
    client: "John Smith",
    status: "Sent",
    amount: "$450",
    workspaceId: "landscaping",
  },
  {
    id: "INV-006",
    client: "Johnson Residence",
    status: "Overdue",
    amount: "$800",
    workspaceId: "landscaping",
  },

  // SNOW REMOVAL

  {
    id: "INV-002",
    client: "Winter Ridge Condos",
    status: "Overdue",
    amount: "$2,400",
    workspaceId: "snow-removal",
  },
  {
    id: "INV-007",
    client: "Rochester Community Church",
    status: "Sent",
    amount: "$3,500",
    workspaceId: "snow-removal",
  },
  {
    id: "INV-008",
    client: "North Plaza",
    status: "Paid",
    amount: "$2,400",
    workspaceId: "snow-removal",
  },

  // PROPERTIES

  {
    id: "INV-003",
    client: "Johnson Commercial",
    status: "Paid",
    amount: "$3,200",
    workspaceId: "properties",
  },
  {
    id: "INV-004",
    client: "Green Valley HOA",
    status: "Sent",
    amount: "$1,200",
    workspaceId: "properties",
  },
  {
    id: "INV-009",
    client: "Sunset Strip Mall",
    status: "Draft",
    amount: "$8,500",
    workspaceId: "properties",
  },
];
```

## lib\jobs.ts

```typescript
export type JobStatus =
  | "Lead"
  | "Quoted"
  | "Scheduled"
  | "Completed"
  | "Paid";

export type JobMaterial = {
  name: string;
  quantity: number;
};

export type Job = {
  id: string;
  workspaceId: string;
  name: string;
  client: string;
  status: JobStatus;
  value: string;
  date: string;
  materials: JobMaterial[];
  notes?: string;
};

export const jobs: Job[] = [
  // LANDSCAPING
  {
    id: "1",
    workspaceId: "landscaping",
    name: "Jones Residence",
    client: "Jones Family",
    status: "Lead",
    value: "$200",
    date: "2026-06-10",
    materials: [
      { name: "Mulch (cubic yards)", quantity: 2 },
      { name: "Fertilizer (50lb bags)", quantity: 1 },
    ],
    notes: "Initial lead for residential landscaping work.",
  },
  {
    id: "2",
    workspaceId: "landscaping",
    name: "Brown Property",
    client: "Brown Family",
    status: "Lead",
    value: "$350",
    date: "2026-06-12",
    materials: [
      { name: "Gasoline (gallons)", quantity: 4 },
      { name: "Trimmer Line", quantity: 1 },
    ],
    notes: "Needs follow-up before quote is finalized.",
  },
  {
    id: "3",
    workspaceId: "landscaping",
    name: "Acme HOA Cleanup",
    client: "Acme HOA",
    status: "Quoted",
    value: "$1,500",
    date: "2026-06-14",
    materials: [
      { name: "Mulch (cubic yards)", quantity: 10 },
      { name: "Topsoil (cubic yards)", quantity: 5 },
      { name: "Fertilizer (50lb bags)", quantity: 4 },
    ],
    notes: "HOA cleanup quote submitted.",
  },
  {
    id: "4",
    workspaceId: "landscaping",
    name: "Spring Cleanup",
    client: "John Smith",
    status: "Scheduled",
    value: "$450",
    date: "2026-06-15",
    materials: [
      { name: "Mulch (cubic yards)", quantity: 5 },
      { name: "Fertilizer (50lb bags)", quantity: 1 },
      { name: "Trimmer Line", quantity: 1 },
    ],
    notes: "Customer requested cleanup around front flower beds.",
  },
  {
    id: "5",
    workspaceId: "landscaping",
    name: "Weekly Service",
    client: "Sunset Apartments",
    status: "Completed",
    value: "$120",
    date: "2026-06-18",
    materials: [
      { name: "Gasoline (gallons)", quantity: 3 },
      { name: "Trimmer Line", quantity: 1 },
    ],
    notes: "Weekly service completed.",
  },
  {
    id: "6",
    workspaceId: "landscaping",
    name: "Mulch Installation",
    client: "Johnson Residence",
    status: "Paid",
    value: "$800",
    date: "2026-06-17",
    materials: [
      { name: "Mulch (cubic yards)", quantity: 8 },
      { name: "Topsoil (cubic yards)", quantity: 2 },
    ],
    notes: "Paid mulch installation job.",
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
    materials: [
      { name: "Salt Bags", quantity: 20 },
      { name: "Ice Melt Buckets", quantity: 4 },
    ],
    notes: "Seasonal snow removal lead.",
  },
  {
    id: "8",
    workspaceId: "snow-removal",
    name: "Office Lot Bid",
    client: "Riverside Office Park",
    status: "Quoted",
    value: "$6,800",
    date: "2026-11-05",
    materials: [
      { name: "Salt Bags", quantity: 40 },
      { name: "Fuel (gallons)", quantity: 10 },
    ],
    notes: "Commercial lot bid submitted.",
  },
  {
    id: "9",
    workspaceId: "snow-removal",
    name: "Condo Association",
    client: "Winter Ridge Condos",
    status: "Scheduled",
    value: "$9,200",
    date: "2026-11-10",
    materials: [
      { name: "Salt Bags", quantity: 50 },
      { name: "Ice Melt Buckets", quantity: 8 },
      { name: "Fuel (gallons)", quantity: 12 },
    ],
    notes: "Scheduled snow removal contract.",
  },
  {
    id: "10",
    workspaceId: "snow-removal",
    name: "Emergency Salt Run",
    client: "Oakland Medical Center",
    status: "Completed",
    value: "$650",
    date: "2026-11-12",
    materials: [
      { name: "Salt Bags", quantity: 12 },
      { name: "Fuel (gallons)", quantity: 5 },
      { name: "Hydraulic Fluid", quantity: 1 },
    ],
    notes: "Emergency salt run completed.",
  },
  {
    id: "11",
    workspaceId: "snow-removal",
    name: "Retail Plaza Clearing",
    client: "North Plaza",
    status: "Paid",
    value: "$2,400",
    date: "2026-11-15",
    materials: [
      { name: "Salt Bags", quantity: 25 },
      { name: "Fuel (gallons)", quantity: 8 },
    ],
    notes: "Paid snow clearing job.",
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
    materials: [
      { name: "Paint (gallons)", quantity: 3 },
      { name: "Light Bulbs", quantity: 4 },
    ],
    notes: "Potential apartment turnover job.",
  },
  {
    id: "13",
    workspaceId: "properties",
    name: "HVAC Inspection",
    client: "Riverside Office Park",
    status: "Quoted",
    value: "$950",
    date: "2026-07-03",
    materials: [
      { name: "HVAC Filters", quantity: 6 },
      { name: "Smoke Detectors", quantity: 2 },
    ],
    notes: "Inspection quote submitted.",
  },
  {
    id: "14",
    workspaceId: "properties",
    name: "Parking Lot Sealcoat",
    client: "Sunset Strip Mall",
    status: "Scheduled",
    value: "$8,500",
    date: "2026-07-10",
    materials: [
      { name: "Paint (gallons)", quantity: 8 },
      { name: "Light Bulbs", quantity: 10 },
    ],
    notes: "Scheduled parking lot maintenance.",
  },
  {
    id: "15",
    workspaceId: "properties",
    name: "Roof Leak Repair",
    client: "Green Valley HOA",
    status: "Completed",
    value: "$2,100",
    date: "2026-07-12",
    materials: [
      { name: "Smoke Detectors", quantity: 3 },
      { name: "Air Fresheners", quantity: 5 },
    ],
    notes: "Repair completed.",
  },
  {
    id: "16",
    workspaceId: "properties",
    name: "Quarterly Maintenance",
    client: "Johnson Commercial",
    status: "Paid",
    value: "$4,750",
    date: "2026-07-15",
    materials: [
      { name: "HVAC Filters", quantity: 8 },
      { name: "Light Bulbs", quantity: 12 },
      { name: "Air Fresheners", quantity: 6 },
    ],
    notes: "Paid quarterly maintenance job.",
  },
];
```

## lib\jobStorage.ts

```typescript
import { jobs as defaultJobs } from "@/lib/jobs";

export function getStoredJobs() {
  if (typeof window === "undefined") {
    return defaultJobs;
  }

  const savedJobs = localStorage.getItem("frontier-jobs");

  if (!savedJobs) {
    return defaultJobs;
  }

  try {
    return JSON.parse(savedJobs);
  } catch {
    return defaultJobs;
  }
}

export function saveStoredJobs(jobs: typeof defaultJobs) {
  localStorage.setItem("frontier-jobs", JSON.stringify(jobs));
}
```

## next-env.d.ts

```typescript
/// <reference types="next" />
/// <reference types="next/image-types/global" />
import "./.next/dev/types/routes.d.ts";

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

