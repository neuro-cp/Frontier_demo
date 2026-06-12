"use client";

import { jobs } from "@/lib/jobs";
import { useWorkspace } from "@/components/WorkspaceContext";

export default function CalendarPage() {
  const { activeWorkspace } = useWorkspace();

  const workspaceJobs = jobs.filter(
    (job) => job.workspaceId === activeWorkspace.id
  );

  const days = Array.from({ length: 35 }, (_, i) => i + 1);

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

      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-900">
        <h2 className="mb-4 text-xl font-semibold text-gray-950 dark:text-gray-100">
          June 2026
        </h2>

        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => {
            const dayString = `2026-06-${String(day).padStart(2, "0")}`;

            const dayJobs = workspaceJobs.filter(
              (job) => job.date === dayString
            );

            return (
              <div
                key={day}
                className="min-h-28 rounded-lg border border-gray-200 p-2 dark:border-gray-800"
              >
                <div className="font-semibold text-gray-950 dark:text-gray-100">
                  {day <= 30 ? day : ""}
                </div>

                {dayJobs.map((job) => (
                  <div
                    key={job.id}
                    className={`mt-1 rounded p-1 text-xs text-white ${
                      job.status === "Lead"
                        ? "bg-gray-500"
                        : job.status === "Quoted"
                        ? "bg-yellow-500"
                        : job.status === "Scheduled"
                        ? "bg-blue-500"
                        : job.status === "Completed"
                        ? "bg-green-500"
                        : "bg-purple-500"
                    }`}
                  >
                    {job.name}
                  </div>
                ))}
              </div>
            );
          })}
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