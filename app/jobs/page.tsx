"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { useAuthSession } from "@/components/AuthSessionProvider";
import { useWorkspace } from "@/components/WorkspaceContext";
import { createJobAction, deleteJobAction } from "@/lib/actions/jobs";
import { storageKeys, useStoredJsonState } from "@/lib/clientStorage";
import type { Job, JobMaterial, JobStatus } from "@/lib/jobTypes";
import type { ClientRow } from "@/lib/clientTypes";
import { createClientsRepository } from "@/lib/db/clients";
import { createInvoicesRepository } from "@/lib/db/invoices";
import { createJobsRepository } from "@/lib/db/jobs";
import {
  formatCurrency,
  getInvoiceTotals,
  InvoiceRow,
} from "@/lib/frontierInvoices";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getWorkspaceDisplayName } from "@/lib/workspaceDisplay";
import { consumeAiFormHydration, payloadNumber, payloadString } from "@/lib/ai/formHydration";

function getStatusColor(status: JobStatus) {
  switch (status) {
    case "Lead":
      return "bg-gray-500";
    case "Quoted":
      return "bg-yellow-500";
    case "Scheduled":
      return "bg-blue-500";
    case "Completed":
      return "bg-green-500";
    case "Paid":
      return "bg-purple-500";
    default:
      return "bg-gray-500";
  }
}

export default function JobsPage() {
  const { activeWorkspace, canDeleteBusinessRecords } = useWorkspace();
  const { isSupabaseConfigured, user } = useAuthSession();
  const isDatabaseMode = Boolean(isSupabaseConfigured && user);

  const [localJobItems, setLocalJobItems] = useStoredJsonState<Job[]>(
    storageKeys.jobs,
    []
  );
  const [databaseJobItems, setDatabaseJobItems] = useState<Job[]>([]);
  const [localInvoiceItems, setLocalInvoiceItems] = useStoredJsonState<InvoiceRow[]>(
    storageKeys.invoices,
    []
  );
  const [databaseInvoiceItems, setDatabaseInvoiceItems] = useState<InvoiceRow[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataError, setDataError] = useState("");
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [newJobOpen, setNewJobOpen] = useState(false);

  const [clientId, setClientId] = useState("");
  const [jobName, setJobName] = useState("");
  const [status, setStatus] = useState<JobStatus>("Lead");
  const [value, setValue] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [localClientItems, setLocalClientItems] = useStoredJsonState<ClientRow[]>(
    storageKeys.clients,
    []
  );
  const [databaseClientItems, setDatabaseClientItems] = useState<ClientRow[]>([]);
  const [materialName, setMaterialName] = useState("");
  const [materialQuantity, setMaterialQuantity] = useState("");
  const [materials, setMaterials] = useState<JobMaterial[]>([]);

  const supabase = useMemo(() => (isDatabaseMode ? createBrowserSupabaseClient() : null), [isDatabaseMode]);
  const jobsRepository = useMemo(() => createJobsRepository({ isSignedIn: isDatabaseMode, supabase, localJobs: localJobItems, setLocalJobs: setLocalJobItems }), [isDatabaseMode, localJobItems, setLocalJobItems, supabase]);
  const clientsRepository = useMemo(() => createClientsRepository({ isSignedIn: isDatabaseMode, supabase, localClients: localClientItems, setLocalClients: setLocalClientItems }), [isDatabaseMode, localClientItems, setLocalClientItems, supabase]);
  const invoicesRepository = useMemo(() => createInvoicesRepository({ isSignedIn: isDatabaseMode, supabase, localInvoices: localInvoiceItems, setLocalInvoices: setLocalInvoiceItems }), [isDatabaseMode, localInvoiceItems, setLocalInvoiceItems, supabase]);
  const jobItems = isDatabaseMode ? databaseJobItems : localJobItems;
  const clientItems = isDatabaseMode ? databaseClientItems : localClientItems;
  const invoiceItems = isDatabaseMode ? databaseInvoiceItems : localInvoiceItems;

  useEffect(() => {
    const hydration = consumeAiFormHydration("job", activeWorkspace.id);
    if (!hydration) return;

    queueMicrotask(() => {
      const payload = hydration.payload;
      setClientId(payloadString(payload, "clientId"));
      setJobName(payloadString(payload, "title") || payloadString(payload, "name"));
      setDate(payloadString(payload, "date"));
      setTime(payloadString(payload, "time"));
      setNotes(payloadString(payload, "notes"));
      const amount = payloadNumber(payload, "value");
      setValue(amount === null ? "" : String(amount));
      const nextStatus = payloadString(payload, "status") as JobStatus;
      if (["Lead", "Quoted", "Scheduled", "Completed", "Paid"].includes(nextStatus)) {
        setStatus(nextStatus);
      }
      const rawMaterials = payload.materials;
      if (Array.isArray(rawMaterials)) {
        setMaterials(
          rawMaterials.flatMap((item) => {
            if (!item || typeof item !== "object" || Array.isArray(item)) return [];
            const name = typeof item.name === "string" ? item.name : "";
            const quantity = typeof item.quantity === "number" ? item.quantity : 0;
            return name && quantity > 0 ? [{ name, quantity }] : [];
          })
        );
      }
      setNewJobOpen(true);
    });
  }, [activeWorkspace.id]);

  useEffect(() => {
    if (!isDatabaseMode) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) {
        setIsLoadingData(true);
        setDataError("");
      }
    });
    Promise.all([
      jobsRepository.getJobs(activeWorkspace.id),
      clientsRepository.getClients(activeWorkspace.id),
      invoicesRepository.getInvoices(activeWorkspace.id),
    ]).then(([jobs, clients, invoices]) => {
      if (!cancelled) {
        setDatabaseJobItems(jobs);
        setDatabaseClientItems(clients);
        setDatabaseInvoiceItems(invoices);
      }
    }).catch((error) => {
      if (!cancelled) setDataError(error instanceof Error ? error.message : "Unable to load jobs.");
    }).finally(() => {
      if (!cancelled) setIsLoadingData(false);
    });
    return () => { cancelled = true; };
  }, [activeWorkspace.id, clientsRepository, invoicesRepository, isDatabaseMode, jobsRepository]);

  const workspaceClients = clientItems.filter(
    (clientItem) => clientItem.workspaceId === activeWorkspace.id
  );

  const workspaceJobs = jobItems.filter(
    (job) => job.workspaceId === activeWorkspace.id
  );
  const workspaceDisplayName = getWorkspaceDisplayName(activeWorkspace);

  const allWorkspaceJobsSelected =
    workspaceJobs.length > 0 &&
    workspaceJobs.every((job) => selectedJobs.includes(job.id));

  function getClientForJob(job: Job) {
    if (job.clientId) {
      const matchedById = workspaceClients.find(
        (clientItem) => clientItem.id === job.clientId
      );

      if (matchedById) return matchedById;
    }

    return workspaceClients.find(
      (clientItem) =>
        clientItem.name.trim().toLowerCase() === job.client.trim().toLowerCase()
    );
  }

  function getInvoicesForJob(jobId: string) {
    return invoiceItems.filter((invoice) => invoice.jobId === jobId);
  }

  function getInvoiceTotalForJob(jobId: string) {
    return getInvoicesForJob(jobId).reduce(
      (total, invoice) => total + getInvoiceTotals(invoice).total,
      0
    );
  }

  function resetForm() {
    setClientId("");
    setJobName("");
    setStatus("Lead");
    setValue("");
    setDate("");
    setTime("");
    setNotes("");
    setMaterialName("");
    setMaterialQuantity("");
    setMaterials([]);
  }

  function closeNewJobBox() {
    setNewJobOpen(false);
    resetForm();
  }

  function toggleJob(jobId: string) {
    setSelectedJobs((current) =>
      current.includes(jobId)
        ? current.filter((id) => id !== jobId)
        : [...current, jobId]
    );
  }

  function toggleAllWorkspaceJobs() {
    if (allWorkspaceJobsSelected) {
      setSelectedJobs((current) =>
        current.filter((jobId) => !workspaceJobs.some((job) => job.id === jobId))
      );
      return;
    }

    setSelectedJobs((current) => {
      const workspaceJobIds = workspaceJobs.map((job) => job.id);
      const preservedOtherWorkspaceSelections = current.filter(
        (jobId) => !workspaceJobIds.includes(jobId)
      );

      return [...preservedOtherWorkspaceSelections, ...workspaceJobIds];
    });
  }

  async function deleteSelectedJobs() {
    if (!canDeleteBusinessRecords) return;

    try {
      const results = await Promise.all(
        selectedJobs.map((id) => deleteJobAction(jobsRepository, id, activeWorkspace.id))
      );
      const deletedIds = selectedJobs.filter((_, i) => results[i].ok);
      const failedDelete = results.find((result) => !result.ok);
      if (failedDelete && !deletedIds.length) {
        setDataError(failedDelete.ok ? "Unable to delete jobs." : failedDelete.error);
        return;
      }
      if (isDatabaseMode) setDatabaseJobItems((c) => c.filter((j) => !deletedIds.includes(j.id)));
      setSelectedJobs([]);
      setDataError("");
    } catch (error) {
      setDataError(error instanceof Error ? error.message : "Unable to delete jobs.");
    }
  }

  function addMaterial() {
    if (!materialName.trim()) return;

    const quantity = Number(materialQuantity);
    if (Number.isNaN(quantity) || quantity <= 0) return;

    setMaterials((current) => [...current, { name: materialName.trim(), quantity }]);
    setMaterialName("");
    setMaterialQuantity("");
  }

  function removeMaterial(indexToRemove: number) {
    setMaterials((current) => current.filter((_, index) => index !== indexToRemove));
  }

  async function createJob(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!clientId || !jobName.trim()) return;

    const selectedClient = workspaceClients.find(
      (clientItem) => clientItem.id === clientId
    );

    if (!selectedClient) return;

    const formattedValue = value.trim()
      ? value.trim().startsWith("$")
        ? value.trim()
        : `$${value.trim()}`
      : "$0";

    const newJob: Job = {
      id: crypto.randomUUID(),
      workspaceId: activeWorkspace.id,
      name: jobName.trim(),
      clientId: selectedClient.id,
      client: selectedClient.name,
      status,
      value: formattedValue,
      date,
      time,
      materials,
      notes,
    };

    try {
      const result = await createJobAction(jobsRepository, newJob);
      if (!result.ok) {
        setDataError(result.error);
        return;
      }
      const created = result.data;
      if (isDatabaseMode) setDatabaseJobItems((c) => [...c, created]);
      setDataError("");
      closeNewJobBox();
    } catch (error) {
      setDataError(error instanceof Error ? error.message : "Unable to create job.");
    }
  }

  return (
    <div className="space-y-6 text-gray-950 dark:text-gray-100">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setNewJobOpen(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            + Add New Job
          </button>

          <button
            type="button"
            onClick={deleteSelectedJobs}
            disabled={selectedJobs.length === 0 || !canDeleteBusinessRecords}
            className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Delete Job
          </button>
        </div>
      </div>

      {selectedJobs.length > 0 && (
        <div className="rounded-lg bg-gray-900 p-4 text-white">
          {selectedJobs.length} job{selectedJobs.length === 1 ? "" : "s"} selected
        </div>
      )}

      {dataError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {dataError}
        </div>
      )}

      {isLoadingData && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
          Loading jobs...
        </div>
      )}

      {newJobOpen && (
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-900">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold">Add New Job</h2>
            <button type="button" onClick={closeNewJobBox} className="text-2xl text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">-</button>
          </div>

          <form onSubmit={createJob} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium">Client</label>
              <select
                value={clientId}
                onChange={(event) => setClientId(event.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800"
              >
                <option value="">Select Client</option>
                {workspaceClients.map((clientItem) => (
                  <option key={clientItem.id} value={clientItem.id}>
                    {clientItem.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Job Name</label>
              <input
                type="text"
                value={jobName}
                onChange={(event) => setJobName(event.target.value)}
                placeholder="Spring Cleanup"
                required
                className="w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Status</label>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as JobStatus)}
                className="w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800"
              >
                <option>Lead</option>
                <option>Quoted</option>
                <option>Scheduled</option>
                <option>Completed</option>
                <option>Paid</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Scheduled Date</label>
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Scheduled Time</label>
              <input
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
                className="w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Estimated Value</label>
              <input
                type="number"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder="450"
                className="w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800"
              />
            </div>

            <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
              <h3 className="text-xl font-semibold">Materials</h3>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_160px_auto]">
                <input
                  type="text"
                  value={materialName}
                  onChange={(event) => setMaterialName(event.target.value)}
                  placeholder="Material name"
                  className="rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800"
                />
                <input
                  type="number"
                  value={materialQuantity}
                  onChange={(event) => setMaterialQuantity(event.target.value)}
                  placeholder="Quantity"
                  className="rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800"
                />
                <button type="button" onClick={addMaterial} className="rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700">
                  Add Material
                </button>
              </div>

              <div className="mt-4 space-y-2">
                {materials.length > 0 ? (
                  materials.map((material, index) => (
                    <div key={`${material.name}-${index}`} className="flex items-center justify-between rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
                      <span>{material.quantity} - {material.name}</span>
                      <button type="button" onClick={() => removeMaterial(index)} className="text-sm text-red-600 hover:underline dark:text-red-400">Remove</button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No materials added yet.</p>
                )}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Notes</label>
              <textarea
                rows={5}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Job details..."
                className="w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800"
              />
            </div>

            <div className="flex gap-3">
              <button type="submit" className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700">Create Job</button>
              <button type="button" onClick={closeNewJobBox} className="rounded-lg bg-red-600 px-6 py-3 text-white hover:bg-red-700">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg bg-white shadow dark:bg-gray-900">
        <table className="min-w-[980px] w-full">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr className="text-left text-gray-700 dark:text-gray-300">
              <th className="w-12 p-4">
                <input
                  type="checkbox"
                  checked={allWorkspaceJobsSelected}
                  onChange={toggleAllWorkspaceJobs}
                  disabled={workspaceJobs.length === 0}
                  className="h-4 w-4"
                />
              </th>
              <th className="p-4">Job</th>
              <th className="p-4">Client</th>
              <th className="p-4">Status</th>
              <th className="p-4">Date</th>
              <th className="p-4 text-right">Value</th>
              <th className="p-4 text-right">Invoice</th>
            </tr>
          </thead>

          <tbody>
            {workspaceJobs.length > 0 ? (
              workspaceJobs.map((job) => {
                const matchedClient = getClientForJob(job);
                const jobInvoices = getInvoicesForJob(job.id);
                const invoiceTotal = getInvoiceTotalForJob(job.id);
                const firstInvoice = jobInvoices[0];

                return (
                  <tr key={job.id} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedJobs.includes(job.id)}
                        onChange={() => toggleJob(job.id)}
                        className="h-4 w-4"
                      />
                    </td>

                    <td className="p-4 font-medium">
                      <Link href={`/jobs/${job.id}`} className="text-blue-600 hover:underline dark:text-blue-400">
                        {job.name}
                      </Link>
                    </td>

                    <td className="p-4">
                      {matchedClient ? (
                        <Link href={`/clients/${matchedClient.id}`} className="text-blue-600 hover:underline dark:text-blue-400">
                          {job.client}
                        </Link>
                      ) : (
                        <span>{job.client}</span>
                      )}
                    </td>

                    <td className="p-4">
                      <span className={`rounded px-3 py-1 text-xs font-medium text-white ${getStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                    </td>

                    <td className="p-4">
                      {job.date || "-"}{job.time ? ` at ${job.time}` : ""}
                    </td>
                    <td className="p-4 text-right font-medium">{job.value}</td>
                    <td className="p-4 text-right">
                      {firstInvoice ? (
                        <div>
                          <Link href={`/invoices/${firstInvoice.id}`} className="font-medium text-blue-600 hover:underline dark:text-blue-400">
                            {firstInvoice.invoiceNumber}
                          </Link>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {jobInvoices.length > 1 ? `${jobInvoices.length} invoices - ` : ""}
                            {formatCurrency(invoiceTotal)}
                          </div>
                        </div>
                      ) : (
                        <Link href={`/invoices/new?jobId=${job.id}`} className="text-sm text-blue-600 hover:underline dark:text-blue-400">
                          Create
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="p-10 text-center text-lg text-gray-500 dark:text-gray-400">
                  No jobs found for {workspaceDisplayName}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
