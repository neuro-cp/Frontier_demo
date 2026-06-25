"use client";

import Link from "next/link";

import { useAuthSession } from "@/components/AuthSessionProvider";
import { useWorkspace } from "@/components/WorkspaceContext";
import { useEmployeePortalAccess } from "@/lib/portals/useEmployeePortalAccess";
import { useEmployeePortalData } from "@/lib/portals/useEmployeePortalData";

const portalNav = [
  { label: "Dashboard", href: "/employee-portal" },
  { label: "Jobs", href: "/employee-portal/jobs" },
  { label: "Routes", href: "/employee-portal/routes" },
  { label: "Time Tracking", href: "/employee-portal/time" },
  { label: "Materials", href: "/employee-portal/materials" },
  { label: "Photos", href: "/employee-portal/photos" },
  { label: "Updates", href: "/employee-portal/updates" },
  { label: "Profile", href: "/employee-portal/profile" },
];

function PortalCard({
  title,
  value,
  note,
  href,
}: {
  title: string;
  value: string;
  note: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:border-blue-300 hover:bg-blue-50/50 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-800 dark:hover:bg-blue-950/20"
    >
      <div className="text-sm font-semibold text-gray-500 dark:text-gray-400">
        {title}
      </div>
      <div className="mt-3 text-3xl font-bold text-gray-950 dark:text-gray-100">
        {value}
      </div>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{note}</p>
    </Link>
  );
}

export default function EmployeePortalPage() {
  const { user } = useAuthSession();
  const { activeWorkspace } = useWorkspace();
  const employeePortalAccess = useEmployeePortalAccess();
  const jobs = useEmployeePortalData("jobs");
  const materials = useEmployeePortalData("materials");
  const photos = useEmployeePortalData("photos");
  const error = employeePortalAccess.error || jobs.error || materials.error || photos.error;

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h1 className="text-2xl font-bold text-gray-950 dark:text-gray-100">
          Employee Portal
        </h1>
        <p className="mt-3 text-gray-600 dark:text-gray-300">
          Sign in to access employee workspace tools.
        </p>
        <Link
          href="/login"
          className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
        >
          Log in
        </Link>
      </div>
    );
  }

  if (!employeePortalAccess.hasActiveAccess) {
    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h1 className="text-2xl font-bold text-gray-950 dark:text-gray-100">
          Employee Portal
        </h1>
        <p className="mt-3 text-gray-600 dark:text-gray-300">
          You do not have active employee portal access yet. Ask a workspace Owner or Manager to add you as an Employee.
        </p>
        {employeePortalAccess.error && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">
            {employeePortalAccess.error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-950 dark:text-gray-100">
            Employee Portal
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {activeWorkspace.name} workforce portal foundation.
          </p>
        </div>
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-200">
          Role guard ready: Employee access will map to workspace membership and assignments.
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      <nav className="flex gap-2 overflow-x-auto rounded-xl border border-gray-200 bg-white p-2 dark:border-gray-800 dark:bg-gray-900">
        {portalNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <PortalCard
          title="Assigned Jobs"
          value={String(jobs.items.length)}
          note="Only jobs explicitly assigned to this employee."
          href="/employee-portal/jobs"
        />
        <PortalCard
          title="Today's Route"
          value="Coming Soon"
          note="Route assignment is not built yet."
          href="/employee-portal/routes"
        />
        <PortalCard
          title="Time Tracking"
          value="Coming Soon"
          note="Clock-in and timesheet logic is not built yet."
          href="/employee-portal/time"
        />
        <PortalCard
          title="Materials"
          value={String(materials.items.length)}
          note="Material lines from assigned jobs only."
          href="/employee-portal/materials"
        />
        <PortalCard
          title="Photos"
          value={String(photos.items.length)}
          note="Image documents attached to assigned jobs."
          href="/employee-portal/photos"
        />
        <PortalCard
          title="Updates"
          value="Coming Soon"
          note="Employee job updates are not built yet."
          href="/employee-portal/updates"
        />
      </div>
    </div>
  );
}
