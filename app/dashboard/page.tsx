"use client";

import { useEffect, useState } from "react";

import StatCard from "../../components/Statcard";
import { useWorkspace } from "@/components/WorkspaceContext";
import { jobs as defaultJobs } from "@/lib/jobs";
import { clients } from "@/lib/clients";
import { invoices } from "@/lib/invoices";
import { inventory } from "@/lib/inventory";

function moneyToNumber(value: string) {
  return Number(value.replace(/[$,]/g, ""));
}

function formatMoney(value: number) {
  return `$${value.toLocaleString()}`;
}

export default function DashboardPage() {
  const { activeWorkspace } = useWorkspace();

  const [jobItems, setJobItems] = useState(defaultJobs);

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

  const workspaceClients = clients.filter(
    (client) => client.workspaceId === activeWorkspace.id
  );

  const workspaceJobs = jobItems.filter(
    (job) => job.workspaceId === activeWorkspace.id
  );

  const workspaceInvoices = invoices.filter(
    (invoice) => invoice.workspaceId === activeWorkspace.id
  );

  const workspaceInventory = inventory.filter(
    (item) => item.workspaceId === activeWorkspace.id
  );

  const activeClients = workspaceClients.length;

  const openQuotes = workspaceJobs.filter(
    (job) => job.status === "Quoted"
  ).length;

  const scheduledJobs = workspaceJobs.filter(
    (job) => job.status === "Scheduled"
  ).length;

  const outstandingInvoices = workspaceInvoices
    .filter((invoice) => invoice.status !== "Paid")
    .reduce((total, invoice) => total + moneyToNumber(invoice.amount), 0);

  const inventoryAlerts = workspaceInventory.filter(
    (item) => item.warning
  ).length;

  const recentActivity = [
    `✓ ${activeClients} active client(s)`,
    `✓ ${workspaceJobs.length} total job(s)`,
    `✓ ${openQuotes} open quote(s)`,
    `✓ ${scheduledJobs} scheduled job(s)`,
    `✓ ${inventoryAlerts} inventory alert(s)`,
    `✓ ${workspaceInvoices.length} invoice(s) in system`,
  ];

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
        <StatCard title="Active Clients" value={String(activeClients)} />

        <StatCard title="Open Quotes" value={String(openQuotes)} />

        <StatCard
          title="Outstanding Invoices"
          value={formatMoney(outstandingInvoices)}
        />

        <StatCard title="Inventory Alerts" value={String(inventoryAlerts)} />
      </div>

      <div className="mt-8 rounded-lg bg-white p-6 shadow dark:bg-gray-900">
        <h2 className="mb-4 text-xl font-semibold text-gray-950 dark:text-gray-100">
          Recent Activity
        </h2>

        <ul className="space-y-3 break-words text-gray-900 dark:text-gray-100">
          {recentActivity.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}