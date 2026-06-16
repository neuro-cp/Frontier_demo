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
  📁 invoices
    📁 [id]
      📄 page.tsx
    📁 new
      📄 page.tsx
    📄 page.tsx
  📁 jobs
    📁 [id]
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
  📄 frontierClients.ts
  📄 frontierInvoices.ts
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
import { clients as defaultClients } from "@/lib/clients";
import { useWorkspace } from "@/components/WorkspaceContext";
import { ClientRow } from "@/lib/frontierClients";

type ClientCalendarEvent = {
  id: string;
  workspaceId: string;
  clientId: string;
  clientName: string;
  title: string;
  date: string;
};

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

function formatMonthLabel(date: Date) {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function formatDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function CalendarPage() {
  const { activeWorkspace } = useWorkspace();

  const [view, setView] = useState("month");
  const [jobItems, setJobItems] = useState(defaultJobs);
  const [clientItems, setClientItems] = useState<ClientRow[]>(defaultClients);
  const [clientEvents, setClientEvents] = useState<ClientCalendarEvent[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 5, 1));

  const [clientEventOpen, setClientEventOpen] = useState(false);
  const [clientEventClientId, setClientEventClientId] = useState("");
  const [clientEventTitle, setClientEventTitle] = useState("");
  const [clientEventDate, setClientEventDate] = useState("");

  useEffect(() => {
    const savedJobs = localStorage.getItem("frontier-jobs");
    const savedClients = localStorage.getItem("frontier-clients");
    const savedClientEvents = localStorage.getItem("frontier-client-calendar-events");

    if (savedJobs) {
      try {
        setJobItems(JSON.parse(savedJobs));
      } catch {
        setJobItems(defaultJobs);
      }
    }

    if (savedClients) {
      try {
        setClientItems(JSON.parse(savedClients));
      } catch {
        setClientItems(defaultClients);
      }
    }

    if (savedClientEvents) {
      try {
        setClientEvents(JSON.parse(savedClientEvents));
      } catch {
        setClientEvents([]);
      }
    }
  }, []);

  const workspaceClients = clientItems.filter(
    (client) => client.workspaceId === activeWorkspace.id
  );

  const workspaceJobs = jobItems
    .filter((job) => job.workspaceId === activeWorkspace.id)
    .filter((job) => job.date)
    .sort((a, b) => a.date.localeCompare(b.date));

  const workspaceClientEvents = clientEvents
    .filter((event) => event.workspaceId === activeWorkspace.id)
    .sort((a, b) => a.date.localeCompare(b.date));

  const monthYear = currentMonth.getFullYear();
  const monthIndex = currentMonth.getMonth();
  const firstDayOfMonth = new Date(monthYear, monthIndex, 1);
  const firstWeekdayIndex = firstDayOfMonth.getDay();
  const daysInMonth = new Date(monthYear, monthIndex + 1, 0).getDate();

  const calendarDays = Array.from({ length: 42 }, (_, index) => {
    const dayNumber = index - firstWeekdayIndex + 1;
    if (dayNumber < 1 || dayNumber > daysInMonth) return null;
    return new Date(monthYear, monthIndex, dayNumber);
  });

  function goToPreviousMonth() {
    setCurrentMonth(new Date(monthYear, monthIndex - 1, 1));
  }

  function goToNextMonth() {
    setCurrentMonth(new Date(monthYear, monthIndex + 1, 1));
  }

  function goToToday() {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  }

  function saveClientEvents(updatedEvents: ClientCalendarEvent[]) {
    setClientEvents(updatedEvents);
    localStorage.setItem("frontier-client-calendar-events", JSON.stringify(updatedEvents));
  }

  function closeClientEventModal() {
    setClientEventOpen(false);
    setClientEventClientId("");
    setClientEventTitle("");
    setClientEventDate("");
  }

  function addClientEvent() {
    const selectedClient = workspaceClients.find((client) => client.id === clientEventClientId);
    if (!selectedClient || !clientEventDate) return;

    const newEvent: ClientCalendarEvent = {
      id: crypto.randomUUID(),
      workspaceId: activeWorkspace.id,
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      title: clientEventTitle.trim() || "Client Follow-up",
      date: clientEventDate,
    };

    saveClientEvents([...clientEvents, newEvent]);
    closeClientEventModal();
  }

  const currentMonthJobs = workspaceJobs.filter((job) => {
    const jobDate = new Date(`${job.date}T00:00:00`);
    return jobDate.getFullYear() === monthYear && jobDate.getMonth() === monthIndex;
  });

  const currentMonthClientEvents = workspaceClientEvents.filter((event) => {
    const eventDate = new Date(`${event.date}T00:00:00`);
    return eventDate.getFullYear() === monthYear && eventDate.getMonth() === monthIndex;
  });

  const agendaItems = [
    ...workspaceJobs.map((job) => ({ type: "job" as const, date: job.date, job })),
    ...workspaceClientEvents.map((event) => ({ type: "client" as const, date: event.date, event })),
  ].sort((a, b) => a.date.localeCompare(b.date));

  const weekItems = agendaItems.slice(0, 7);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={goToPreviousMonth} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800">Prev</button>
          <button type="button" onClick={goToToday} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800">Today</button>
          <button type="button" onClick={goToNextMonth} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800">Next</button>
          <select value={view} onChange={(event) => setView(event.target.value)} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
            <option value="month">Month View</option>
            <option value="week">Week View</option>
            <option value="agenda">Agenda View</option>
          </select>
          <button type="button" onClick={() => setClientEventOpen(true)} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700">+ Client Event</button>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow dark:bg-gray-900 sm:p-6">
        {view === "month" && (
          <>
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-semibold text-gray-950 dark:text-gray-100">{formatMonthLabel(currentMonth)}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {currentMonthJobs.length} job(s), {currentMonthClientEvents.length} client event(s)
              </p>
            </div>

            <div className="overflow-x-auto">
              <div className="grid min-w-[900px] grid-cols-7 gap-1 lg:gap-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => <div key={dayName} className="p-2 text-sm font-semibold text-gray-500 dark:text-gray-400">{dayName}</div>)}

                {calendarDays.map((day, index) => {
                  const dayString = day ? formatDateString(day) : "";
                  const dayJobs = workspaceJobs.filter((job) => job.date === dayString);
                  const dayClientEvents = workspaceClientEvents.filter((event) => event.date === dayString);

                  return (
                    <div key={index} className="min-h-24 rounded-lg border border-gray-200 p-2 dark:border-gray-800 lg:min-h-28">
                      <div className="font-semibold text-gray-950 dark:text-gray-100">{day ? day.getDate() : ""}</div>
                      {dayJobs.map((job) => (
                        <Link key={job.id} href={`/jobs/${job.id}`} className={`mt-1 block rounded px-2 py-1 text-xs font-medium text-white hover:opacity-90 ${getJobColor(job.status)}`}>{job.name}</Link>
                      ))}
                      {dayClientEvents.map((event) => (
                        <Link key={event.id} href={`/clients/${event.clientId}`} className="mt-1 block rounded bg-teal-600 px-2 py-1 text-xs font-medium text-white hover:opacity-90">{event.title}: {event.clientName}</Link>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {view !== "month" && (
          <div className="space-y-3">
            {(view === "week" ? weekItems : agendaItems).length > 0 ? (
              (view === "week" ? weekItems : agendaItems).map((item) =>
                item.type === "job" ? (
                  <Link key={`job-${item.job.id}`} href={`/jobs/${item.job.id}`} className="block rounded-xl border border-gray-200 p-4 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800">
                    <div className="flex items-center justify-between">
                      <div><div className="font-semibold text-blue-600 hover:underline dark:text-blue-400">{item.job.name}</div><div className="text-sm text-gray-500 dark:text-gray-400">{item.job.date}</div></div>
                      <span className={`rounded px-3 py-1 text-xs font-medium text-white ${getJobColor(item.job.status)}`}>{item.job.status}</span>
                    </div>
                  </Link>
                ) : (
                  <Link key={`client-${item.event.id}`} href={`/clients/${item.event.clientId}`} className="block rounded-xl border border-teal-200 p-4 hover:bg-teal-50 dark:border-teal-900 dark:hover:bg-teal-950/30">
                    <div className="font-semibold text-teal-700 dark:text-teal-300">{item.event.title}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{item.event.clientName} · {item.event.date}</div>
                  </Link>
                )
              )
            ) : (
              <div className="text-center text-lg text-gray-500 dark:text-gray-400">No calendar items for {activeWorkspace.name}</div>
            )}
          </div>
        )}
      </div>

      {clientEventOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-950 dark:text-gray-100">Add Client to Calendar</h2>
              <button type="button" onClick={closeClientEventModal} className="text-2xl text-gray-500">×</button>
            </div>
            <div className="space-y-4">
              <select value={clientEventClientId} onChange={(event) => setClientEventClientId(event.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
                <option value="">Select Client</option>
                {workspaceClients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
              </select>
              <input type="text" value={clientEventTitle} onChange={(event) => setClientEventTitle(event.target.value)} placeholder="Follow-up, estimate, walkthrough..." className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800" />
              <input type="date" value={clientEventDate} onChange={(event) => setClientEventDate(event.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800" />
              <button type="button" onClick={addClientEvent} className="w-full rounded-lg bg-blue-600 py-3 text-white hover:bg-blue-700">Add to Calendar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

## app\clients\[id]\page.tsx

```tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { clients as defaultClients } from "@/lib/clients";
import { jobs as defaultJobs, Job } from "@/lib/jobs";
import { ClientRow } from "@/lib/frontierClients";
import {
  formatCurrency,
  getInvoiceTotals,
  InvoiceRow,
  loadSavedInvoices,
} from "@/lib/frontierInvoices";

export default function ClientPage() {
  const params = useParams();
  const id = String(params.id);

  const [clients, setClients] = useState<ClientRow[]>(defaultClients);
  const [jobs, setJobs] = useState<Job[]>(defaultJobs);
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const savedClients = localStorage.getItem("frontier-clients");
    const savedJobs = localStorage.getItem("frontier-jobs");

    if (savedClients) {
      try {
        setClients(JSON.parse(savedClients));
      } catch {
        setClients(defaultClients);
      }
    }

    if (savedJobs) {
      try {
        setJobs(JSON.parse(savedJobs));
      } catch {
        setJobs(defaultJobs);
      }
    }

    setInvoices(loadSavedInvoices());
    setLoaded(true);
  }, []);

  const client = clients.find((clientItem) => clientItem.id === id);

  const clientJobs = useMemo(() => {
    if (!client) return [];
    return jobs.filter(
      (job) =>
        job.workspaceId === client.workspaceId &&
        job.client.trim().toLowerCase() === client.name.trim().toLowerCase()
    );
  }, [client, jobs]);

  const clientInvoices = useMemo(() => {
    if (!client) return [];
    return invoices.filter(
      (invoice) =>
        invoice.workspaceId === client.workspaceId &&
        (invoice.sourceClientId === client.id ||
          invoice.billToName.trim().toLowerCase() === client.name.trim().toLowerCase() ||
          invoice.billToCompany.trim().toLowerCase() === client.name.trim().toLowerCase())
    );
  }, [client, invoices]);

  const invoiceTotal = clientInvoices.reduce(
    (total, invoice) => total + getInvoiceTotals(invoice).total,
    0
  );

  if (!loaded) return null;

  if (!client) {
    return (
      <div className="space-y-4 text-gray-950 dark:text-gray-100">
        <Link href="/clients" className="text-blue-600 hover:underline dark:text-blue-400">← Back to Clients</Link>
        <h1 className="text-3xl font-bold">Client not found</h1>
      </div>
    );
  }

  const addressParts = [client.address, client.city, client.state, client.zip].filter(Boolean);

  return (
    <div className="space-y-6 text-gray-950 dark:text-gray-100">
      <Link href="/clients" className="text-blue-600 hover:underline dark:text-blue-400">← Back to Clients</Link>

      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">{client.name}</h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">{client.status}</p>
          </div>
          <div className="text-right text-lg font-bold">{client.balance}</div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <p><strong>Phone:</strong> {client.phone || "—"}</p>
          <p><strong>Email:</strong> {client.email || "—"}</p>
          <p className="sm:col-span-2"><strong>Address:</strong> {addressParts.length > 0 ? addressParts.join(", ") : "—"}</p>
          {client.notes && <p className="sm:col-span-2"><strong>Notes:</strong> {client.notes}</p>}
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-900">
        <h2 className="mb-4 text-xl font-semibold">Jobs</h2>
        {clientJobs.length > 0 ? (
          <div className="space-y-3">
            {clientJobs.map((job) => (
              <Link key={job.id} href={`/jobs/${job.id}`} className="block rounded-lg border border-gray-200 p-4 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="font-semibold text-blue-600 dark:text-blue-400">{job.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{job.status} · {job.date || "No date"}</div>
                  </div>
                  <div className="font-bold">{job.value}</div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No jobs found for this client.</p>
        )}
      </div>

      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-900">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold">Invoices</h2>
          <div className="font-bold">Total: {formatCurrency(invoiceTotal)}</div>
        </div>

        {clientInvoices.length > 0 ? (
          <div className="space-y-3">
            {clientInvoices.map((invoice) => (
              <Link key={invoice.id} href={`/invoices/${invoice.id}`} className="block rounded-lg border border-gray-200 p-4 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="font-semibold text-blue-600 dark:text-blue-400">{invoice.invoiceNumber}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{invoice.status} · {invoice.invoiceDate}</div>
                  </div>
                  <div className="font-bold">{formatCurrency(getInvoiceTotals(invoice).total)}</div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No invoices found for this client.</p>
        )}
      </div>
    </div>
  );
}
```

## app\clients\page.tsx

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { useWorkspace } from "@/components/WorkspaceContext";
import { clients as defaultClients } from "@/lib/clients";

type ClientRow = {
  id: string;
  workspaceId: string;
  name: string;
  status: string;
  balance: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  notes?: string;
};

const clientStatuses = ["Lead", "Active", "Inactive"] as const;

type ClientStatusPriority = "default" | (typeof clientStatuses)[number];

function formatMoney(value: string) {
  const numericValue = Number(value.replace(/[$,]/g, ""));

  if (Number.isNaN(numericValue)) {
    return "$0";
  }

  return `$${numericValue.toLocaleString()}`;
}

function getStatusClasses(status: string) {
  if (status === "Active") {
    return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300";
  }

  if (status === "Lead") {
    return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300";
  }

  if (status === "Inactive") {
    return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  }

  return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
}

export default function ClientsPage() {
  const { activeWorkspace } = useWorkspace();

  const [clientItems, setClientItems] = useState<ClientRow[]>(defaultClients);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [statusPriority, setStatusPriority] =
    useState<ClientStatusPriority>("default");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newClientOpen, setNewClientOpen] = useState(false);
  const [editClientOpen, setEditClientOpen] = useState(false);
  const [editingClientId, setEditingClientId] = useState("");

  const [clientName, setClientName] = useState("");
  const [clientStatus, setClientStatus] =
    useState<(typeof clientStatuses)[number]>("Active");
  const [clientBalance, setClientBalance] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientCity, setClientCity] = useState("");
  const [clientState, setClientState] = useState("");
  const [clientZip, setClientZip] = useState("");
  const [clientNotes, setClientNotes] = useState("");

  useEffect(() => {
    const savedClients = localStorage.getItem("frontier-clients");

    if (savedClients) {
      try {
        setClientItems(JSON.parse(savedClients));
      } catch {
        setClientItems(defaultClients);
      }
    }
  }, []);

  const workspaceClients = clientItems.filter(
    (client) => client.workspaceId === activeWorkspace.id
  );

  const sortedWorkspaceClients = [...workspaceClients].sort((a, b) => {
    if (statusPriority === "default") {
      return a.name.localeCompare(b.name);
    }

    if (a.status === statusPriority && b.status !== statusPriority) {
      return -1;
    }

    if (a.status !== statusPriority && b.status === statusPriority) {
      return 1;
    }

    return a.name.localeCompare(b.name);
  });

  const allWorkspaceClientsSelected =
    workspaceClients.length > 0 &&
    workspaceClients.every((client) => selectedClients.includes(client.id));

  function saveClients(updatedClients: ClientRow[]) {
    setClientItems(updatedClients);
    localStorage.setItem("frontier-clients", JSON.stringify(updatedClients));
  }

  function cycleStatusPriority() {
    setStatusPriority((current) => {
      if (current === "default") return "Active";
      if (current === "Active") return "Lead";
      if (current === "Lead") return "Inactive";
      return "default";
    });
  }

  function getStatusSortLabel() {
    if (statusPriority === "default") {
      return "Default";
    }

    return `${statusPriority} first`;
  }

  function resetClientForm() {
    setClientName("");
    setClientStatus("Active");
    setClientBalance("");
    setClientEmail("");
    setClientPhone("");
    setClientAddress("");
    setClientCity("");
    setClientState("");
    setClientZip("");
    setClientNotes("");
    setEditingClientId("");
  }

  function closeClientModals() {
    setNewClientOpen(false);
    setEditClientOpen(false);
    resetClientForm();
  }

  function toggleClient(clientId: string) {
    setSelectedClients((current) =>
      current.includes(clientId)
        ? current.filter((id) => id !== clientId)
        : [...current, clientId]
    );
  }

  function toggleAllWorkspaceClients() {
    if (allWorkspaceClientsSelected) {
      setSelectedClients((current) =>
        current.filter(
          (clientId) =>
            !workspaceClients.some((client) => client.id === clientId)
        )
      );

      return;
    }

    setSelectedClients((current) => {
      const workspaceClientIds = workspaceClients.map((client) => client.id);

      const preservedOtherWorkspaceSelections = current.filter(
        (clientId) => !workspaceClientIds.includes(clientId)
      );

      return [...preservedOtherWorkspaceSelections, ...workspaceClientIds];
    });
  }

  function clientNameAlreadyExists(name: string, ignoredClientId?: string) {
    return workspaceClients.some(
      (client) =>
        client.id !== ignoredClientId &&
        client.name.trim().toLowerCase() === name.trim().toLowerCase()
    );
  }

  function addClient() {
    if (!clientName.trim()) return;
    if (clientNameAlreadyExists(clientName)) return;

    const newClient: ClientRow = {
      id: crypto.randomUUID(),
      workspaceId: activeWorkspace.id,
      name: clientName.trim(),
      status: clientStatus,
      balance: formatMoney(clientBalance || "0"),
      email: clientEmail.trim(),
      phone: clientPhone.trim(),
      address: clientAddress.trim(),
      city: clientCity.trim(),
      state: clientState.trim(),
      zip: clientZip.trim(),
      notes: clientNotes.trim(),
    };

    saveClients([...clientItems, newClient]);
    closeClientModals();
  }

  function openEditClient(client: ClientRow) {
    setEditingClientId(client.id);
    setClientName(client.name);
    setClientStatus(
      clientStatuses.includes(client.status as (typeof clientStatuses)[number])
        ? (client.status as (typeof clientStatuses)[number])
        : "Active"
    );
    setClientBalance(client.balance.replace(/[$,]/g, ""));
    setClientEmail(client.email ?? "");
    setClientPhone(client.phone ?? "");
    setClientAddress(client.address ?? "");
    setClientCity(client.city ?? "");
    setClientState(client.state ?? "");
    setClientZip(client.zip ?? "");
    setClientNotes(client.notes ?? "");
    setEditClientOpen(true);
  }

  function saveEditedClient() {
    if (!editingClientId) return;
    if (!clientName.trim()) return;
    if (clientNameAlreadyExists(clientName, editingClientId)) return;

    const updatedClients = clientItems.map((client) =>
      client.id === editingClientId
        ? {
            ...client,
            name: clientName.trim(),
            status: clientStatus,
            balance: formatMoney(clientBalance || "0"),
            email: clientEmail.trim(),
            phone: clientPhone.trim(),
            address: clientAddress.trim(),
            city: clientCity.trim(),
            state: clientState.trim(),
            zip: clientZip.trim(),
            notes: clientNotes.trim(),
          }
        : client
    );

    saveClients(updatedClients);
    closeClientModals();
  }

  function removeSelectedClients() {
    const updatedClients = clientItems.filter(
      (client) => !selectedClients.includes(client.id)
    );

    saveClients(updatedClients);
    setSelectedClients([]);
    setShowDeleteModal(false);
  }

  return (
    <div className="space-y-6 text-gray-950 dark:text-gray-100">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setNewClientOpen(true)}
            className="rounded-lg bg-blue-600 px-6 py-3 text-white shadow hover:bg-blue-700"
          >
            + Add Client
          </button>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            disabled={selectedClients.length === 0}
            className="rounded-lg bg-red-600 px-6 py-3 text-white shadow hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Remove Client
          </button>
        </div>
      </div>

      {selectedClients.length > 0 && (
        <div className="rounded-lg bg-gray-900 p-4 text-white">
          {selectedClients.length} client
          {selectedClients.length === 1 ? "" : "s"} selected
        </div>
      )}

      <div className="overflow-x-auto rounded-lg bg-white shadow dark:bg-gray-900">
        <table className="min-w-[1050px] w-full">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr className="text-gray-700 dark:text-gray-300">
              <th className="w-12 p-4">
                <input
                  type="checkbox"
                  checked={allWorkspaceClientsSelected}
                  onChange={toggleAllWorkspaceClients}
                  disabled={workspaceClients.length === 0}
                  className="h-4 w-4"
                />
              </th>

              <th className="p-4 text-left">Name</th>

              <th className="p-4 text-left">
                <button
                  type="button"
                  onClick={cycleStatusPriority}
                  className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400"
                  title="Cycle status priority"
                >
                  <span>Status</span>
                  <span className="text-xs">
                    {statusPriority === "default" ? "↕" : "↑"}
                  </span>
                </button>

                <div className="mt-1 text-xs font-normal text-gray-500 dark:text-gray-400">
                  {getStatusSortLabel()}
                </div>
              </th>

              <th className="p-4 text-left">Phone</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Address</th>
              <th className="p-4 text-right">Balance</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {sortedWorkspaceClients.length > 0 ? (
              sortedWorkspaceClients.map((client) => {
                const addressParts = [
                  client.address,
                  client.city,
                  client.state,
                  client.zip,
                ].filter(Boolean);

                return (
                  <tr
                    key={client.id}
                    className="border-t border-gray-200 text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedClients.includes(client.id)}
                        onChange={() => toggleClient(client.id)}
                        className="h-4 w-4"
                      />
                    </td>

                    <td className="p-4 font-medium">
                      <Link
                        href={`/clients/${client.id}`}
                        className="text-blue-600 hover:underline dark:text-blue-400"
                      >
                        {client.name}
                      </Link>
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                          client.status
                        )}`}
                      >
                        {client.status}
                      </span>
                    </td>

                    <td className="p-4">{client.phone || "—"}</td>

                    <td className="p-4">
                      {client.email ? (
                        <a
                          href={`mailto:${client.email}`}
                          className="text-blue-600 hover:underline dark:text-blue-400"
                        >
                          {client.email}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td className="p-4">
                      {addressParts.length > 0 ? addressParts.join(", ") : "—"}
                    </td>

                    <td className="p-4 text-right font-medium">
                      {client.balance}
                    </td>

                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={() => openEditClient(client)}
                        className="text-blue-600 hover:underline dark:text-blue-400"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={8}
                  className="p-10 text-center text-lg text-gray-500 dark:text-gray-400"
                >
                  No clients found for {activeWorkspace.name}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {(newClientOpen || editClientOpen) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-950 dark:text-gray-100">
                {editClientOpen ? "Edit Client" : "Add Client"}
              </h2>

              <button
                type="button"
                onClick={closeClientModals}
                className="text-2xl text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ×
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Client Name *
                </label>

                <input
                  type="text"
                  value={clientName}
                  onChange={(event) => setClientName(event.target.value)}
                  placeholder="Jones Family"
                  className="w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Status
                  </label>

                  <select
                    value={clientStatus}
                    onChange={(event) =>
                      setClientStatus(
                        event.target.value as (typeof clientStatuses)[number]
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800"
                  >
                    {clientStatuses.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Starting Balance
                  </label>

                  <input
                    type="number"
                    value={clientBalance}
                    onChange={(event) => setClientBalance(event.target.value)}
                    placeholder="0"
                    className="w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(event) => setClientPhone(event.target.value)}
                    placeholder="(555) 123-4567"
                    className="w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Email Address
                  </label>

                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(event) => setClientEmail(event.target.value)}
                    placeholder="client@example.com"
                    className="w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Street Address
                </label>

                <input
                  type="text"
                  value={clientAddress}
                  onChange={(event) => setClientAddress(event.target.value)}
                  placeholder="123 Main St"
                  className="w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_120px_140px]">
                <div>
                  <label className="mb-2 block text-sm font-medium">City</label>

                  <input
                    type="text"
                    value={clientCity}
                    onChange={(event) => setClientCity(event.target.value)}
                    placeholder="Rochester Hills"
                    className="w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">State</label>

                  <input
                    type="text"
                    value={clientState}
                    onChange={(event) => setClientState(event.target.value)}
                    placeholder="MI"
                    className="w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">ZIP</label>

                  <input
                    type="text"
                    value={clientZip}
                    onChange={(event) => setClientZip(event.target.value)}
                    placeholder="48307"
                    className="w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Notes</label>

                <textarea
                  rows={4}
                  value={clientNotes}
                  onChange={(event) => setClientNotes(event.target.value)}
                  placeholder="Gate code, preferred contact method, billing notes..."
                  className="w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeClientModals}
                  className="rounded-lg border border-gray-300 px-5 py-3 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={editClientOpen ? saveEditedClient : addClient}
                  className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  {editClientOpen ? "Save Changes" : "Add Client"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Remove Clients
            </h2>

            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Are you sure you want to remove the selected client(s)?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                Cancel
              </button>

              <button
                type="button"
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
import Link from "next/link";

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
            href="/financials"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + Invoice
          </Link>

          <button
            type="button"
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            🎤 Speech
          </button>
          <button
            type="button"
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            📷 Image
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
            Document Extraction
          </h1>
          <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
            Upload documents for {activeWorkspace.name}. Extraction and verification pipeline comes later.
          </p>
        </div>

        <button onClick={() => setIsUploadOpen(true)} className="w-full rounded-lg bg-blue-600 px-6 py-3 text-center text-white shadow hover:bg-blue-700 sm:w-auto">
          + Upload Document
        </button>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
        Future flow: upload once → extract intended use and data → verify → choose whether to create a client, job, quote, invoice, expense, or calendar item.
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <table className="min-w-[650px] w-full">
          <thead>
            <tr className="border-b border-gray-200 text-left text-sm uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:text-gray-400">
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Detected Type</th>
              <th className="px-6 py-4">Extraction Status</th>
              <th className="px-6 py-4 text-right">File</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td colSpan={4} className="px-6 py-16 text-center text-2xl text-gray-500 dark:text-gray-400">
                No documents uploaded for {activeWorkspace.name}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-4 shadow-xl sm:p-6 lg:p-8 dark:bg-gray-900">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-950 dark:text-gray-100">Upload for Extraction</h2>
              <button onClick={() => setIsUploadOpen(false)} className="text-2xl text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">×</button>
            </div>

            <form className="space-y-6">
              <div>
                <label className="mb-2 block text-lg font-medium text-gray-900 dark:text-gray-100">Workspace</label>
                <input value={activeWorkspace.name} readOnly className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-lg text-gray-700 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300" />
              </div>

              <div>
                <label className="mb-2 block text-lg font-medium text-gray-900 dark:text-gray-100">Document Name</label>
                <input type="text" placeholder="Quote, invoice, receipt, handwritten note..." className="w-full rounded-lg border border-blue-500 bg-white px-4 py-3 text-lg text-gray-950 outline-none dark:bg-gray-800 dark:text-gray-100" />
              </div>

              <div>
                <label className="mb-2 block text-lg font-medium text-gray-900 dark:text-gray-100">File</label>
                <input type="file" className="block w-full text-sm text-gray-900 dark:text-gray-100" />
              </div>

              <div>
                <label className="mb-2 block text-lg font-medium text-gray-900 dark:text-gray-100">Notes</label>
                <textarea rows={3} placeholder="Optional context for later extraction." className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-lg text-gray-900 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100" />
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setIsUploadOpen(false)} className="w-full rounded-lg border border-gray-200 px-6 py-3 text-lg text-gray-900 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800 sm:w-auto">Cancel</button>
                <button type="button" onClick={() => setIsUploadOpen(false)} className="w-full rounded-lg bg-blue-500 px-6 py-3 text-lg font-semibold text-white hover:bg-blue-600 sm:w-auto">Save Upload Placeholder</button>
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

import { useEffect, useState } from "react";
import Link from "next/link";

import { useWorkspace } from "@/components/WorkspaceContext";
import { invoices as defaultInvoices } from "@/lib/invoices";
import { expenses as defaultExpenses, Expense } from "@/lib/expenses";
import {
  formatCurrency,
  getInvoiceClientName,
  getInvoiceTotals,
  InvoiceRow,
  InvoiceStatus,
  invoiceStatuses,
  loadSavedInvoices,
  moneyToNumber,
  saveSavedInvoices,
} from "@/lib/frontierInvoices";

type DefaultInvoice = (typeof defaultInvoices)[number];

type FinancialInvoice =
  | { source: "saved"; id: string; invoice: InvoiceRow }
  | { source: "default"; id: string; invoice: DefaultInvoice };

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

      <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${iconClass}`}>
        {icon}
      </div>
    </div>
  );
}

function getFinancialInvoiceNumber(row: FinancialInvoice) {
  return row.source === "saved" ? row.invoice.invoiceNumber : row.invoice.id;
}

function getFinancialInvoiceClient(row: FinancialInvoice) {
  return row.source === "saved"
    ? getInvoiceClientName(row.invoice)
    : row.invoice.client;
}

function getFinancialInvoiceStatus(row: FinancialInvoice): InvoiceStatus {
  return row.invoice.status as InvoiceStatus;
}

function getFinancialInvoiceTotal(row: FinancialInvoice) {
  return row.source === "saved"
    ? getInvoiceTotals(row.invoice).total
    : moneyToNumber(row.invoice.amount);
}

export default function FinancialsPage() {
  const { activeWorkspace } = useWorkspace();

  const [savedInvoices, setSavedInvoices] = useState<InvoiceRow[]>([]);
  const [defaultInvoiceItems, setDefaultInvoiceItems] =
    useState(defaultInvoices);
  const [expenseItems, setExpenseItems] = useState<Expense[]>(defaultExpenses);

  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);
  const [newExpenseOpen, setNewExpenseOpen] = useState(false);

  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("Materials");
  const [expenseAmount, setExpenseAmount] = useState("");

  useEffect(() => {
    setSavedInvoices(loadSavedInvoices());

    const savedExpenses = localStorage.getItem("frontier-expenses");

    if (savedExpenses) {
      try {
        setExpenseItems(JSON.parse(savedExpenses));
      } catch {
        setExpenseItems(defaultExpenses);
      }
    }
  }, []);

  const generatedInvoiceRows: FinancialInvoice[] = savedInvoices
    .filter((invoice) => invoice.workspaceId === activeWorkspace.id)
    .map((invoice) => ({
      source: "saved",
      id: invoice.id,
      invoice,
    }));

  const defaultInvoiceRows: FinancialInvoice[] = defaultInvoiceItems
    .filter((invoice) => invoice.workspaceId === activeWorkspace.id)
    .map((invoice) => ({
      source: "default",
      id: `default-${invoice.id}`,
      invoice,
    }));

  const workspaceInvoices = [...generatedInvoiceRows, ...defaultInvoiceRows];

  const workspaceExpenses = expenseItems.filter(
    (expense) => expense.workspaceId === activeWorkspace.id
  );

  function saveSavedInvoiceItems(updatedInvoices: InvoiceRow[]) {
    setSavedInvoices(updatedInvoices);
    saveSavedInvoices(updatedInvoices);
  }

  function saveExpenses(updatedExpenses: Expense[]) {
    setExpenseItems(updatedExpenses);
    localStorage.setItem("frontier-expenses", JSON.stringify(updatedExpenses));
  }

  function toggleInvoice(rowId: string) {
    setSelectedInvoices((current) =>
      current.includes(rowId)
        ? current.filter((invoiceId) => invoiceId !== rowId)
        : [...current, rowId]
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
    const selectedSavedInvoiceIds = selectedInvoices.filter(
      (id) => !id.startsWith("default-")
    );

    if (selectedSavedInvoiceIds.length > 0) {
      saveSavedInvoiceItems(
        savedInvoices.filter(
          (invoice) => !selectedSavedInvoiceIds.includes(invoice.id)
        )
      );
    }

    setDefaultInvoiceItems((current) =>
      current.filter(
        (invoice) => !selectedInvoices.includes(`default-${invoice.id}`)
      )
    );

    setSelectedInvoices([]);
  }

  function removeSelectedExpenses() {
    saveExpenses(
      expenseItems.filter(
        (expense) =>
          !selectedExpenses.includes(`${expense.workspaceId}-${expense.description}`)
      )
    );

    setSelectedExpenses([]);
  }

  function updateInvoiceStatus(row: FinancialInvoice, status: InvoiceStatus) {
    if (row.source === "saved") {
      saveSavedInvoiceItems(
        savedInvoices.map((invoice) =>
          invoice.id === row.invoice.id ? { ...invoice, status } : invoice
        )
      );
      return;
    }

    setDefaultInvoiceItems((current) =>
      current.map((invoice) =>
        invoice.id === row.invoice.id ? { ...invoice, status } : invoice
      )
    );
  }

  function closeExpenseModal() {
    setNewExpenseOpen(false);
    setExpenseDescription("");
    setExpenseCategory("Materials");
    setExpenseAmount("");
  }

  function addExpense() {
    if (!expenseDescription.trim()) return;

    const amount = Number(expenseAmount);
    if (Number.isNaN(amount) || amount <= 0) return;

    saveExpenses([
      ...expenseItems,
      {
        description: expenseDescription.trim(),
        category: expenseCategory,
        amount: formatCurrency(amount),
        workspaceId: activeWorkspace.id,
      },
    ]);

    closeExpenseModal();
  }

  const revenue = workspaceInvoices
    .filter((row) => getFinancialInvoiceStatus(row) === "Paid")
    .reduce((total, row) => total + getFinancialInvoiceTotal(row), 0);

  const outstanding = workspaceInvoices
    .filter((row) => getFinancialInvoiceStatus(row) !== "Paid")
    .reduce((total, row) => total + getFinancialInvoiceTotal(row), 0);

  const totalExpenses = workspaceExpenses.reduce(
    (total, expense) => total + moneyToNumber(expense.amount),
    0
  );

  const profit = revenue - totalExpenses;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Revenue"
          value={formatCurrency(revenue)}
          icon="$"
          iconClass="bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300"
          note="Paid invoices"
        />

        <SummaryCard
          title="Expenses"
          value={formatCurrency(totalExpenses)}
          icon="↘"
          iconClass="bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300"
        />

        <SummaryCard
          title="Outstanding"
          value={formatCurrency(outstanding)}
          icon="◷"
          iconClass="bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300"
        />

        <SummaryCard
          title="Profit"
          value={formatCurrency(profit)}
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
              <Link
                href="/invoices/new"
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
              >
                + Create Invoice
              </Link>

              <button
                type="button"
                onClick={removeSelectedInvoices}
                disabled={selectedInvoices.length === 0}
                className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          </div>

          <table className="min-w-[820px] w-full">
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
                workspaceInvoices.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-gray-200 text-base last:border-b-0 dark:border-gray-800 lg:text-lg"
                  >
                    <td className="px-4 py-5 text-center">
                      <input
                        type="checkbox"
                        checked={selectedInvoices.includes(row.id)}
                        onChange={() => toggleInvoice(row.id)}
                        className="h-4 w-4"
                      />
                    </td>

                    <td className="px-6 py-5 font-medium text-gray-950 dark:text-gray-100">
                      {row.source === "saved" ? (
                        <Link
                          href={`/invoices/${row.invoice.id}`}
                          className="text-blue-600 hover:underline dark:text-blue-400"
                        >
                          {getFinancialInvoiceNumber(row)}
                        </Link>
                      ) : (
                        getFinancialInvoiceNumber(row)
                      )}
                    </td>

                    <td className="px-6 py-5 text-gray-500 dark:text-gray-400">
                      {getFinancialInvoiceClient(row)}
                    </td>

                    <td className="px-6 py-5">
                      <select
                        value={getFinancialInvoiceStatus(row)}
                        onChange={(event) =>
                          updateInvoiceStatus(row, event.target.value as InvoiceStatus)
                        }
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                      >
                        {invoiceStatuses.map((status) => (
                          <option key={status}>{status}</option>
                        ))}
                      </select>
                    </td>

                    <td className="px-6 py-5 text-right font-medium text-gray-950 dark:text-gray-100">
                      {formatCurrency(getFinancialInvoiceTotal(row))}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-lg text-gray-500 dark:text-gray-400">
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
                    <tr key={expenseId} className="border-b border-gray-200 text-base last:border-b-0 dark:border-gray-800 lg:text-lg">
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
                  <td colSpan={4} className="px-6 py-12 text-center text-lg text-gray-500 dark:text-gray-400">
                    No expenses for {activeWorkspace.name}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {newExpenseOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-950 dark:text-gray-100">Add Expense</h2>
              <button onClick={closeExpenseModal} className="text-2xl text-gray-500">×</button>
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

@media print {
  aside,
  header,
  .print-hidden {
    display: none !important;
  }

  main {
    padding: 0 !important;
    overflow: visible !important;
  }

  body {
    background: white !important;
  }

  .invoice-print-page {
    
    margin: 0.7in auto 0 auto !important;
    padding: 0 !important;
    box-shadow: none !important;
    border: none !important;
    width: 100% !important;
    max-width: none !important;
  }
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

  const [inventoryItems, setInventoryItems] = useState<InventoryRow[]>(defaultInventory);
  const [jobItems, setJobItems] = useState(defaultJobs);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const [newItemOpen, setNewItemOpen] = useState(false);
  const [editTargetOpen, setEditTargetOpen] = useState(false);
  const [editingItemName, setEditingItemName] = useState("");
  const [editingCurrentQty, setEditingCurrentQty] = useState("");
  const [editingTargetQty, setEditingTargetQty] = useState("");

  const [itemName, setItemName] = useState("");
  const [currentQty, setCurrentQty] = useState("");
  const [targetQty, setTargetQty] = useState("");

  useEffect(() => {
    const savedJobs = localStorage.getItem("frontier-jobs");
    const savedInventory = localStorage.getItem("frontier-inventory");

    if (savedJobs) {
      try {
        setJobItems(JSON.parse(savedJobs));
      } catch {
        setJobItems(defaultJobs);
      }
    }

    if (savedInventory) {
      try {
        setInventoryItems(JSON.parse(savedInventory));
      } catch {
        setInventoryItems(defaultInventory);
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
        materials.findIndex((candidate) => candidate.name.toLowerCase() === normalizedName) === index
      );
    });

  const mergedInventory = [
    ...workspaceInventory,
    ...autoMaterialRows.filter(
      (material) =>
        !workspaceInventory.some(
          (item) => item.name.trim().toLowerCase() === material.name.trim().toLowerCase()
        )
    ),
  ];

  function saveInventory(updatedItems: InventoryRow[]) {
    const persistedItems = updatedItems.filter((item) => !item.autoGenerated);
    setInventoryItems(persistedItems);
    localStorage.setItem("frontier-inventory", JSON.stringify(persistedItems));
  }

  function getReservedForItem(itemName: string) {
    return activeMaterialJobs.flatMap((job) =>
      job.materials
        .filter((material) => material.name.trim().toLowerCase() === itemName.trim().toLowerCase())
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
    saveInventory(inventoryItems.filter((item) => !selectedItems.includes(item.name)));
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

    const newItem: InventoryRow = {
      name: itemName.trim(),
      currentQty: current,
      targetQty: target,
      warning: current < target,
      workspaceId: activeWorkspace.id,
    };

    saveInventory([...inventoryItems, newItem]);
    closeNewItemModal();
  }

  function openTargetEditor(item: InventoryRow) {
    setEditingItemName(item.name);
    setEditingCurrentQty(String(item.currentQty ?? 0));
    setEditingTargetQty(String(item.targetQty ?? 0));
    setEditTargetOpen(true);
  }

  function closeTargetEditor() {
    setEditTargetOpen(false);
    setEditingItemName("");
    setEditingCurrentQty("");
    setEditingTargetQty("");
  }

  function saveTargetEditor() {
    if (!editingItemName.trim()) return;

    const current = Number(editingCurrentQty);
    const target = Number(editingTargetQty);
    if (Number.isNaN(current) || Number.isNaN(target)) return;

    const existingItem = inventoryItems.find(
      (item) =>
        item.workspaceId === activeWorkspace.id &&
        item.name.trim().toLowerCase() === editingItemName.trim().toLowerCase()
    );

    const updatedItem: InventoryRow = {
      ...(existingItem ?? {
        name: editingItemName.trim(),
        workspaceId: activeWorkspace.id,
      }),
      currentQty: current,
      targetQty: target,
      warning: current < target,
      autoGenerated: false,
    };

    const updatedItems = existingItem
      ? inventoryItems.map((item) =>
          item.workspaceId === activeWorkspace.id &&
          item.name.trim().toLowerCase() === editingItemName.trim().toLowerCase()
            ? updatedItem
            : item
        )
      : [...inventoryItems, updatedItem];

    saveInventory(updatedItems);
    closeTargetEditor();
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setNewItemOpen(true)} className="rounded-lg bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700">
            + Add Item
          </button>
          <button type="button" onClick={removeSelectedItems} disabled={selectedItems.length === 0} className="rounded-lg bg-red-600 px-4 py-2 text-white shadow hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50">
            Remove Item
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
        Click a <strong>Target Qty</strong> value to update inventory thresholds.
      </div>

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
                const reservedQty = reservedJobs.reduce((total, reserved) => total + reserved.quantity, 0);
                const availableAfterJobs = item.currentQty === null ? null : item.currentQty - reservedQty;
                const suggestedOrder = item.targetQty === null || availableAfterJobs === null ? null : Math.max(item.targetQty - availableAfterJobs, 0);
                const warning = item.currentQty === null || item.targetQty === null || (availableAfterJobs !== null && availableAfterJobs < item.targetQty);

                return (
                  <tr key={`${item.workspaceId}-${item.name}`} className="border-b border-gray-200 text-base last:border-b-0 dark:border-gray-800 lg:text-lg">
                    <td className="px-4 py-5 text-center">
                      <input type="checkbox" checked={selectedItems.includes(item.name)} onChange={() => toggleItem(item.name)} disabled={item.autoGenerated} className="h-4 w-4 disabled:cursor-not-allowed disabled:opacity-40" />
                    </td>
                    <td className="px-6 py-5 font-medium text-gray-950 dark:text-gray-100">
                      <div className="flex items-center gap-3">
                        {warning && <span className="text-orange-500">⚠</span>}
                        <span>{item.name}</span>
                        {item.autoGenerated && <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">Job material</span>}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center text-gray-900 dark:text-gray-100">{item.currentQty ?? "—"}</td>
                    <td className="px-6 py-5 text-center text-blue-600 dark:text-blue-400">{reservedQty}</td>
                    <td className={`px-6 py-5 text-center ${warning ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>{availableAfterJobs ?? "—"}</td>
                    <td className="px-6 py-5 text-center">
                      <button type="button" onClick={() => openTargetEditor(item)} className="rounded px-2 py-1 text-blue-600 hover:bg-blue-50 hover:underline dark:text-blue-400 dark:hover:bg-blue-950/30">
                        {item.targetQty ?? "Set target"}
                      </button>
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-600 dark:text-gray-400">
                      {reservedJobs.length > 0 ? (
                        <div className="space-y-1">
                          {reservedJobs.map((reserved) => (
                            <div key={`${reserved.jobId}-${reserved.quantity}`}>{reserved.quantity} → {reserved.jobName} ({reserved.jobStatus})</div>
                          ))}
                        </div>
                      ) : "—"}
                    </td>
                    <td className={`px-6 py-5 text-right ${warning ? "text-orange-600 dark:text-orange-400" : "text-green-600 dark:text-green-400"}`}>{suggestedOrder ?? "—"}</td>
                  </tr>
                );
              })
            ) : (
              <tr><td colSpan={8} className="px-6 py-16 text-center text-xl text-gray-500 dark:text-gray-400">No inventory items or scheduled job materials for {activeWorkspace.name}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {(newItemOpen || editTargetOpen) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-950 dark:text-gray-100">{editTargetOpen ? `Edit ${editingItemName}` : "Add Inventory Item"}</h2>
              <button type="button" onClick={editTargetOpen ? closeTargetEditor : closeNewItemModal} className="text-2xl text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">×</button>
            </div>

            <div className="space-y-4">
              {!editTargetOpen && <input type="text" value={itemName} onChange={(event) => setItemName(event.target.value)} placeholder="Item Name" className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800" />}
              <input type="number" value={editTargetOpen ? editingCurrentQty : currentQty} onChange={(event) => editTargetOpen ? setEditingCurrentQty(event.target.value) : setCurrentQty(event.target.value)} placeholder="Current Quantity" className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800" />
              <input type="number" value={editTargetOpen ? editingTargetQty : targetQty} onChange={(event) => editTargetOpen ? setEditingTargetQty(event.target.value) : setTargetQty(event.target.value)} placeholder="Target Quantity" className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800" />
              <button type="button" onClick={editTargetOpen ? saveTargetEditor : addInventoryItem} className="w-full rounded-lg bg-blue-600 py-3 text-white hover:bg-blue-700">
                {editTargetOpen ? "Save Quantity Targets" : "Add Item"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

## app\invoices\[id]\page.tsx

```tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import {
  formatMoneyNumber,
  getInvoiceTotals,
  getInvoiceClientName,
  getLineTotal,
  InvoiceRow,
  loadSavedInvoices,
  moneyToNumber,
} from "@/lib/frontierInvoices";

const borderColor = "#9ca3af";
const headerBlue = "#dbeafe";
const amountColumnWidth = "144px";

export default function InvoiceDetailPage() {
  const params = useParams();
  const invoiceId = String(params.id);

  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setInvoices(loadSavedInvoices());
    setLoaded(true);
  }, []);

  const invoice = useMemo(() => {
    return invoices.find((item) => item.id === invoiceId);
  }, [invoices, invoiceId]);

  if (!loaded) {
    return <div className="text-gray-400">Loading invoice...</div>;
  }

  if (!invoice) {
    return (
      <div className="space-y-4 text-gray-950 dark:text-gray-100">
        <Link href="/invoices" className="text-blue-600 hover:underline dark:text-blue-400">
          ← Back to Invoices
        </Link>

        <h1 className="text-3xl font-bold">Invoice not found</h1>
      </div>
    );
  }

  const totals = getInvoiceTotals(invoice);
  const billToDisplay = getInvoiceClientName(invoice);

  const mailSubject = encodeURIComponent(`Invoice ${invoice.invoiceNumber}`);
  const mailBody = encodeURIComponent(
    `Hello,\n\nPlease see invoice ${invoice.invoiceNumber} for $${formatMoneyNumber(
      totals.total
    )}.\n\nPlease attach the saved PDF before sending.\n\nThank you.`
  );

  const gmailHref = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    invoice.billToEmail
  )}&su=${mailSubject}&body=${mailBody}`;

  const displayRows = [
    ...invoice.lineItems.map((item) => ({
      id: item.id,
      description:
        item.quantity > 1
          ? `${item.description} — ${item.quantity} × $${formatMoneyNumber(
              moneyToNumber(item.unitPrice)
            )}`
          : item.description,
      amount: formatMoneyNumber(getLineTotal(item)),
    })),
    ...(totals.discount > 0
      ? [
          {
            id: "discount",
            description:
              invoice.discountType === "Percent"
                ? `Discount (${invoice.discountValue}%)`
                : "Discount",
            amount: `(${formatMoneyNumber(totals.discount)})`,
          },
        ]
      : []),
    ...(totals.tax > 0
      ? [
          {
            id: "tax",
            description: `Tax (${invoice.taxRate}% after discount)`,
            amount: formatMoneyNumber(totals.tax),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6 text-gray-950 dark:text-gray-100">
      <div className="print-hidden flex flex-col gap-4 print:hidden sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/invoices" className="text-blue-600 hover:underline dark:text-blue-400">
            ← Back to Invoices
          </Link>

          <h1 className="mt-3 text-3xl font-bold">
            Invoice {invoice.invoiceNumber}
          </h1>

          {invoice.jobId && (
            <Link
              href={`/jobs/${invoice.jobId}`}
              className="mt-2 inline-block text-sm text-blue-600 hover:underline dark:text-blue-400"
            >
              Linked job: {invoice.jobName || invoice.jobId}
            </Link>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <a
            href={gmailHref}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
          >
            Send Email
          </a>

          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg border border-gray-300 px-4 py-2 font-semibold hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Print / Save PDF
          </button>
        </div>
      </div>

      <div className="invoice-print-page mx-auto max-w-4xl rounded-xl bg-white p-8 text-black shadow print:max-w-none print:rounded-none print:p-0 print:shadow-none">
        <div className="grid grid-cols-2 gap-8">
          <div className="text-sm leading-5">
            <p className="font-bold">{invoice.companyName}</p>
            <p>{invoice.companyAddress}</p>
            <p>
              {invoice.companyCity}, {invoice.companyState} {invoice.companyZip}
            </p>
            <p>{invoice.companyPhone}</p>
            <p>{invoice.companyEmail}</p>
          </div>

          <div className="text-center">
            <h2 className="text-4xl font-bold text-blue-500">INVOICE</h2>

            <div
              className="mt-4 grid text-sm"
              style={{
                gridTemplateColumns: "1fr 1fr",
                borderTop: `1px solid ${borderColor}`,
                borderLeft: `1px solid ${borderColor}`,
              }}
            >
              {["INVOICE #", "DATE", invoice.invoiceNumber, invoice.invoiceDate].map((value, index) => (
                <div
                  key={`${value}-${index}`}
                  className={`px-3 py-1 ${index < 2 ? "font-bold" : ""}`}
                  style={{
                    background: index < 2 ? headerBlue : undefined,
                    borderRight: `1px solid ${borderColor}`,
                    borderBottom: `1px solid ${borderColor}`,
                  }}
                >
                  {value}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 max-w-sm text-sm leading-5">
          <div
            className="px-2 py-1 font-bold"
            style={{ background: headerBlue, border: `1px solid ${borderColor}` }}
          >
            BILL TO
          </div>

          <div className="px-2 py-2">
            <p>{billToDisplay}</p>
            {invoice.billToAddress && <p>{invoice.billToAddress}</p>}
            {(invoice.billToCity || invoice.billToState || invoice.billToZip) && (
              <p>
                {invoice.billToCity}, {invoice.billToState} {invoice.billToZip}
              </p>
            )}
            {invoice.billToPhone && <p>{invoice.billToPhone}</p>}
            {invoice.billToEmail && <p>{invoice.billToEmail}</p>}
          </div>
        </div>

        <div className="mt-8 text-sm">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `1fr ${amountColumnWidth}`,
              borderTop: `1px solid ${borderColor}`,
              borderLeft: `1px solid ${borderColor}`,
              borderRight: `1px solid ${borderColor}`,
            }}
          >
            <div
              className="px-3 py-2 font-bold"
              style={{
                background: headerBlue,
                borderRight: `1px solid ${borderColor}`,
                borderBottom: `1px solid ${borderColor}`,
              }}
            >
              DESCRIPTION
            </div>

            <div
              className="px-3 py-2 text-right font-bold"
              style={{ background: headerBlue, borderBottom: `1px solid ${borderColor}` }}
            >
              AMOUNT
            </div>

            {displayRows.map((row) => (
              <div key={`${row.id}-description`} className="contents invoice-row">
                <div
                  className="px-3 py-1"
                  style={{ borderRight: `1px solid ${borderColor}` }}
                >
                  {row.description}
                </div>

                <div className="px-3 py-1 text-right">{row.amount}</div>
              </div>
            ))}

            {displayRows.length < 8 && (
              <>
                <div style={{ minHeight: "224px", borderRight: `1px solid ${borderColor}` }} />
                <div />
              </>
            )}

            <div
              className="px-3 py-3 text-center italic"
              style={{
                borderTop: `1px solid ${borderColor}`,
                borderRight: `1px solid ${borderColor}`,
                borderBottom: `1px solid ${borderColor}`,
              }}
            >
              {invoice.footerMessage || "Thank you for your business!"}
            </div>

            <div
              className="px-3 py-3"
              style={{
                borderTop: `1px solid ${borderColor}`,
                borderBottom: `1px solid ${borderColor}`,
              }}
            >
              <div className="flex justify-between gap-3 font-bold">
                <span>TOTAL</span>
                <span>${formatMoneyNumber(totals.total)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center text-sm">
          <p>
            {invoice.contactMessage ||
              "If you have any questions about this invoice, please contact us."}
          </p>
          <p>
            {invoice.companyPhone}
            {invoice.companyPhone && invoice.companyEmail ? ", " : ""}
            {invoice.companyEmail}
          </p>
        </div>
      </div>
    </div>
  );
}
```

## app\invoices\new\page.tsx

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { useWorkspace } from "@/components/WorkspaceContext";
import { clients as defaultClients } from "@/lib/clients";
import { jobs as defaultJobs, Job } from "@/lib/jobs";
import { ClientRow, loadClients } from "@/lib/frontierClients";
import { InvoiceSetupDraft, loadSavedInvoices } from "@/lib/frontierInvoices";

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function getNextInvoiceNumber() {
  const savedInvoices = loadSavedInvoices();
  const nextNumber = savedInvoices.length + 1;

  return `INV-${String(nextNumber).padStart(3, "0")}`;
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;

  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const startingJobId = searchParams.get("jobId") || "";
  const { activeWorkspace } = useWorkspace();

  const [clientItems, setClientItems] = useState<ClientRow[]>(defaultClients);
  const [jobItems, setJobItems] = useState<Job[]>(defaultJobs);
  const [selectedClientId, setSelectedClientId] = useState("new");
  const [selectedJobId, setSelectedJobId] = useState("");
  const [autoLoadedJobId, setAutoLoadedJobId] = useState("");

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(getTodayDate());

  const [billToName, setBillToName] = useState("");
  const [billToCompany, setBillToCompany] = useState("");
  const [billToAddress, setBillToAddress] = useState("");
  const [billToCity, setBillToCity] = useState("");
  const [billToState, setBillToState] = useState("");
  const [billToZip, setBillToZip] = useState("");
  const [billToPhone, setBillToPhone] = useState("");
  const [billToEmail, setBillToEmail] = useState("");

  const [footerMessage, setFooterMessage] = useState(
    "Thank you for your business!"
  );
  const [contactMessage, setContactMessage] = useState(
    "Please contact us with any questions about this invoice."
  );

  useEffect(() => {
    setClientItems(loadClients());

    const savedJobs = localStorage.getItem("frontier-jobs");

    if (savedJobs) {
      try {
        setJobItems(JSON.parse(savedJobs));
      } catch {
        setJobItems(defaultJobs);
      }
    }
  }, []);

  const workspaceClients = clientItems.filter(
    (client) => client.workspaceId === activeWorkspace.id
  );

  const activeWorkspaceClients = workspaceClients.filter(
    (client) => client.status === "Active"
  );

  const workspaceJobs = jobItems
    .filter((job) => job.workspaceId === activeWorkspace.id)
    .sort((a, b) => a.name.localeCompare(b.name));

  const companyPlaceholder = {
    companyName: `${activeWorkspace.name} Company`,
    companyAddress: "123 Business Street",
    companyCity: "Rochester Hills",
    companyState: "MI",
    companyZip: "48307",
    companyPhone: "(555) 123-4567",
    companyEmail: "billing@example.com",
  };

  function clearBillToForm() {
    setSelectedClientId("new");
    setBillToName("");
    setBillToCompany("");
    setBillToAddress("");
    setBillToCity("");
    setBillToState("");
    setBillToZip("");
    setBillToPhone("");
    setBillToEmail("");
  }

  function populateBillToFromClient(clientId: string) {
    if (clientId === "new") {
      clearBillToForm();
      return;
    }

    const selectedClient = workspaceClients.find(
      (client) => client.id === clientId
    );

    if (!selectedClient) return;

    setSelectedClientId(clientId);
    setBillToName(selectedClient.name ?? "");
    setBillToCompany("");
    setBillToAddress(selectedClient.address ?? "");
    setBillToCity(selectedClient.city ?? "");
    setBillToState((selectedClient.state ?? "").toUpperCase());
    setBillToZip(selectedClient.zip ?? "");
    setBillToPhone(formatPhone(selectedClient.phone ?? ""));
    setBillToEmail(selectedClient.email ?? "");
  }

  function populateFromJob(jobId: string) {
    if (!jobId) {
      setSelectedJobId("");
      return;
    }

    const selectedJob = workspaceJobs.find((job) => job.id === jobId);

    if (!selectedJob) return;

    setSelectedJobId(selectedJob.id);

    const matchedClient = workspaceClients.find(
      (client) =>
        client.name.trim().toLowerCase() ===
        selectedJob.client.trim().toLowerCase()
    );

    if (matchedClient) {
      populateBillToFromClient(matchedClient.id);
    } else {
      setSelectedClientId("new");
      setBillToName(selectedJob.client);
    }
  }

  useEffect(() => {
    if (!startingJobId || autoLoadedJobId === startingJobId) return;
    if (workspaceJobs.length === 0) return;

    populateFromJob(startingJobId);
    setAutoLoadedJobId(startingJobId);
  }, [startingJobId, autoLoadedJobId, workspaceJobs]);

  function markManualBillToEdit() {
    setSelectedClientId("new");
  }

  function continueToBuilder() {
    const resolvedInvoiceNumber = invoiceNumber.trim() || getNextInvoiceNumber();
    const attachedJob = workspaceJobs.find((job) => job.id === selectedJobId);

    if (!invoiceDate.trim()) return;
    if (!billToName.trim() && !billToCompany.trim()) return;

    const draft: InvoiceSetupDraft = {
      id: crypto.randomUUID(),
      workspaceId: activeWorkspace.id,
      invoiceNumber: resolvedInvoiceNumber,
      invoiceDate,

      jobId: attachedJob?.id,
      jobName: attachedJob?.name,
      sourceClientId: selectedClientId !== "new" ? selectedClientId : undefined,

      ...companyPlaceholder,

      billToName: billToName.trim(),
      billToCompany: billToCompany.trim(),
      billToAddress: billToAddress.trim(),
      billToCity: billToCity.trim(),
      billToState: billToState.trim().toUpperCase(),
      billToZip: billToZip.trim(),
      billToPhone: billToPhone.trim(),
      billToEmail: billToEmail.trim(),

      footerMessage: footerMessage.trim(),
      contactMessage: contactMessage.trim(),
    };

    localStorage.setItem("frontier-invoice-draft", JSON.stringify(draft));
    router.push("/invoices/new/build");
  }

  const inputClass =
    "rounded-lg border border-gray-300 p-3 text-sm dark:border-gray-700 dark:bg-gray-800";
  const labelClass = "mb-2 block text-sm font-medium";

  return (
    <div className="space-y-6 text-gray-950 dark:text-gray-100">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">New Invoice</h1>

          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Step 1: setup invoice details for {activeWorkspace.name}
          </p>
        </div>

        <Link
          href="/invoices"
          className="w-fit rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          Back to Invoices
        </Link>
      </div>

      <div className="rounded-xl bg-white p-4 shadow dark:bg-gray-900 sm:p-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr_180px]">
          <div>
            <label className={labelClass}>Attach to Job</label>
            <select
              value={selectedJobId}
              onChange={(event) => populateFromJob(event.target.value)}
              className={`${inputClass} w-full bg-white`}
            >
              <option value="">No attached job</option>
              {workspaceJobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.name} — {job.client}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Invoice #</label>
            <input
              value={invoiceNumber}
              onChange={(event) => setInvoiceNumber(event.target.value)}
              placeholder="Leave blank for auto-number"
              className={`${inputClass} w-full`}
            />
          </div>

          <div>
            <label className={labelClass}>Invoice Date</label>
            <input
              type="date"
              value={invoiceDate}
              onChange={(event) => setInvoiceDate(event.target.value)}
              className={`${inputClass} w-full`}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-xl bg-white p-4 shadow dark:bg-gray-900 sm:p-6">
          <h2 className="text-xl font-bold">From</h2>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Placeholder until company settings are connected.
          </p>

          <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm dark:border-gray-800 dark:bg-gray-800">
            <p className="font-semibold">{companyPlaceholder.companyName}</p>
            <p>{companyPlaceholder.companyAddress}</p>
            <p>
              {companyPlaceholder.companyCity},{" "}
              {companyPlaceholder.companyState} {companyPlaceholder.companyZip}
            </p>
            <p className="mt-2">{companyPlaceholder.companyPhone}</p>
            <p>{companyPlaceholder.companyEmail}</p>
          </div>
        </section>

        <section className="rounded-xl bg-white p-4 shadow dark:bg-gray-900 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold">Bill To</h2>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Active clients show in the dropdown. Manually typed matching leads are promoted to Active when saved.
              </p>
            </div>

            <select
              value={selectedClientId}
              onChange={(event) => populateBillToFromClient(event.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <option value="new">New Client</option>

              {activeWorkspaceClients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input
                value={billToName}
                onChange={(event) => {
                  markManualBillToEdit();
                  setBillToName(event.target.value);
                }}
                placeholder="Name"
                className={inputClass}
              />

              <input
                value={billToCompany}
                onChange={(event) => {
                  markManualBillToEdit();
                  setBillToCompany(event.target.value);
                }}
                placeholder="Company Name"
                className={inputClass}
              />
            </div>

            <input
              value={billToAddress}
              onChange={(event) => {
                markManualBillToEdit();
                setBillToAddress(event.target.value);
              }}
              placeholder="Street Address"
              className={`${inputClass} w-full`}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_120px_160px]">
              <input
                value={billToCity}
                onChange={(event) => {
                  markManualBillToEdit();
                  setBillToCity(event.target.value);
                }}
                placeholder="City"
                className={inputClass}
              />

              <input
                value={billToState}
                onChange={(event) => {
                  markManualBillToEdit();
                  setBillToState(event.target.value.toUpperCase());
                }}
                placeholder="State"
                maxLength={2}
                className={inputClass}
              />

              <input
                value={billToZip}
                onChange={(event) => {
                  markManualBillToEdit();
                  setBillToZip(event.target.value);
                }}
                placeholder="ZIP"
                inputMode="numeric"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[220px_1fr]">
              <input
                type="tel"
                inputMode="tel"
                value={billToPhone}
                onChange={(event) => {
                  markManualBillToEdit();
                  setBillToPhone(formatPhone(event.target.value));
                }}
                placeholder="Phone"
                className={inputClass}
              />

              <input
                type="email"
                value={billToEmail}
                onChange={(event) => {
                  markManualBillToEdit();
                  setBillToEmail(event.target.value);
                }}
                placeholder="Email"
                className={inputClass}
              />
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-xl bg-white p-4 shadow dark:bg-gray-900 sm:p-6">
        <h2 className="text-xl font-bold">Messages</h2>

        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div>
            <label className={labelClass}>Footer Message</label>
            <input
              value={footerMessage}
              onChange={(event) => setFooterMessage(event.target.value)}
              placeholder="Thank you message"
              className={`${inputClass} w-full`}
            />
          </div>

          <div>
            <label className={labelClass}>Contact Message</label>
            <input
              value={contactMessage}
              onChange={(event) => setContactMessage(event.target.value)}
              placeholder="Contact message"
              className={`${inputClass} w-full`}
            />
          </div>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/invoices"
          className="rounded-lg border border-gray-300 px-5 py-3 text-center hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          Cancel
        </Link>

        <button
          type="button"
          onClick={continueToBuilder}
          className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Continue to Itemization
        </button>
      </div>
    </div>
  );
}
```

## app\invoices\page.tsx

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { useWorkspace } from "@/components/WorkspaceContext";
import {
  formatCurrency,
  getInvoiceClientName,
  getInvoiceTotals,
  InvoiceRow,
  invoiceStatuses,
  InvoiceStatus,
  loadSavedInvoices,
  saveSavedInvoices,
} from "@/lib/frontierInvoices";

export default function InvoicesPage() {
  const { activeWorkspace } = useWorkspace();

  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    setInvoices(loadSavedInvoices());
  }, []);

  const workspaceInvoices = invoices.filter(
    (invoice) => invoice.workspaceId === activeWorkspace.id
  );

  const totalOutstanding = workspaceInvoices
    .filter((invoice) => invoice.status !== "Paid")
    .reduce((total, invoice) => total + getInvoiceTotals(invoice).total, 0);

  function saveInvoices(updatedInvoices: InvoiceRow[]) {
    setInvoices(updatedInvoices);
    saveSavedInvoices(updatedInvoices);
  }

  function toggleInvoice(id: string) {
    setSelectedInvoices((current) =>
      current.includes(id)
        ? current.filter((invoiceId) => invoiceId !== id)
        : [...current, id]
    );
  }

  function openDeleteModal() {
    if (selectedInvoices.length === 0) return;
    setShowDeleteModal(true);
  }

  function removeSelectedInvoices() {
    saveInvoices(
      invoices.filter((invoice) => !selectedInvoices.includes(invoice.id))
    );

    setSelectedInvoices([]);
    setShowDeleteModal(false);
  }

  function updateInvoiceStatus(id: string, nextStatus: InvoiceStatus) {
    saveInvoices(
      invoices.map((invoice) =>
        invoice.id === id ? { ...invoice, status: nextStatus } : invoice
      )
    );
  }

  return (
    <div className="space-y-6 text-gray-950 dark:text-gray-100">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Create and manage invoices for {activeWorkspace.name}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/invoices/new"
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            + Add Invoice
          </Link>

          <button
            type="button"
            onClick={openDeleteModal}
            disabled={selectedInvoices.length === 0}
            className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Remove Invoice
          </button>
        </div>
      </div>

      {selectedInvoices.length > 0 && (
        <div className="rounded-lg bg-gray-900 p-4 text-white">
          {selectedInvoices.length} invoice
          {selectedInvoices.length === 1 ? "" : "s"} selected
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-white p-4 shadow dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Invoices</p>
          <p className="mt-1 text-2xl font-bold">{workspaceInvoices.length}</p>
        </div>

        <div className="rounded-xl bg-white p-4 shadow dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">Outstanding</p>
          <p className="mt-1 text-2xl font-bold">
            {formatCurrency(totalOutstanding)}
          </p>
        </div>

        <div className="rounded-xl bg-white p-4 shadow dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">Workspace</p>
          <p className="mt-1 truncate text-2xl font-bold">
            {activeWorkspace.name}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg bg-white shadow dark:bg-gray-900">
        <table className="w-full min-w-[1000px]">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr className="text-left text-gray-700 dark:text-gray-300">
              <th className="w-12 p-4"></th>
              <th className="p-4">Invoice #</th>
              <th className="p-4">Date</th>
              <th className="p-4">Bill To</th>
              <th className="p-4">Job</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Total</th>
            </tr>
          </thead>

          <tbody>
            {workspaceInvoices.length > 0 ? (
              workspaceInvoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedInvoices.includes(invoice.id)}
                      onChange={() => toggleInvoice(invoice.id)}
                      className="h-4 w-4"
                    />
                  </td>

                  <td className="p-4 font-medium">
                    <Link
                      href={`/invoices/${invoice.id}`}
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {invoice.invoiceNumber}
                    </Link>
                  </td>

                  <td className="p-4">{invoice.invoiceDate}</td>
                  <td className="p-4">{getInvoiceClientName(invoice)}</td>

                  <td className="p-4">
                    {invoice.jobId ? (
                      <Link
                        href={`/jobs/${invoice.jobId}`}
                        className="text-blue-600 hover:underline dark:text-blue-400"
                      >
                        {invoice.jobName || "Open Job"}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>

                  <td className="p-4">
                    <select
                      value={invoice.status}
                      onChange={(event) =>
                        updateInvoiceStatus(
                          invoice.id,
                          event.target.value as InvoiceStatus
                        )
                      }
                      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                    >
                      {invoiceStatuses.map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                  </td>

                  <td className="p-4 text-right font-medium">
                    {formatCurrency(getInvoiceTotals(invoice).total)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="p-10 text-center text-lg text-gray-500 dark:text-gray-400"
                >
                  No invoices found for {activeWorkspace.name}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Remove Invoice(s)
            </h2>

            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Are you sure you want to remove the selected invoice(s)?
            </p>

            <div className="mt-4 rounded-lg bg-gray-100 p-3 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              {selectedInvoices.length} invoice
              {selectedInvoices.length === 1 ? "" : "s"} selected
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={removeSelectedInvoices}
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

## app\jobs\[id]\page.tsx

```tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import { jobs as defaultJobs, Job, JobMaterial, JobStatus } from "@/lib/jobs";
import {
  formatCurrency,
  getInvoiceTotals,
  InvoiceRow,
  loadSavedInvoices,
} from "@/lib/frontierInvoices";

const jobStatuses: JobStatus[] = ["Lead", "Quoted", "Scheduled", "Completed", "Paid"];

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

  const [jobItems, setJobItems] = useState<Job[]>(defaultJobs);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const [editName, setEditName] = useState("");
  const [editClient, setEditClient] = useState("");
  const [editStatus, setEditStatus] = useState<JobStatus>("Lead");
  const [editDate, setEditDate] = useState("");
  const [editValue, setEditValue] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const [editMaterials, setEditMaterials] = useState<JobMaterial[]>([]);
  const [editMaterialName, setEditMaterialName] = useState("");
  const [editMaterialQuantity, setEditMaterialQuantity] = useState("");

  useEffect(() => {
    const savedJobs = localStorage.getItem("frontier-jobs");

    if (savedJobs) {
      try {
        setJobItems(JSON.parse(savedJobs));
      } catch {
        setJobItems(defaultJobs);
      }
    }

    setInvoiceItems(loadSavedInvoices());
    setLoaded(true);
  }, []);

  const job = jobItems.find((item) => item.id === id);
  const jobInvoices = invoiceItems.filter((invoice) => invoice.jobId === id);
  const invoiceTotal = jobInvoices.reduce(
    (total, invoice) => total + getInvoiceTotals(invoice).total,
    0
  );

  function openEditBox() {
    if (!job) return;

    setEditName(job.name);
    setEditClient(job.client);
    setEditStatus(job.status);
    setEditDate(job.date);
    setEditValue(job.value.replace("$", "").replace(",", ""));
    setEditNotes(job.notes ?? "");
    setEditMaterials(job.materials ?? []);
    setEditMaterialName("");
    setEditMaterialQuantity("");
    setEditOpen(true);
  }

  function closeEditBox() {
    setEditOpen(false);
    setEditMaterialName("");
    setEditMaterialQuantity("");
  }

  function addEditMaterial() {
    if (!editMaterialName.trim()) return;

    const quantity = Number(editMaterialQuantity);
    if (Number.isNaN(quantity) || quantity <= 0) return;

    setEditMaterials((current) => [...current, { name: editMaterialName.trim(), quantity }]);
    setEditMaterialName("");
    setEditMaterialQuantity("");
  }

  function removeEditMaterial(indexToRemove: number) {
    setEditMaterials((current) => current.filter((_, index) => index !== indexToRemove));
  }

  function saveEditedJob() {
    if (!job) return;
    if (!editName.trim() || !editClient.trim()) return;

    const formattedValue = editValue.trim()
      ? editValue.trim().startsWith("$")
        ? editValue.trim()
        : `$${editValue.trim()}`
      : "$0";

    const updatedJobs = jobItems.map((item) =>
      item.id === job.id
        ? {
            ...item,
            name: editName.trim(),
            client: editClient.trim(),
            status: editStatus,
            date: editDate,
            value: formattedValue,
            notes: editNotes,
            materials: editMaterials,
          }
        : item
    );

    setJobItems(updatedJobs);
    localStorage.setItem("frontier-jobs", JSON.stringify(updatedJobs));
    setEditOpen(false);
  }

  if (!loaded) return null;

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{job.name}</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">{job.client}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/invoices/new?jobId=${job.id}`}
            className="rounded-lg border border-blue-600 px-5 py-3 font-semibold text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30"
          >
            Create Invoice
          </Link>

          <button
            type="button"
            onClick={openEditBox}
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Edit Job
          </button>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-900">
        <h2 className="mb-4 text-xl font-semibold">Job Information</h2>
        <div className="space-y-3">
          <p><strong>Client:</strong> {job.client}</p>
          <div className="flex items-center gap-2">
            <strong>Status:</strong>
            <span className={`rounded-full px-3 py-1 text-sm font-semibold ${getStatusClasses(job.status)}`}>{job.status}</span>
          </div>
          <p><strong>Scheduled Date:</strong> {job.date || "—"}</p>
          <p><strong>Estimated Value:</strong> {job.value}</p>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-900">
        <h2 className="mb-4 text-xl font-semibold">Materials</h2>
        {job.materials && job.materials.length > 0 ? (
          <ul className="ml-6 list-disc">
            {job.materials.map((material, index) => (
              <li key={`${material.name}-${index}`}>{material.quantity} × {material.name}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No materials added.</p>
        )}
      </div>

      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-900">
        <h2 className="mb-4 text-xl font-semibold">Notes</h2>
        <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
          {job.notes || "No notes added."}
        </p>
      </div>

      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-900">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold">Invoices</h2>
          <Link href={`/invoices/new?jobId=${job.id}`} className="text-blue-600 hover:underline dark:text-blue-400">
            + Create invoice for this job
          </Link>
        </div>

        {jobInvoices.length > 0 ? (
          <div className="space-y-3">
            {jobInvoices.map((invoice) => (
              <div key={invoice.id} className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <Link href={`/invoices/${invoice.id}`} className="font-semibold text-blue-600 hover:underline dark:text-blue-400">
                      {invoice.invoiceNumber}
                    </Link>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {invoice.status} · {invoice.invoiceDate}
                    </p>
                  </div>
                  <div className="text-lg font-bold">
                    {formatCurrency(getInvoiceTotals(invoice).total)}
                  </div>
                </div>
              </div>
            ))}

            <div className="border-t border-gray-200 pt-3 text-right text-lg font-bold dark:border-gray-800">
              Invoice Total: {formatCurrency(invoiceTotal)}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No invoices attached to this job.</p>
        )}
      </div>

      {editOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-950 dark:text-gray-100">Edit Job</h2>
              <button type="button" onClick={closeEditBox} className="text-2xl text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">×</button>
            </div>

            <div className="space-y-4">
              <input type="text" value={editName} onChange={(event) => setEditName(event.target.value)} placeholder="Job Name" className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800" />
              <input type="text" value={editClient} onChange={(event) => setEditClient(event.target.value)} placeholder="Client" className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800" />
              <select value={editStatus} onChange={(event) => setEditStatus(event.target.value as JobStatus)} className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
                {jobStatuses.map((statusItem) => <option key={statusItem}>{statusItem}</option>)}
              </select>
              <input type="date" value={editDate} onChange={(event) => setEditDate(event.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800" />
              <input type="number" value={editValue} onChange={(event) => setEditValue(event.target.value)} placeholder="Estimated Value" className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800" />

              <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-950 dark:text-gray-100">Materials</h3>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_140px_auto]">
                  <input type="text" value={editMaterialName} onChange={(event) => setEditMaterialName(event.target.value)} placeholder="Material name" className="rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800" />
                  <input type="number" value={editMaterialQuantity} onChange={(event) => setEditMaterialQuantity(event.target.value)} placeholder="Qty" className="rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800" />
                  <button type="button" onClick={addEditMaterial} className="rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700">Add</button>
                </div>

                <div className="mt-4 space-y-2">
                  {editMaterials.length > 0 ? (
                    editMaterials.map((material, index) => (
                      <div key={`${material.name}-${index}`} className="flex items-center justify-between rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
                        <span>{material.quantity} × {material.name}</span>
                        <button type="button" onClick={() => removeEditMaterial(index)} className="text-sm text-red-600 hover:underline dark:text-red-400">Remove</button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No materials added.</p>
                  )}
                </div>
              </div>

              <textarea rows={4} value={editNotes} onChange={(event) => setEditNotes(event.target.value)} placeholder="Notes" className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800" />

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button type="button" onClick={closeEditBox} className="rounded-lg border border-gray-300 px-5 py-3 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800">Cancel</button>
                <button type="button" onClick={saveEditedJob} className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
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
import { jobs as defaultJobs, Job, JobMaterial, JobStatus } from "@/lib/jobs";
import { clients as defaultClients } from "@/lib/clients";
import { ClientRow } from "@/lib/frontierClients";
import {
  formatCurrency,
  getInvoiceTotals,
  InvoiceRow,
  loadSavedInvoices,
} from "@/lib/frontierInvoices";

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

  const [jobItems, setJobItems] = useState<Job[]>(defaultJobs);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceRow[]>([]);
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [newJobOpen, setNewJobOpen] = useState(false);

  const [client, setClient] = useState("");
  const [jobName, setJobName] = useState("");
  const [status, setStatus] = useState<JobStatus>("Lead");
  const [value, setValue] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [clientItems, setClientItems] = useState<ClientRow[]>(defaultClients);
  const [materialName, setMaterialName] = useState("");
  const [materialQuantity, setMaterialQuantity] = useState("");
  const [materials, setMaterials] = useState<JobMaterial[]>([]);

  useEffect(() => {
    const savedJobs = localStorage.getItem("frontier-jobs");
    const savedClients = localStorage.getItem("frontier-clients");

    if (savedJobs) {
      try {
        setJobItems(JSON.parse(savedJobs));
      } catch {
        setJobItems(defaultJobs);
      }
    }

    if (savedClients) {
      try {
        setClientItems(JSON.parse(savedClients));
      } catch {
        setClientItems(defaultClients);
      }
    }

    setInvoiceItems(loadSavedInvoices());
  }, []);

  const workspaceClients = clientItems.filter(
    (clientItem) => clientItem.workspaceId === activeWorkspace.id
  );

  const workspaceJobs = jobItems.filter(
    (job) => job.workspaceId === activeWorkspace.id
  );

  const allWorkspaceJobsSelected =
    workspaceJobs.length > 0 &&
    workspaceJobs.every((job) => selectedJobs.includes(job.id));

  function getClientByName(clientName: string) {
    return workspaceClients.find(
      (clientItem) =>
        clientItem.name.trim().toLowerCase() === clientName.trim().toLowerCase()
    );
  }

  function getInvoicesForJob(jobId: string) {
    return invoiceItems.filter((invoice) => invoice.jobId === jobId);
  }

  function getInvoiceTotalForJob(jobId: string) {
    return getInvoicesForJob(jobId).reduce(
      (total, invoice) => total + getInvoiceTotals(invoice).total,
      0
    );
  }

  function saveJobs(updatedJobs: Job[]) {
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
        current.filter((jobId) => !workspaceJobs.some((job) => job.id === jobId))
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
    saveJobs(jobItems.filter((job) => !selectedJobs.includes(job.id)));
    setSelectedJobs([]);
  }

  function addMaterial() {
    if (!materialName.trim()) return;

    const quantity = Number(materialQuantity);
    if (Number.isNaN(quantity) || quantity <= 0) return;

    setMaterials((current) => [...current, { name: materialName.trim(), quantity }]);
    setMaterialName("");
    setMaterialQuantity("");
  }

  function removeMaterial(indexToRemove: number) {
    setMaterials((current) => current.filter((_, index) => index !== indexToRemove));
  }

  function createJob(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!client.trim() || !jobName.trim()) return;

    const formattedValue = value.trim()
      ? value.trim().startsWith("$")
        ? value.trim()
        : `$${value.trim()}`
      : "$0";

    const newJob: Job = {
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
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setNewJobOpen(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            + Add New Job
          </button>

          <button
            type="button"
            onClick={deleteSelectedJobs}
            disabled={selectedJobs.length === 0}
            className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
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
            <button type="button" onClick={closeNewJobBox} className="text-2xl text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">×</button>
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
                {workspaceClients.map((clientItem) => (
                  <option key={clientItem.id} value={clientItem.name}>
                    {clientItem.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Job Name</label>
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
                onChange={(event) => setStatus(event.target.value as JobStatus)}
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
              <label className="mb-2 block text-sm font-medium">Scheduled Date</label>
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Estimated Value</label>
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
                  onChange={(event) => setMaterialQuantity(event.target.value)}
                  placeholder="Quantity"
                  className="rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800"
                />
                <button type="button" onClick={addMaterial} className="rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700">
                  Add Material
                </button>
              </div>

              <div className="mt-4 space-y-2">
                {materials.length > 0 ? (
                  materials.map((material, index) => (
                    <div key={`${material.name}-${index}`} className="flex items-center justify-between rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
                      <span>{material.quantity} × {material.name}</span>
                      <button type="button" onClick={() => removeMaterial(index)} className="text-sm text-red-600 hover:underline dark:text-red-400">Remove</button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No materials added yet.</p>
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
              <button type="submit" className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700">Create Job</button>
              <button type="button" onClick={closeNewJobBox} className="rounded-lg bg-red-600 px-6 py-3 text-white hover:bg-red-700">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg bg-white shadow dark:bg-gray-900">
        <table className="min-w-[980px] w-full">
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
              <th className="p-4 text-right">Invoice</th>
            </tr>
          </thead>

          <tbody>
            {workspaceJobs.length > 0 ? (
              workspaceJobs.map((job) => {
                const matchedClient = getClientByName(job.client);
                const jobInvoices = getInvoicesForJob(job.id);
                const invoiceTotal = getInvoiceTotalForJob(job.id);
                const firstInvoice = jobInvoices[0];

                return (
                  <tr key={job.id} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedJobs.includes(job.id)}
                        onChange={() => toggleJob(job.id)}
                        className="h-4 w-4"
                      />
                    </td>

                    <td className="p-4 font-medium">
                      <Link href={`/jobs/${job.id}`} className="text-blue-600 hover:underline dark:text-blue-400">
                        {job.name}
                      </Link>
                    </td>

                    <td className="p-4">
                      {matchedClient ? (
                        <Link href={`/clients/${matchedClient.id}`} className="text-blue-600 hover:underline dark:text-blue-400">
                          {job.client}
                        </Link>
                      ) : (
                        <span>{job.client}</span>
                      )}
                    </td>

                    <td className="p-4">
                      <span className={`rounded px-3 py-1 text-xs font-medium text-white ${getStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                    </td>

                    <td className="p-4">{job.date || "—"}</td>
                    <td className="p-4 text-right font-medium">{job.value}</td>
                    <td className="p-4 text-right">
                      {firstInvoice ? (
                        <div>
                          <Link href={`/invoices/${firstInvoice.id}`} className="font-medium text-blue-600 hover:underline dark:text-blue-400">
                            {firstInvoice.invoiceNumber}
                          </Link>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {jobInvoices.length > 1 ? `${jobInvoices.length} invoices · ` : ""}
                            {formatCurrency(invoiceTotal)}
                          </div>
                        </div>
                      ) : (
                        <Link href={`/invoices/new?jobId=${job.id}`} className="text-sm text-blue-600 hover:underline dark:text-blue-400">
                          Create
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="p-10 text-center text-lg text-gray-500 dark:text-gray-400">
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

import { useEffect, useState } from "react";
import { useWorkspace } from "@/components/WorkspaceContext";

type SettingsTab =
  | "business"
  | "invoice"
  | "tax"
  | "workspace"
  | "permissions";

type WorkspaceSettings = {
  workspaceId: string;

  companyName: string;
  companyAddress: string;
  companyCity: string;
  companyState: string;
  companyZip: string;
  companyPhone: string;
  companyEmail: string;
  companyWebsite: string;

  defaultInvoiceTerms: string;
  defaultFooterMessage: string;
  defaultContactMessage: string;
  defaultInvoiceStatus: "Draft" | "Sent";

  taxState: string;
  defaultTaxRate: string;
  taxLocationMode: "Business location" | "Job location";
  discountBeforeTax: boolean;

  workspaceNickname: string;
  businessType: string;
  notes: string;
};

const businessTypes = [
  "Landscaping",
  "Tree Service",
  "Lawn Care",
  "Snow Removal",
  "Property Management",
  "Construction",
  "Auto Repair",
  "IT Services",
  "Plumbing",
  "Electrical",
  "Cleaning",
  "Restaurant",
  "Property Maintenance",
  "Other",
];

const roles = [
  {
    name: "Owner",
    color: "text-purple-600",
    description:
      "Full access. Can manage settings, billing, team members, clients, invoices, jobs, inventory, and documents.",
  },
  {
    name: "Manager",
    color: "text-blue-600",
    description:
      "Can manage daily operations, clients, jobs, invoices, calendar, inventory, logistics, and documents.",
  },
  {
    name: "Employee",
    color: "text-gray-700 dark:text-gray-300",
    description:
      "Can view assigned jobs, update job notes, view calendar, and access limited client/job information.",
  },
];

function getDefaultSettings(workspaceId: string, workspaceName: string): WorkspaceSettings {
  return {
    workspaceId,

    companyName: `${workspaceName} Company`,
    companyAddress: "123 Business Street",
    companyCity: "Rochester Hills",
    companyState: "MI",
    companyZip: "48307",
    companyPhone: "(555) 123-4567",
    companyEmail: "billing@example.com",
    companyWebsite: "",

    defaultInvoiceTerms: "Due upon receipt",
    defaultFooterMessage: "Thank you for your business!",
    defaultContactMessage: "Please contact us with any questions about this invoice.",
    defaultInvoiceStatus: "Draft",

    taxState: "MI",
    defaultTaxRate: "6",
    taxLocationMode: "Business location",
    discountBeforeTax: true,

    workspaceNickname: workspaceName,
    businessType: workspaceName,
    notes: "",
  };
}

function loadAllSettings() {
  if (typeof window === "undefined") return [];

  const saved = localStorage.getItem("frontier-settings");

  if (!saved) return [];

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAllSettings(settings: WorkspaceSettings[]) {
  localStorage.setItem("frontier-settings", JSON.stringify(settings));
}

export default function SettingsPage() {
  const { activeWorkspace } = useWorkspace();

  const [tab, setTab] = useState<SettingsTab>("business");
  const [allSettings, setAllSettings] = useState<WorkspaceSettings[]>([]);
  const [settings, setSettings] = useState<WorkspaceSettings>(
    getDefaultSettings(activeWorkspace.id, activeWorkspace.name)
  );

  const [savedNotice, setSavedNotice] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Employee");

  useEffect(() => {
    const loadedSettings = loadAllSettings();
    const currentSettings =
      loadedSettings.find((item) => item.workspaceId === activeWorkspace.id) ??
      getDefaultSettings(activeWorkspace.id, activeWorkspace.name);

    setAllSettings(loadedSettings);
    setSettings(currentSettings);
    setSavedNotice("");
  }, [activeWorkspace.id, activeWorkspace.name]);

  function updateSetting<K extends keyof WorkspaceSettings>(
    key: K,
    value: WorkspaceSettings[K]
  ) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function saveSettings() {
    const withoutCurrentWorkspace = allSettings.filter(
      (item) => item.workspaceId !== activeWorkspace.id
    );

    const updatedSettings = [...withoutCurrentWorkspace, settings];

    setAllSettings(updatedSettings);
    saveAllSettings(updatedSettings);

    setSavedNotice("Settings saved.");
    window.setTimeout(() => setSavedNotice(""), 2500);
  }

  function resetWorkspaceSettings() {
    const resetSettings = getDefaultSettings(activeWorkspace.id, activeWorkspace.name);
    const updatedSettings = allSettings.filter(
      (item) => item.workspaceId !== activeWorkspace.id
    );

    setSettings(resetSettings);
    setAllSettings(updatedSettings);
    saveAllSettings(updatedSettings);
    setSavedNotice("Settings reset.");
    window.setTimeout(() => setSavedNotice(""), 2500);
  }

  function handleInviteSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setInviteEmail("");
    setInviteRole("Employee");
    setInviteOpen(false);
    setSavedNotice("Invite placeholder saved.");
    window.setTimeout(() => setSavedNotice(""), 2500);
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-950 shadow-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100";

  const labelClass = "mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-100";

  const tabClass = (target: SettingsTab) =>
    `rounded-lg px-4 py-2 text-sm font-semibold ${
      tab === target
        ? "bg-blue-600 text-white shadow"
        : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
    }`;

  return (
    <div className="space-y-8 text-gray-950 dark:text-gray-100">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Configure {activeWorkspace.name} defaults for invoices, taxes, workspace behavior, and team access.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={resetWorkspaceSettings}
            className="rounded-lg border border-gray-300 px-4 py-2 font-semibold hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Reset
          </button>

          <button
            type="button"
            onClick={saveSettings}
            className="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700"
          >
            Save Settings
          </button>
        </div>
      </div>

      {savedNotice && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 font-semibold text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300">
          {savedNotice}
        </div>
      )}

      <div className="flex flex-wrap gap-2 rounded-xl bg-gray-100 p-2 dark:bg-gray-800">
        <button onClick={() => setTab("business")} className={tabClass("business")}>
          Business Profile
        </button>
        <button onClick={() => setTab("invoice")} className={tabClass("invoice")}>
          Invoice Defaults
        </button>
        <button onClick={() => setTab("tax")} className={tabClass("tax")}>
          Tax
        </button>
        <button onClick={() => setTab("workspace")} className={tabClass("workspace")}>
          Workspace
        </button>
        <button onClick={() => setTab("permissions")} className={tabClass("permissions")}>
          Permissions
        </button>
      </div>

      {tab === "business" && (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <h2 className="text-2xl font-bold">Business Profile</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            This should later feed the invoice “From” section automatically.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
            <div>
              <label className={labelClass}>Company Name</label>
              <input
                value={settings.companyName}
                onChange={(event) => updateSetting("companyName", event.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Company Email</label>
              <input
                type="email"
                value={settings.companyEmail}
                onChange={(event) => updateSetting("companyEmail", event.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Company Phone</label>
              <input
                value={settings.companyPhone}
                onChange={(event) => updateSetting("companyPhone", event.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Website</label>
              <input
                value={settings.companyWebsite}
                onChange={(event) => updateSetting("companyWebsite", event.target.value)}
                placeholder="https://example.com"
                className={inputClass}
              />
            </div>

            <div className="xl:col-span-2">
              <label className={labelClass}>Street Address</label>
              <input
                value={settings.companyAddress}
                onChange={(event) => updateSetting("companyAddress", event.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>City</label>
              <input
                value={settings.companyCity}
                onChange={(event) => updateSetting("companyCity", event.target.value)}
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>State</label>
                <input
                  value={settings.companyState}
                  onChange={(event) =>
                    updateSetting("companyState", event.target.value.toUpperCase())
                  }
                  maxLength={2}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>ZIP</label>
                <input
                  value={settings.companyZip}
                  onChange={(event) => updateSetting("companyZip", event.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {tab === "invoice" && (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <h2 className="text-2xl font-bold">Invoice Defaults</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            These values should be connected to the invoice builder next.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
            <div>
              <label className={labelClass}>Default Invoice Status</label>
              <select
                value={settings.defaultInvoiceStatus}
                onChange={(event) =>
                  updateSetting(
                    "defaultInvoiceStatus",
                    event.target.value as WorkspaceSettings["defaultInvoiceStatus"]
                  )
                }
                className={inputClass}
              >
                <option>Draft</option>
                <option>Sent</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Default Terms</label>
              <input
                value={settings.defaultInvoiceTerms}
                onChange={(event) =>
                  updateSetting("defaultInvoiceTerms", event.target.value)
                }
                placeholder="Due upon receipt"
                className={inputClass}
              />
            </div>

            <div className="xl:col-span-2">
              <label className={labelClass}>Default Footer Message</label>
              <input
                value={settings.defaultFooterMessage}
                onChange={(event) =>
                  updateSetting("defaultFooterMessage", event.target.value)
                }
                className={inputClass}
              />
            </div>

            <div className="xl:col-span-2">
              <label className={labelClass}>Default Contact Message</label>
              <input
                value={settings.defaultContactMessage}
                onChange={(event) =>
                  updateSetting("defaultContactMessage", event.target.value)
                }
                className={inputClass}
              />
            </div>
          </div>
        </section>
      )}

      {tab === "tax" && (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <h2 className="text-2xl font-bold">Tax Settings</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Discount is currently set to apply before tax, which is the normal invoice calculation flow.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
            <div>
              <label className={labelClass}>Tax State</label>
              <input
                value={settings.taxState}
                onChange={(event) =>
                  updateSetting("taxState", event.target.value.toUpperCase())
                }
                maxLength={2}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Default Tax Rate %</label>
              <input
                type="number"
                value={settings.defaultTaxRate}
                onChange={(event) => updateSetting("defaultTaxRate", event.target.value)}
                placeholder="6"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Tax Location Basis</label>
              <select
                value={settings.taxLocationMode}
                onChange={(event) =>
                  updateSetting(
                    "taxLocationMode",
                    event.target.value as WorkspaceSettings["taxLocationMode"]
                  )
                }
                className={inputClass}
              >
                <option>Business location</option>
                <option>Job location</option>
              </select>
            </div>

            <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={settings.discountBeforeTax}
                  onChange={(event) =>
                    updateSetting("discountBeforeTax", event.target.checked)
                  }
                  className="mt-1 h-4 w-4"
                />

                <span>
                  <span className="block font-semibold">Apply discount before tax</span>
                  <span className="mt-1 block text-sm text-gray-500 dark:text-gray-400">
                    Keeps invoice totals consistent with the current calculation helper.
                  </span>
                </span>
              </label>
            </div>
          </div>
        </section>
      )}

      {tab === "workspace" && (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <h2 className="text-2xl font-bold">Workspace Configuration</h2>

          <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
            <div>
              <label className={labelClass}>Workspace Name</label>
              <input value={activeWorkspace.name} readOnly className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Display Nickname</label>
              <input
                value={settings.workspaceNickname}
                onChange={(event) =>
                  updateSetting("workspaceNickname", event.target.value)
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Business Type</label>
              <select
                value={settings.businessType}
                onChange={(event) => updateSetting("businessType", event.target.value)}
                className={inputClass}
              >
                {businessTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Workspace ID</label>
              <input value={activeWorkspace.id} readOnly className={inputClass} />
            </div>

            <div className="xl:col-span-2">
              <label className={labelClass}>Internal Notes</label>
              <textarea
                rows={5}
                value={settings.notes}
                onChange={(event) => updateSetting("notes", event.target.value)}
                placeholder="Internal workspace notes, default operating procedures, billing notes..."
                className={inputClass}
              />
            </div>
          </div>
        </section>
      )}

      {tab === "permissions" && (
        <section className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold">Team Members</h2>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  Invite placeholder for {activeWorkspace.name}. Real auth comes later.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setInviteOpen(true)}
                className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Invite Member
              </button>
            </div>

            <div className="mt-6 rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500 dark:border-gray-700 dark:text-gray-400">
              No team members saved yet.
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
            <h2 className="text-2xl font-bold">Role Permissions</h2>

            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
              {roles.map((role) => (
                <div
                  key={role.name}
                  className="rounded-xl border border-gray-200 p-5 dark:border-gray-800"
                >
                  <h3 className={`text-lg font-bold ${role.color}`}>{role.name}</h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {role.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {inviteOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Invite Team Member</h2>

              <button
                type="button"
                onClick={() => {
                  setInviteOpen(false);
                  setInviteEmail("");
                  setInviteRole("Employee");
                }}
                className="text-2xl text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-5">
              <div>
                <label className={labelClass}>Email Address *</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(event) => setInviteEmail(event.target.value)}
                  placeholder="employee@example.com"
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Role</label>
                <select
                  value={inviteRole}
                  onChange={(event) => setInviteRole(event.target.value)}
                  className={inputClass}
                >
                  <option>Owner</option>
                  <option>Manager</option>
                  <option>Employee</option>
                </select>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setInviteOpen(false);
                    setInviteEmail("");
                    setInviteRole("Employee");
                  }}
                  className="rounded-lg border border-gray-300 px-5 py-3 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  Save Invite Placeholder
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

type WorkspaceDisplaySettings = {
  workspaceId: string;
  workspaceNickname?: string;
  businessType?: string;
  userDisplayName?: string;
  userEmail?: string;
};

const businessTypes = [
  "Landscaping",
  "Tree Service",
  "Lawn Care",
  "Snow Removal",
  "Property Management",
  "Construction",
  "Auto Repair",
  "IT Services",
  "Plumbing",
  "Electrical",
  "Cleaning",
  "Restaurant",
  "Property Maintenance",
  "Other",
];

function loadWorkspaceSettings(workspaceId: string): WorkspaceDisplaySettings | null {
  if (typeof window === "undefined") return null;

  const saved = localStorage.getItem("frontier-settings");
  if (!saved) return null;

  try {
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return null;

    return (
      parsed.find(
        (item: WorkspaceDisplaySettings) => item.workspaceId === workspaceId
      ) ?? null
    );
  } catch {
    return null;
  }
}

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
  const [displaySettings, setDisplaySettings] =
    useState<WorkspaceDisplaySettings | null>(null);

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

  useEffect(() => {
    function refreshDisplaySettings() {
      setDisplaySettings(loadWorkspaceSettings(activeWorkspace.id));
    }

    refreshDisplaySettings();

    window.addEventListener("storage", refreshDisplaySettings);
    window.addEventListener("frontier-settings-updated", refreshDisplaySettings);

    return () => {
      window.removeEventListener("storage", refreshDisplaySettings);
      window.removeEventListener(
        "frontier-settings-updated",
        refreshDisplaySettings
      );
    };
  }, [activeWorkspace.id]);

  const displayedWorkspaceName =
    displaySettings?.workspaceNickname?.trim() || activeWorkspace.name;

  const displayedWorkspaceType =
    displaySettings?.businessType?.trim() || activeWorkspace.type;

  const displayedUserName =
    displaySettings?.userDisplayName?.trim() || "Nicholas Thompson";

  const displayedUserEmail =
    displaySettings?.userEmail?.trim() || "thomp3ns@gmail.com";

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

  function resetNewWorkspaceForm() {
    setWorkspaceName("");
    setWorkspaceType("Landscaping");
    setCustomWorkspaceType("");
  }

  function closeNewWorkspaceModal() {
    setNewWorkspaceOpen(false);
    setWorkspaceOpen(false);
    setUserOpen(false);
    resetNewWorkspaceForm();
  }

  function createWorkspace() {
    if (!workspaceName.trim()) return;

    const resolvedType =
      workspaceType === "Other" ? customWorkspaceType.trim() : workspaceType;

    if (!resolvedType) return;

    addWorkspace({
      id: crypto.randomUUID(),
      name: workspaceName.trim(),
      type: resolvedType,
    });

    resetNewWorkspaceForm();
    setNewWorkspaceOpen(false);
  }

  function getWorkspaceDisplayName(workspace: {
    id: string;
    name: string;
    type: string;
  }) {
    const saved = loadWorkspaceSettings(workspace.id);
    return saved?.workspaceNickname?.trim() || workspace.name;
  }

  function getWorkspaceDisplayType(workspace: {
    id: string;
    name: string;
    type: string;
  }) {
    const saved = loadWorkspaceSettings(workspace.id);
    return saved?.businessType?.trim() || workspace.type;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-100 text-gray-950 dark:bg-gray-950 dark:text-gray-100">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col bg-gray-100 dark:bg-gray-950">
        <header className="flex h-20 items-center justify-between border-b border-gray-200 bg-white px-3 sm:px-6 lg:px-8 dark:border-gray-800 dark:bg-gray-900">
          <div className="relative">
            <button
              onClick={() => {
                setWorkspaceOpen(!workspaceOpen);
                setUserOpen(false);
              }}
              className="flex max-w-[52vw] items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800 sm:max-w-none"
            >
              <span className="text-blue-600">▤</span>

              <span className="truncate font-semibold">
                {displayedWorkspaceName}
              </span>

              <span className="text-gray-500">⌄</span>
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
                    <span className="mt-1 text-xl">▤</span>

                    <span className="min-w-0">
                      <span className="block truncate font-semibold">
                        {getWorkspaceDisplayName(workspace)}
                      </span>

                      <span className="block truncate text-sm text-gray-500 dark:text-gray-400">
                        {getWorkspaceDisplayType(workspace)}
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
                  <span className="text-xl">+</span>

                  <span className="font-medium">New Workspace</span>
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

                <span className="hidden max-w-48 truncate font-semibold md:block">
                  {displayedUserName}
                </span>

                <span className="text-gray-500">⌄</span>
              </button>

              {userOpen && (
                <div className="absolute right-0 top-14 z-50 w-72 max-w-[90vw] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
                  <div className="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
                    <div className="font-semibold">{displayedUserName}</div>
                    <div className="mt-1 break-all text-sm text-gray-500 dark:text-gray-400">
                      {displayedUserEmail}
                    </div>
                  </div>

                  <div className="border-b border-gray-200 px-4 py-3 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                    {displayedWorkspaceName}
                    <br />
                    {displayedWorkspaceType}
                  </div>

                  <button className="flex w-full items-center gap-4 px-4 py-4 text-left hover:bg-gray-100 dark:hover:bg-gray-800">
                    <span className="text-xl">↪</span>

                    <span className="font-medium">Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
          {children}
        </main>

        {newWorkspaceOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold">New Workspace</h2>

                <button
                  onClick={closeNewWorkspaceModal}
                  className="text-2xl text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(event) => setWorkspaceName(event.target.value)}
                  placeholder="Workspace Name"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
                />

                <select
                  value={workspaceType}
                  onChange={(event) => setWorkspaceType(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
                >
                  {businessTypes.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>

                {workspaceType === "Other" && (
                  <input
                    type="text"
                    value={customWorkspaceType}
                    onChange={(event) =>
                      setCustomWorkspaceType(event.target.value)
                    }
                    placeholder="Specify Business Type"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
                  />
                )}

                <button
                  onClick={createWorkspace}
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
  { label: "Dashboard", href: "/dashboard", icon: "🏠" },
  { label: "Calendar", href: "/calendar", icon: "📅" },
  { label: "Jobs", href: "/jobs", icon: "✅" },
  { label: "Inventory", href: "/inventory", icon: "🧱" },
  { label: "Financials", href: "/financials", icon: "💵" },
  { label: "Invoices", href: "/invoices", icon: "📄" },
  { label: "Clients", href: "/clients", icon: "🧑‍💼" },
  { label: "Document Extraction", href: "/documents", icon: "📁" },
  { label: "Logistics", href: "/logistics", icon: "🛣️" },
  { label: "Settings", href: "/settings", icon: "⚙️" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <aside className={`min-h-screen bg-gray-900 text-white transition-all duration-300 ${collapsed ? "w-20" : "w-64"}`}>
      <div className="flex h-full flex-col">
        <div className={`flex items-center border-b border-gray-800 p-4 ${collapsed ? "justify-center" : "justify-between"}`}>
          {collapsed ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-3xl font-light">⌖</div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-3xl font-light">⌖</div>
              <h1 className="text-2xl font-bold">Frontier</h1>
            </div>
          )}
        </div>

        <nav className="flex flex-col gap-1 p-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} title={collapsed ? item.label : undefined} className={`group relative flex items-center rounded-xl px-3 py-2.5 text-gray-300 hover:bg-blue-600 hover:text-white ${collapsed ? "justify-center" : "gap-3"}`}>
              <span className="w-8 text-center text-2xl leading-none">{item.icon}</span>
              {!collapsed && <span className="text-base font-medium">{item.label}</span>}
              {collapsed && <span className="pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded-lg bg-gray-800 px-3 py-2 text-sm text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="mt-auto mb-4 p-3">
          <button onClick={() => setCollapsed(!collapsed)} className={`flex w-full items-center rounded-xl px-3 py-3 text-gray-300 hover:bg-gray-800 hover:text-white ${collapsed ? "justify-center text-xl" : "gap-3"}`} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} title={collapsed ? "Expand" : "Collapse"}>
            <span className="text-xl">{collapsed ? "›" : "‹"}</span>
            {!collapsed && <span className="text-base font-medium">Collapse</span>}
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
    <div className="min-w-0 rounded-lg bg-white p-3 shadow dark:bg-gray-900">
      <h2 className="truncate text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
        {title}
      </h2>

      <p className="mt-1 break-words text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
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

## lib\frontierClients.ts

```typescript
import { clients as defaultClients } from "@/lib/clients";
import { formatCurrency } from "@/lib/frontierInvoices";

export type ClientRow = {
  id: string;
  workspaceId: string;
  name: string;
  status: string;
  balance: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  notes?: string;
};

export const clientStatuses = ["Lead", "Active", "Inactive"] as const;
export type ClientStatus = (typeof clientStatuses)[number];

export function safeParseClients(value: string | null): ClientRow[] {
  if (!value) return defaultClients;

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : defaultClients;
  } catch {
    return defaultClients;
  }
}

export function loadClients() {
  if (typeof window === "undefined") return defaultClients as ClientRow[];

  return safeParseClients(localStorage.getItem("frontier-clients"));
}

export function saveClients(clients: ClientRow[]) {
  localStorage.setItem("frontier-clients", JSON.stringify(clients));
}

export function formatClientBalance(value: string) {
  const numericValue = Number(value.replace(/[$,]/g, ""));

  if (Number.isNaN(numericValue)) {
    return "$0";
  }

  return formatCurrency(numericValue).replace(".00", "");
}

export function normalizeName(value: string) {
  return value.trim().toLowerCase();
}
```

## lib\frontierInvoices.ts

```typescript
export const invoiceStatuses = ["Draft", "Sent", "Overdue", "Paid"] as const;
export const discountTypes = ["None", "Percent", "Fixed"] as const;

export type InvoiceStatus = (typeof invoiceStatuses)[number];
export type DiscountType = (typeof discountTypes)[number];

export type InvoiceLineItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: string;
};

export type InvoiceRow = {
  id: string;
  workspaceId: string;
  invoiceNumber: string;
  invoiceDate: string;

  jobId?: string;
  jobName?: string;
  sourceClientId?: string;

  companyName: string;
  companyAddress: string;
  companyCity: string;
  companyState: string;
  companyZip: string;
  companyPhone: string;
  companyEmail: string;

  billToName: string;
  billToCompany: string;
  billToAddress: string;
  billToCity: string;
  billToState: string;
  billToZip: string;
  billToPhone: string;
  billToEmail: string;

  lineItems: InvoiceLineItem[];

  discountType: DiscountType;
  discountValue: string;
  taxRate: string;

  footerMessage: string;
  contactMessage: string;
  status: InvoiceStatus;
};

export type InvoiceSetupDraft = Omit<
  InvoiceRow,
  "lineItems" | "discountType" | "discountValue" | "taxRate" | "status"
>;

export function moneyToNumber(value: string | number | null | undefined) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (!value) return 0;

  return Number(value.replace(/[$,%\s,]/g, "")) || 0;
}

export function formatCurrency(value: number) {
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatMoneyNumber(value: number) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function getInvoiceClientName(invoice: Pick<InvoiceRow, "billToCompany" | "billToName">) {
  return invoice.billToCompany || invoice.billToName || "—";
}

export function getLineTotal(item: InvoiceLineItem) {
  return item.quantity * moneyToNumber(item.unitPrice);
}

export function getSubtotal(lineItems: InvoiceLineItem[]) {
  return lineItems.reduce((total, item) => total + getLineTotal(item), 0);
}

export function getDiscountAmount(
  subtotal: number,
  discountType: DiscountType,
  discountValue: string
) {
  const value = moneyToNumber(discountValue);

  if (discountType === "Percent") {
    return Math.min(subtotal * (value / 100), subtotal);
  }

  if (discountType === "Fixed") {
    return Math.min(value, subtotal);
  }

  return 0;
}

export function getTaxAmount(afterDiscountSubtotal: number, taxRate: string) {
  const rate = moneyToNumber(taxRate);
  return afterDiscountSubtotal * (rate / 100);
}

export function getInvoiceTotals(invoice: InvoiceRow) {
  const subtotal = getSubtotal(invoice.lineItems || []);
  const discount = getDiscountAmount(
    subtotal,
    invoice.discountType || "None",
    invoice.discountValue || "0"
  );
  const taxableSubtotal = Math.max(subtotal - discount, 0);
  const tax = getTaxAmount(taxableSubtotal, invoice.taxRate || "0");
  const total = taxableSubtotal + tax;

  return {
    subtotal,
    discount,
    taxableSubtotal,
    tax,
    total,
  };
}

export function safeParseInvoices(value: string | null): InvoiceRow[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function loadSavedInvoices() {
  if (typeof window === "undefined") return [];

  return safeParseInvoices(localStorage.getItem("frontier-invoices"));
}

export function saveSavedInvoices(invoices: InvoiceRow[]) {
  localStorage.setItem("frontier-invoices", JSON.stringify(invoices));
}
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

