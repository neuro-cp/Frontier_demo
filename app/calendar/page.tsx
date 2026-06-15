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

function formatMonthLabel(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
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
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 5, 1));

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

  const monthYear = currentMonth.getFullYear();
  const monthIndex = currentMonth.getMonth();

  const firstDayOfMonth = new Date(monthYear, monthIndex, 1);
  const firstWeekdayIndex = firstDayOfMonth.getDay();
  const daysInMonth = new Date(monthYear, monthIndex + 1, 0).getDate();

  const calendarDays = Array.from({ length: 42 }, (_, index) => {
    const dayNumber = index - firstWeekdayIndex + 1;

    if (dayNumber < 1 || dayNumber > daysInMonth) {
      return null;
    }

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

  const currentMonthJobs = workspaceJobs.filter((job) => {
    const jobDate = new Date(`${job.date}T00:00:00`);

    return (
      jobDate.getFullYear() === monthYear &&
      jobDate.getMonth() === monthIndex
    );
  });

  const weekJobs = workspaceJobs.slice(0, 7);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">


        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={goToPreviousMonth}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
          >
            Prev
          </button>

          <button
            type="button"
            onClick={goToToday}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
          >
            Today
          </button>

          <button
            type="button"
            onClick={goToNextMonth}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
          >
            Next
          </button>

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
      </div>

      <div className="rounded-2xl bg-white p-4 shadow dark:bg-gray-900 sm:p-6">
        {view === "month" && (
          <>
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-semibold text-gray-950 dark:text-gray-100">
                {formatMonthLabel(currentMonth)}
              </h2>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                {currentMonthJobs.length} job
                {currentMonthJobs.length === 1 ? "" : "s"} this month
              </p>
            </div>

            <div className="overflow-x-auto">
              <div className="grid min-w-[900px] grid-cols-7 gap-1 lg:gap-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (dayName) => (
                    <div
                      key={dayName}
                      className="p-2 text-sm font-semibold text-gray-500 dark:text-gray-400"
                    >
                      {dayName}
                    </div>
                  )
                )}

                {calendarDays.map((day, index) => {
                  const dayString = day ? formatDateString(day) : "";

                  const dayJobs = workspaceJobs.filter(
                    (job) => job.date === dayString
                  );

                  return (
                    <div
                      key={index}
                      className="min-h-24 rounded-lg border border-gray-200 p-2 dark:border-gray-800 lg:min-h-28"
                    >
                      <div className="font-semibold text-gray-950 dark:text-gray-100">
                        {day ? day.getDate() : ""}
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
              {weekJobs.length > 0 ? (
                weekJobs.map((job) => (
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
                ))
              ) : (
                <div className="text-center text-lg text-gray-500 dark:text-gray-400">
                  No upcoming jobs for {activeWorkspace.name}
                </div>
              )}
            </div>
          </>
        )}

        {view === "agenda" && (
          <>
            <h2 className="mb-4 text-xl font-semibold text-gray-950 dark:text-gray-100">
              Agenda
            </h2>

            <div className="space-y-3">
              {workspaceJobs.length > 0 ? (
                workspaceJobs.map((job) => (
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
                ))
              ) : (
                <div className="text-center text-lg text-gray-500 dark:text-gray-400">
                  No scheduled jobs for {activeWorkspace.name}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}