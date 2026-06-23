"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import { useAuthSession } from "@/components/AuthSessionProvider";
import type { Job } from "@/lib/jobTypes";
import { useWorkspace } from "@/components/WorkspaceContext";
import { createCalendarEventAction } from "@/lib/actions/calendar";
import { storageKeys, useStoredJsonState } from "@/lib/clientStorage";
import type { ClientRow } from "@/lib/clientTypes";
import { createCalendarEventsRepository, type ClientCalendarEvent } from "@/lib/db/calendarEvents";
import { createClientsRepository } from "@/lib/db/clients";
import { createJobsRepository } from "@/lib/db/jobs";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getWorkspaceDisplayName } from "@/lib/workspaceDisplay";

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

function formatTime(value?: string) {
  if (!value) return "Unscheduled time";
  const [hourValue, minute = "00"] = value.split(":");
  const hour = Number(hourValue);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute} ${suffix}`;
}

function scheduleKey(date: string, time?: string) {
  return `${date}T${time || "23:59"}`;
}

export default function CalendarPage() {
  const { activeWorkspace } = useWorkspace();
  const { isSupabaseConfigured, user } = useAuthSession();
  const isDatabaseMode = Boolean(isSupabaseConfigured && user);

  const [view, setView] = useState("month");
  const [localJobItems, setLocalJobItems] = useStoredJsonState<Job[]>(storageKeys.jobs, []);
  const [databaseJobItems, setDatabaseJobItems] = useState<Job[]>([]);
  const [localClientItems, setLocalClientItems] = useStoredJsonState<ClientRow[]>(
    storageKeys.clients,
    []
  );
  const [localClientEvents, setLocalClientEvents] = useStoredJsonState<
    ClientCalendarEvent[]
  >(storageKeys.clientCalendarEvents, []);
  const [databaseClientItems, setDatabaseClientItems] = useState<ClientRow[]>([]);
  const [databaseClientEvents, setDatabaseClientEvents] = useState<ClientCalendarEvent[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataError, setDataError] = useState("");
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedDay, setSelectedDay] = useState(() => formatDateString(new Date()));

  const [clientEventOpen, setClientEventOpen] = useState(false);
  const [clientEventClientId, setClientEventClientId] = useState("");
  const [clientEventTitle, setClientEventTitle] = useState("");
  const [clientEventDate, setClientEventDate] = useState("");
  const [clientEventTime, setClientEventTime] = useState("");
  const clientEventClientRef = useRef<HTMLSelectElement | null>(null);
  const clientEventTitleRef = useRef<HTMLInputElement | null>(null);
  const clientEventDateRef = useRef<HTMLInputElement | null>(null);

  const supabase = useMemo(() => (isDatabaseMode ? createBrowserSupabaseClient() : null), [isDatabaseMode]);
  const eventsRepo = useMemo(() => createCalendarEventsRepository({ isSignedIn: isDatabaseMode, supabase, localEvents: localClientEvents, setLocalEvents: setLocalClientEvents }), [isDatabaseMode, localClientEvents, setLocalClientEvents, supabase]);
  const clientsRepo = useMemo(() => createClientsRepository({ isSignedIn: isDatabaseMode, supabase, localClients: localClientItems, setLocalClients: setLocalClientItems }), [isDatabaseMode, localClientItems, setLocalClientItems, supabase]);
  const jobsRepo = useMemo(() => createJobsRepository({ isSignedIn: isDatabaseMode, supabase, localJobs: localJobItems, setLocalJobs: setLocalJobItems }), [isDatabaseMode, localJobItems, setLocalJobItems, supabase]);
  const clientItems = isDatabaseMode ? databaseClientItems : localClientItems;
  const clientEvents = isDatabaseMode ? databaseClientEvents : localClientEvents;
  const jobItems = isDatabaseMode ? databaseJobItems : localJobItems;

  useEffect(() => {
    if (!isDatabaseMode) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) {
        setIsLoadingData(true);
        setDataError("");
      }
    });
    Promise.all([
      clientsRepo.getClients(activeWorkspace.id),
      eventsRepo.getEvents(activeWorkspace.id),
      jobsRepo.getJobs(activeWorkspace.id),
    ]).then(([clients, events, jobs]) => {
      if (!cancelled) { setDatabaseClientItems(clients); setDatabaseClientEvents(events); setDatabaseJobItems(jobs); }
    }).catch((error) => {
      if (!cancelled) setDataError(error instanceof Error ? error.message : "Unable to load calendar.");
    }).finally(() => {
      if (!cancelled) setIsLoadingData(false);
    });
    return () => { cancelled = true; };
  }, [activeWorkspace.id, clientsRepo, eventsRepo, isDatabaseMode, jobsRepo]);

  const workspaceClients = clientItems.filter(
    (client) => client.workspaceId === activeWorkspace.id
  );

  const workspaceJobs = jobItems
    .filter((job) => job.workspaceId === activeWorkspace.id)
    .filter((job) => job.date)
    .sort((a, b) => a.date.localeCompare(b.date));
  const workspaceDisplayName = getWorkspaceDisplayName(activeWorkspace);

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
    if (view === "day") {
      const date = new Date(`${selectedDay}T00:00:00`);
      date.setDate(date.getDate() - 1);
      setSelectedDay(formatDateString(date));
      setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
      return;
    }
    setCurrentMonth(new Date(monthYear, monthIndex - 1, 1));
  }

  function goToNextMonth() {
    if (view === "day") {
      const date = new Date(`${selectedDay}T00:00:00`);
      date.setDate(date.getDate() + 1);
      setSelectedDay(formatDateString(date));
      setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
      return;
    }
    setCurrentMonth(new Date(monthYear, monthIndex + 1, 1));
  }

  function goToToday() {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDay(formatDateString(today));
  }

  function saveClientEvents(updatedEvents: ClientCalendarEvent[]) {
    if (isDatabaseMode) setDatabaseClientEvents(updatedEvents);
    else setLocalClientEvents(updatedEvents);
  }

  function closeClientEventModal() {
    setClientEventOpen(false);
    setClientEventClientId("");
    setClientEventTitle("");
    setClientEventDate("");
    setClientEventTime("");
  }

  async function addClientEvent() {
    const selectedClientId = clientEventClientId || clientEventClientRef.current?.value || "";
    const selectedDate = clientEventDate || clientEventDateRef.current?.value || "";
    const selectedTitle = clientEventTitle || clientEventTitleRef.current?.value || "";
    const selectedClient = workspaceClients.find((client) => client.id === selectedClientId);
    if (!selectedClient || !selectedDate) {
      setDataError("Choose a client and date before adding a calendar event.");
      return;
    }

    const newEvent: ClientCalendarEvent = {
      id: crypto.randomUUID(),
      workspaceId: activeWorkspace.id,
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      title: selectedTitle.trim() || "Client Follow-up",
      date: selectedDate,
      time: clientEventTime,
    };

    try {
      const result = await createCalendarEventAction(eventsRepo, newEvent);
      if (!result.ok) {
        setDataError(result.error);
        return;
      }
      const created = result.data;
      if (isDatabaseMode) setDatabaseClientEvents((current) => [...current, created]);
      else saveClientEvents([...clientEvents, created]);
      setDataError("");
      closeClientEventModal();
    } catch (error) {
      setDataError(error instanceof Error ? error.message : "Unable to create calendar event.");
    }
  }

  function getClientEventDisplayName(event: ClientCalendarEvent) {
    const client = workspaceClients.find((item) => item.id === event.clientId);
    return client?.name ?? event.clientName;
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
    ...workspaceJobs.map((job) => ({ type: "job" as const, date: job.date, time: job.time, job })),
    ...workspaceClientEvents.map((event) => ({ type: "client" as const, date: event.date, time: event.time, event })),
  ].sort((a, b) => scheduleKey(a.date, a.time).localeCompare(scheduleKey(b.date, b.time)));

  const weekItems = agendaItems.slice(0, 7);
  const dayItems = agendaItems.filter((item) => item.date === selectedDay);

  function openDay(dayString: string) {
    setSelectedDay(dayString);
    setView("day");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={goToPreviousMonth} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800">Prev</button>
          <button type="button" onClick={goToToday} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800">Today</button>
          <button type="button" onClick={goToNextMonth} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800">Next</button>
          <select value={view} onChange={(event) => setView(event.target.value)} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
            <option value="month">Month View</option>
            <option value="day">Day View</option>
            <option value="week">Week View</option>
            <option value="agenda">Agenda View</option>
          </select>
          <button type="button" onClick={() => setClientEventOpen(true)} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700">+ Client Event</button>
        </div>
      </div>

      {dataError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {dataError}
        </div>
      )}

      {isLoadingData && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
          Loading calendar...
        </div>
      )}

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
                      {day ? (
                        <button type="button" onClick={() => openDay(dayString)} className="font-semibold text-gray-950 hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400">{day.getDate()}</button>
                      ) : null}
                      {[...dayJobs.map((job) => ({ type: "job" as const, time: job.time, job })), ...dayClientEvents.map((event) => ({ type: "client" as const, time: event.time, event }))]
                        .sort((a, b) => (a.time || "23:59").localeCompare(b.time || "23:59"))
                        .slice(0, 2)
                        .map((item) => item.type === "job" ? (
                          <Link key={item.job.id} href={`/jobs/${item.job.id}`} className={`mt-1 block truncate rounded px-2 py-1 text-xs font-medium text-white hover:opacity-90 ${getJobColor(item.job.status)}`}>{item.job.time ? `${formatTime(item.job.time)} · ` : ""}{item.job.name}</Link>
                        ) : (
                          <Link key={item.event.id} href={`/clients/${item.event.clientId}`} className="mt-1 block truncate rounded bg-teal-600 px-2 py-1 text-xs font-medium text-white hover:opacity-90">{item.event.time ? `${formatTime(item.event.time)} · ` : ""}{item.event.title}</Link>
                        ))}
                      {dayJobs.length + dayClientEvents.length > 2 && (
                        <button type="button" onClick={() => openDay(dayString)} className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-left text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:border-gray-700 dark:text-blue-400 dark:hover:bg-gray-800">+{dayJobs.length + dayClientEvents.length - 2} more</button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {view === "day" && (
          <div>
            <div className="mb-5 flex flex-col gap-1 border-b border-gray-200 pb-4 dark:border-gray-800">
              <h2 className="text-2xl font-bold">{new Date(`${selectedDay}T00:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{dayItems.length} scheduled item(s)</p>
            </div>
            <div className="space-y-3">
              {dayItems.length ? dayItems.map((item) => item.type === "job" ? (
                <Link key={`day-job-${item.job.id}`} href={`/jobs/${item.job.id}`} className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800 sm:flex-row sm:items-center">
                  <div className="w-28 shrink-0 font-bold text-blue-600 dark:text-blue-400">{formatTime(item.job.time)}</div>
                  <div className="min-w-0 flex-1"><div className="font-semibold">{item.job.name}</div><div className="text-sm text-gray-500 dark:text-gray-400">{item.job.client}</div></div>
                  <span className={`self-start rounded px-3 py-1 text-xs font-medium text-white sm:self-auto ${getJobColor(item.job.status)}`}>{item.job.status}</span>
                </Link>
              ) : (
                <Link key={`day-client-${item.event.id}`} href={`/clients/${item.event.clientId}`} className="flex flex-col gap-3 rounded-lg border border-teal-200 p-4 hover:bg-teal-50 dark:border-teal-900 dark:hover:bg-teal-950/30 sm:flex-row sm:items-center">
                  <div className="w-28 shrink-0 font-bold text-teal-700 dark:text-teal-300">{formatTime(item.event.time)}</div>
                  <div><div className="font-semibold">{item.event.title}</div><div className="text-sm text-gray-500 dark:text-gray-400">{getClientEventDisplayName(item.event)}</div></div>
                </Link>
              )) : <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500 dark:border-gray-700 dark:text-gray-400">Nothing scheduled for this day.</div>}
            </div>
          </div>
        )}

        {view !== "month" && view !== "day" && (
          <div className="space-y-3">
            {(view === "week" ? weekItems : agendaItems).length > 0 ? (
              (view === "week" ? weekItems : agendaItems).map((item) =>
                item.type === "job" ? (
                  <Link key={`job-${item.job.id}`} href={`/jobs/${item.job.id}`} className="block rounded-xl border border-gray-200 p-4 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800">
                    <div className="flex items-center justify-between">
                      <div><div className="font-semibold text-blue-600 hover:underline dark:text-blue-400">{item.job.name}</div><div className="text-sm text-gray-500 dark:text-gray-400">{item.job.date} · {formatTime(item.job.time)}</div></div>
                      <span className={`rounded px-3 py-1 text-xs font-medium text-white ${getJobColor(item.job.status)}`}>{item.job.status}</span>
                    </div>
                  </Link>
                ) : (
                  <Link key={`client-${item.event.id}`} href={`/clients/${item.event.clientId}`} className="block rounded-xl border border-teal-200 p-4 hover:bg-teal-50 dark:border-teal-900 dark:hover:bg-teal-950/30">
                    <div className="font-semibold text-teal-700 dark:text-teal-300">{item.event.title}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{getClientEventDisplayName(item.event)} - {item.event.date} · {formatTime(item.event.time)}</div>
                  </Link>
                )
              )
            ) : (
              <div className="text-center text-lg text-gray-500 dark:text-gray-400">No calendar items for {workspaceDisplayName}</div>
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
              <select ref={clientEventClientRef} value={clientEventClientId} onChange={(event) => setClientEventClientId(event.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
                <option value="">Select Client</option>
                {workspaceClients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
              </select>
              <input ref={clientEventTitleRef} type="text" value={clientEventTitle} onChange={(event) => setClientEventTitle(event.target.value)} placeholder="Follow-up, estimate, walkthrough..." className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800" />
              <input ref={clientEventDateRef} type="date" value={clientEventDate} onChange={(event) => setClientEventDate(event.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800" />
              <input type="time" value={clientEventTime} onChange={(event) => setClientEventTime(event.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800" />
              <button type="button" onClick={addClientEvent} className="w-full rounded-lg bg-blue-600 py-3 text-white hover:bg-blue-700">Add to Calendar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
