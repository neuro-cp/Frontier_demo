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