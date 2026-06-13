"use client";

import StatCard from "../../components/Statcard";
import { useWorkspace } from "@/components/WorkspaceContext";

const dashboardData = {
  landscaping: {
    activeClients: 24,
    openQuotes: 8,
    outstandingInvoices: "$4,200",
    inventoryAlerts: 3,
    activity: [
      "✓ Quote sent to Smith Landscaping",
      "✓ Invoice paid by Green Valley HOA",
      "✓ Inventory order submitted",
      "✓ Job scheduled for Friday",
    ],
  },

  "snow-removal": {
    activeClients: 12,
    openQuotes: 4,
    outstandingInvoices: "$2,850",
    inventoryAlerts: 5,
    activity: [
      "✓ Salt delivery received",
      "✓ Snow route assigned",
      "✓ Invoice paid by City Contract",
      "✓ Equipment maintenance completed",
    ],
  },

  properties: {
    activeClients: 18,
    openQuotes: 2,
    outstandingInvoices: "$7,100",
    inventoryAlerts: 1,
    activity: [
      "✓ New tenant work order created",
      "✓ Property inspection completed",
      "✓ HOA invoice generated",
      "✓ Maintenance request closed",
    ],
  },
};

export default function DashboardPage() {
  const { activeWorkspace } = useWorkspace();

  const data =
    dashboardData[activeWorkspace.id as keyof typeof dashboardData] ??
    dashboardData.landscaping;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-950 dark:text-gray-100">
          Dashboard
        </h1>

        <p className="mt-2 text-gray-500 dark:text-gray-400">
          {activeWorkspace.name}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Active Clients" value={String(data.activeClients)} />

        <StatCard title="Open Quotes" value={String(data.openQuotes)} />

        <StatCard
          title="Outstanding Invoices"
          value={data.outstandingInvoices}
        />

        <StatCard
          title="Inventory Alerts"
          value={String(data.inventoryAlerts)}
        />
      </div>

      <div className="mt-8 rounded-lg bg-white p-6 shadow dark:bg-gray-900">
        <h2 className="mb-4 text-xl font-semibold text-gray-950 dark:text-gray-100">
          Recent Activity
        </h2>

        <ul className="space-y-3 break-words text-gray-900 dark:text-gray-100">
          {data.activity.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}