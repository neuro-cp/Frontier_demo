"use client";

import Link from "next/link";

import { useAuthSession } from "@/components/AuthSessionProvider";
import { useWorkspace } from "@/components/WorkspaceContext";
import { useClientPortalAccess } from "@/lib/portals/useClientPortalAccess";

type PortalSubpageShellProps = {
  portalName: "Client Portal" | "Employee Portal";
  dashboardHref: "/client-portal" | "/employee-portal";
  title: string;
  description: string;
  children?: React.ReactNode;
};

export default function PortalSubpageShell({
  portalName,
  dashboardHref,
  title,
  description,
  children,
}: PortalSubpageShellProps) {
  const { user } = useAuthSession();
  const { activeWorkspace } = useWorkspace();
  const clientPortalAccess = useClientPortalAccess();

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h1 className="text-2xl font-bold text-gray-950 dark:text-gray-100">
          {portalName}
        </h1>
        <p className="mt-3 text-gray-600 dark:text-gray-300">
          Sign in to access this portal area.
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

  if (portalName === "Client Portal" && !clientPortalAccess.hasActiveAccess) {
    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h1 className="text-2xl font-bold text-gray-950 dark:text-gray-100">
          Client Portal
        </h1>
        <p className="mt-3 text-gray-600 dark:text-gray-300">
          You do not have an active client portal connection yet. Ask the company to send you an invite.
        </p>
        {clientPortalAccess.error && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">
            {clientPortalAccess.error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href={dashboardHref}
        className="inline-flex text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
      >
        Back to {portalName}
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-gray-950 dark:text-gray-100">
          {title}
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          {description}
        </p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Workspace: {activeWorkspace.name}
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {children ?? (
          <div>
            <div className="text-lg font-bold text-gray-950 dark:text-gray-100">
              Coming Soon
            </div>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              This section is a portal foundation shell. Feature logic will be added in a later sprint.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
