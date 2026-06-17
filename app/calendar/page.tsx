"use client";

import { useState } from "react";
import Link from "next/link";

import { jobs as defaultJobs } from "@/lib/jobs";
import { clients as defaultClients } from "@/lib/clients";
import { useWorkspace } from "@/components/WorkspaceContext";
import { storageKeys, useStoredJsonState } from "@/lib/clientStorage";
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
  const [jobItems] = useStoredJsonState(storageKeys.jobs, defaultJobs);
  const [clientItems] = useStoredJsonState<ClientRow[]>(
    storageKeys.clients,
    defaultClients
  );
  const [clientEvents, setClientEvents] = useStoredJsonState<
    ClientCalendarEvent[]
  >(storageKeys.clientCalendarEvents, []);
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 5, 1));

  const [clientEventOpen, setClientEventOpen] = useState(false);
  const [clientEventClientId, setClientEventClientId] = useState("");
  const [clientEventTitle, setClientEventTitle] = useState("");
  const [clientEventDate, setClientEventDate] = useState("");

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
                    <div className="text-sm text-gray-500 dark:text-gray-400">{item.event.clientName} - {item.event.date}</div>
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
              <button type="button" onClick={closeClientEventModal} className="text-2xl text-gray-500">-</button>
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
