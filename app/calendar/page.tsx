"use client";

import { useState } from "react";
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

  const [view, setView] = useState("month");

  const workspaceJobs = jobs
    .filter((job) => job.workspaceId === activeWorkspace.id)
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
          onChange={(e) => setView(e.target.value)}
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
          <div className="mt-6 flex items-center justify-center gap-6 border-t border-gray-200 pt-4 dark:border-gray-800">
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
                <div
                  key={job.id}
                  className="rounded-xl border border-gray-200 p-4 dark:border-gray-800"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-950 dark:text-gray-100">
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
                </div>
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
                <div
                  key={job.id}
                  className="rounded-xl border border-gray-200 p-4 dark:border-gray-800"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="font-semibold text-gray-950 dark:text-gray-100">
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
                </div>
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