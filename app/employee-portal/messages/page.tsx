import Link from "next/link";

import PortalSubpageShell from "@/components/PortalSubpageShell";

export default function EmployeePortalMessagesPage() {
  return (
    <PortalSubpageShell
      portalName="Employee Portal"
      dashboardHref="/employee-portal"
      title="Employee Conversations"
      description="Internal conversation access for workspace team members. Employee-to-client direct messaging is not connected yet."
    >
      <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
        <h2 className="text-lg font-bold">Workspace Messages</h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Owners and Managers can review and reply to client conversations from the workspace message center.
        </p>
        <Link
          href="/messages"
          className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
        >
          Open Message Center
        </Link>
      </div>
    </PortalSubpageShell>
  );
}
