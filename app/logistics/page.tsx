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