"use client";

import { useState } from "react";

import { useAuthSession } from "@/components/AuthSessionProvider";
import { useWorkspace } from "@/components/WorkspaceContext";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { importLocalFrontierData, previewLocalFrontierData } from "@/lib/migration/localImport";
import type { LocalImportCounts, LocalImportSummary } from "@/lib/migration/localImportTypes";

const countLabels: Record<keyof LocalImportCounts, string> = {
  clients: "Clients",
  jobs: "Jobs",
  jobMaterials: "Job materials",
  invoices: "Invoices",
  invoiceLineItems: "Invoice line items",
  expenses: "Expenses",
  inventory: "Inventory",
  clientCalendarEvents: "Client calendar events",
  documents: "Documents metadata",
  routes: "Routes",
  workspaceSettings: "Workspace settings",
};

export default function DataMigrationSettings() {
  const { user } = useAuthSession();
  const { activeWorkspace } = useWorkspace();
  const [counts, setCounts] = useState<LocalImportCounts | null>(null);
  const [summary, setSummary] = useState<LocalImportSummary | null>(null);
  const [busy, setBusy] = useState(false);

  if (!user) {
    return <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">Sign in to import local data.</section>;
  }

  function preview() {
    setCounts(previewLocalFrontierData(activeWorkspace.id));
  }

  async function importData() {
    setBusy(true);
    const supabase = createBrowserSupabaseClient();
    const result = await importLocalFrontierData({ workspaceId: activeWorkspace.id, supabase });
    setSummary(result);
    setBusy(false);
  }

  return (
    <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div>
        <h2 className="text-2xl font-bold">Data Migration</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Import localStorage data into the active Supabase workspace. Local data is not deleted.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button onClick={preview} className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white">Preview Local Data</button>
        <button onClick={importData} disabled={busy} className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white disabled:opacity-50">Import Local Data</button>
        <button onClick={() => { setCounts(null); setSummary(null); }} className="rounded-lg border border-gray-300 px-4 py-2 font-semibold dark:border-gray-700">Clear Import Status</button>
      </div>
      {counts && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(Object.keys(countLabels) as (keyof LocalImportCounts)[]).map((key) => (
            <div key={key} className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
              <div className="text-sm text-gray-500 dark:text-gray-400">{countLabels[key]}</div>
              <div className="text-2xl font-bold">{counts[key]}</div>
            </div>
          ))}
        </div>
      )}
      {summary && (
        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          Created: {summary.created} | Skipped: {summary.skipped} | Failed: {summary.failed}
          {summary.warnings.length > 0 && <div className="mt-2 text-sm text-amber-600">{summary.warnings.join(" ")}</div>}
        </div>
      )}
    </section>
  );
}
