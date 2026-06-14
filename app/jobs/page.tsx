"use client";

import { useState } from "react";
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
  selectedJobs,
  toggleJob,
}: {
  title: string;
  jobs: Job[];
  selectedJobs: string[];
  toggleJob: (id: string) => void;
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
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedJobs.includes(job.id)}
                  onChange={() => toggleJob(job.id)}
                  className="h-4 w-4"
                />

                <Link
                  href={`/jobs/${job.id}`}
                  className="block flex-1"
                >
                  {job.name}
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function JobsPage() {
  const { activeWorkspace } = useWorkspace();

  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);

  const toggleJob = (id: string) => {
    setSelectedJobs((prev) =>
      prev.includes(id)
        ? prev.filter((jobId) => jobId !== id)
        : [...prev, id]
    );
  };

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

        <div className="flex flex-wrap gap-2">
          <Link
            href="/jobs/new"
            className="rounded-lg bg-blue-600 px-4 py-3 text-center text-white hover:bg-blue-700"
          >
            + Add Job
          </Link>

          <button
            disabled={selectedJobs.length === 0}
            className="rounded-lg bg-green-600 px-4 py-3 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ✓ Complete
          </button>

          <button
            disabled={selectedJobs.length === 0}
            className="rounded-lg bg-red-600 px-4 py-3 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Remove
          </button>
        </div>
      </div>

      {selectedJobs.length > 0 && (
        <div className="rounded-xl bg-gray-900 p-4 text-white">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-medium">
              {selectedJobs.length} job
              {selectedJobs.length !== 1 ? "s" : ""} selected
            </span>

            <button className="rounded bg-green-600 px-3 py-2 text-sm hover:bg-green-700">
              Mark Complete
            </button>

            <button className="rounded bg-red-600 px-3 py-2 text-sm hover:bg-red-700">
              Delete
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-5">
        <JobColumn
          title="Lead"
          jobs={lead}
          selectedJobs={selectedJobs}
          toggleJob={toggleJob}
        />

        <JobColumn
          title="Quoted"
          jobs={quoted}
          selectedJobs={selectedJobs}
          toggleJob={toggleJob}
        />

        <JobColumn
          title="Scheduled"
          jobs={scheduled}
          selectedJobs={selectedJobs}
          toggleJob={toggleJob}
        />

        <JobColumn
          title="Completed"
          jobs={completed}
          selectedJobs={selectedJobs}
          toggleJob={toggleJob}
        />

        <JobColumn
          title="Paid"
          jobs={paid}
          selectedJobs={selectedJobs}
          toggleJob={toggleJob}
        />
      </div>
    </div>
  );
}