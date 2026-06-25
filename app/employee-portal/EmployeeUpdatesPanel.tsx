"use client";

import { useEffect, useMemo, useState } from "react";

import { useEmployeePortalData } from "@/lib/portals/useEmployeePortalData";

type JobItem = {
  id: string;
  workspace_id: string;
  name: string;
  status: string;
};

type UpdateItem = {
  id: string;
  job_id: string;
  update_type: string;
  body: string;
  completion_percent: number | null;
  material_name: string | null;
  material_quantity: number | null;
  status: string;
  created_at: string;
};

function formatDate(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export default function EmployeeUpdatesPanel() {
  const jobs = useEmployeePortalData("jobs");
  const updates = useEmployeePortalData("updates");
  const [jobId, setJobId] = useState("");
  const [updateType, setUpdateType] = useState("Progress");
  const [body, setBody] = useState("");
  const [completionPercent, setCompletionPercent] = useState("");
  const [materialName, setMaterialName] = useState("");
  const [materialQuantity, setMaterialQuantity] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [submittedUpdates, setSubmittedUpdates] = useState<UpdateItem[]>([]);

  const jobItems = jobs.items as unknown as JobItem[];
  const workspaceId = jobItems[0]?.workspace_id ?? "";
  const allUpdates = useMemo(
    () => [...submittedUpdates, ...((updates.items as unknown as UpdateItem[]) ?? [])],
    [submittedUpdates, updates.items]
  );

  useEffect(() => {
    if (jobId || !jobItems[0]) return;
    queueMicrotask(() => setJobId(jobItems[0].id));
  }, [jobId, jobItems]);

  async function submitUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!workspaceId || !jobId || !body.trim()) return;
    setIsSaving(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/employee-portal/updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          jobId,
          updateType,
          body,
          completionPercent: completionPercent ? Number(completionPercent) : null,
          materialName,
          materialQuantity: materialQuantity ? Number(materialQuantity) : null,
        }),
      });
      const payload = await response.json();
      if (!response.ok || payload.error) throw new Error(payload.error ?? "Unable to submit update.");
      setSubmittedUpdates((current) => [payload.update as UpdateItem, ...current]);
      setBody("");
      setCompletionPercent("");
      setMaterialName("");
      setMaterialQuantity("");
      setNotice("Update submitted.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to submit update.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {(jobs.error || updates.error || error) && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error || jobs.error || updates.error}
        </p>
      )}
      {notice && (
        <p className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300">
          {notice}
        </p>
      )}

      <form onSubmit={submitUpdate} className="space-y-4 rounded-xl border border-gray-200 p-4 dark:border-gray-800">
        <h2 className="text-lg font-bold">Submit Job Update</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <select
            value={jobId}
            onChange={(event) => setJobId(event.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
          >
            {jobItems.length === 0 && <option value="">No assigned jobs</option>}
            {jobItems.map((job) => (
              <option key={job.id} value={job.id}>{job.name}</option>
            ))}
          </select>
          <select
            value={updateType}
            onChange={(event) => setUpdateType(event.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
          >
            <option>Progress</option>
            <option>Completion</option>
            <option>Material Usage</option>
            <option>Note</option>
          </select>
        </div>

        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={4}
          placeholder="Progress notes, completion notes, or field update..."
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
        />

        <div className="grid gap-3 md:grid-cols-3">
          <input
            type="number"
            min="0"
            max="100"
            value={completionPercent}
            onChange={(event) => setCompletionPercent(event.target.value)}
            placeholder="Completion %"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
          />
          <input
            value={materialName}
            onChange={(event) => setMaterialName(event.target.value)}
            placeholder="Material used"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
          />
          <input
            type="number"
            value={materialQuantity}
            onChange={(event) => setMaterialQuantity(event.target.value)}
            placeholder="Material quantity"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
          />
        </div>

        <button
          type="submit"
          disabled={isSaving || !workspaceId || !jobId || !body.trim()}
          className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {isSaving ? "Submitting..." : "Submit Update"}
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
            <tr>
              <th className="border-b border-gray-200 px-3 py-2 dark:border-gray-800">Type</th>
              <th className="border-b border-gray-200 px-3 py-2 dark:border-gray-800">Update</th>
              <th className="border-b border-gray-200 px-3 py-2 dark:border-gray-800">Completion</th>
              <th className="border-b border-gray-200 px-3 py-2 dark:border-gray-800">Material</th>
              <th className="border-b border-gray-200 px-3 py-2 dark:border-gray-800">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {updates.isLoading ? (
              <tr><td colSpan={5} className="px-3 py-8 text-center text-gray-500">Loading updates...</td></tr>
            ) : allUpdates.length > 0 ? (
              allUpdates.map((update) => (
                <tr key={update.id}>
                  <td className="border-b border-gray-100 px-3 py-3 dark:border-gray-800">{update.update_type}</td>
                  <td className="border-b border-gray-100 px-3 py-3 dark:border-gray-800">{update.body}</td>
                  <td className="border-b border-gray-100 px-3 py-3 dark:border-gray-800">{update.completion_percent ?? "-"}</td>
                  <td className="border-b border-gray-100 px-3 py-3 dark:border-gray-800">
                    {update.material_name ? `${update.material_name}${update.material_quantity ? ` (${update.material_quantity})` : ""}` : "-"}
                  </td>
                  <td className="border-b border-gray-100 px-3 py-3 dark:border-gray-800">{formatDate(update.created_at)}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} className="px-3 py-8 text-center text-gray-500">No updates submitted yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
