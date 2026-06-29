"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import DocumentAttachments from "@/app/documents/DocumentAttachments";
import { useAuthSession } from "@/components/AuthSessionProvider";
import { updateJobAction } from "@/lib/actions/jobs";
import { storageKeys, useStoredJsonState } from "@/lib/clientStorage";
import type { ClientRow } from "@/lib/clientTypes";
import { createClientsRepository } from "@/lib/db/clients";
import { createInventoryRepository, type InventoryRow } from "@/lib/db/inventory";
import { createInvoicesRepository } from "@/lib/db/invoices";
import { createJobsRepository } from "@/lib/db/jobs";
import type { Job, JobMaterial, JobStatus } from "@/lib/jobTypes";
import {
  formatCurrency,
  getInvoiceTotals,
  InvoiceRow,
} from "@/lib/frontierInvoices";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { formatDateTime12Hour } from "@/lib/formatDateTime";

const jobStatuses: JobStatus[] = ["Lead", "Quoted", "Scheduled", "Completed", "Paid"];

type MaterialOption = {
  key: string;
  label: string;
  details: string;
  searchText: string;
};

type MaterialCatalogRow = {
  id: string;
  inventory_item_id: string;
  name: string;
  category: string | null;
  unit: string | null;
  default_cost_cents: number | null;
  retail_price_cents: number | null;
  preferred_vendor: string | null;
  vendor_sku: string | null;
  variant_name: string | null;
};

type VendorSkuRow = {
  id: string;
  material_id: string;
  vendor_name: string;
  sku: string;
  unit_cost_cents: number | null;
  retail_price_cents: number | null;
  variant_name: string | null;
  notes: string | null;
};

function getStatusClasses(status: string) {
  switch (status) {
    case "Lead":
      return "bg-gray-400 text-gray-900";
    case "Quoted":
      return "bg-yellow-100 text-yellow-700";
    case "Scheduled":
      return "bg-blue-100 text-blue-700";
    case "Completed":
      return "bg-green-100 text-green-700";
    case "Paid":
      return "bg-purple-100 text-purple-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function JobPage() {
  const params = useParams();
  const id = String(params.id);
  const { isSupabaseConfigured, user } = useAuthSession();
  const isDatabaseMode = Boolean(isSupabaseConfigured && user);

  const [localJobItems, setLocalJobItems] = useStoredJsonState<Job[]>(
    storageKeys.jobs,
    []
  );
  const [localClientItems, setLocalClientItems] = useStoredJsonState<ClientRow[]>(
    storageKeys.clients,
    []
  );
  const [localInventoryItems, setLocalInventoryItems] = useStoredJsonState<InventoryRow[]>(
    storageKeys.inventory,
    []
  );
  const [databaseJob, setDatabaseJob] = useState<Job | null>(null);
  const [databaseClients, setDatabaseClients] = useState<ClientRow[]>([]);
  const [databaseInventoryItems, setDatabaseInventoryItems] = useState<InventoryRow[]>([]);
  const [materialOptions, setMaterialOptions] = useState<MaterialOption[]>([]);
  const [localInvoiceItems, setLocalInvoiceItems] = useStoredJsonState<InvoiceRow[]>(
    storageKeys.invoices,
    []
  );
  const [databaseInvoices, setDatabaseInvoices] = useState<InvoiceRow[]>([]);
  const [isLoadingJob, setIsLoadingJob] = useState(false);
  const [dataError, setDataError] = useState("");
  const [editOpen, setEditOpen] = useState(false);

  const [editName, setEditName] = useState("");
  const [editClientId, setEditClientId] = useState("");
  const [editStatus, setEditStatus] = useState<JobStatus>("Lead");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editValue, setEditValue] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const [editMaterials, setEditMaterials] = useState<JobMaterial[]>([]);
  const [editMaterialName, setEditMaterialName] = useState("");
  const [editMaterialQuantity, setEditMaterialQuantity] = useState("");

  const supabase = useMemo(() => (isDatabaseMode ? createBrowserSupabaseClient() : null), [isDatabaseMode]);
  const jobsRepository = useMemo(() => createJobsRepository({ isSignedIn: isDatabaseMode, supabase, localJobs: localJobItems, setLocalJobs: setLocalJobItems }), [isDatabaseMode, localJobItems, setLocalJobItems, supabase]);
  const clientsRepository = useMemo(() => createClientsRepository({ isSignedIn: isDatabaseMode, supabase, localClients: localClientItems, setLocalClients: setLocalClientItems }), [isDatabaseMode, localClientItems, setLocalClientItems, supabase]);
  const inventoryRepository = useMemo(() => createInventoryRepository({ isSignedIn: isDatabaseMode, supabase, localItems: localInventoryItems, setLocalItems: setLocalInventoryItems }), [isDatabaseMode, localInventoryItems, setLocalInventoryItems, supabase]);
  const invoicesRepository = useMemo(() => createInvoicesRepository({ isSignedIn: isDatabaseMode, supabase, localInvoices: localInvoiceItems, setLocalInvoices: setLocalInvoiceItems }), [isDatabaseMode, localInvoiceItems, setLocalInvoiceItems, supabase]);
  const job = isDatabaseMode ? databaseJob : localJobItems.find((item) => item.id === id);
  const clientItems = isDatabaseMode ? databaseClients : localClientItems;
  const inventoryItems = isDatabaseMode ? databaseInventoryItems : localInventoryItems;
  const invoiceItems = isDatabaseMode ? databaseInvoices : localInvoiceItems;

  useEffect(() => {
    if (!isDatabaseMode) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) {
        setIsLoadingJob(true);
        setDataError("");
      }
    });
    jobsRepository.getJobById(id).then(async (loadedJob) => {
      if (cancelled) return;
      setDatabaseJob(loadedJob);
      if (loadedJob) {
        const [clients, invoices, inventory] = await Promise.all([
          clientsRepository.getClients(loadedJob.workspaceId),
          invoicesRepository.getInvoices(loadedJob.workspaceId),
          inventoryRepository.getInventoryItems(loadedJob.workspaceId),
        ]);
        if (!cancelled) {
          setDatabaseClients(clients);
          setDatabaseInvoices(invoices);
          setDatabaseInventoryItems(inventory);
        }
      }
    }).catch((error) => {
      if (!cancelled) setDataError(error instanceof Error ? error.message : "Unable to load job.");
    }).finally(() => {
      if (!cancelled) setIsLoadingJob(false);
    });
    return () => { cancelled = true; };
  }, [clientsRepository, id, inventoryRepository, invoicesRepository, isDatabaseMode, jobsRepository]);
  const workspaceClients = job
    ? clientItems.filter((client) => client.workspaceId === job.workspaceId)
    : [];
  const jobInvoices = invoiceItems.filter((invoice) => invoice.jobId === id);
  const invoiceTotal = jobInvoices.reduce(
    (total, invoice) => total + getInvoiceTotals(invoice).total,
    0
  );

  useEffect(() => {
    if (!job) return;

    const workspaceInventory = inventoryItems.filter(
      (item) => item.workspaceId === job.workspaceId
    );

    if (!isDatabaseMode || !supabase) {
      const nextOptions = workspaceInventory.map((item) => {
          const details = [
            item.unit ? `Unit: ${item.unit}` : undefined,
            item.storageLocation ? `Location: ${item.storageLocation}` : undefined,
            item.currentQty != null ? `Current: ${item.currentQty}` : undefined,
            item.targetQty != null ? `Target: ${item.targetQty}` : undefined,
          ].filter(Boolean).join(" | ");
          return {
            key: item.id ?? item.name,
            label: item.name,
            details: details || "Inventory item",
            searchText: `${item.name} ${details}`.toLowerCase(),
          };
        });
      queueMicrotask(() => setMaterialOptions(nextOptions));
      return;
    }

    let cancelled = false;
    Promise.all([
      supabase
        .from("material_catalog_items")
        .select("id, inventory_item_id, name, category, unit, default_cost_cents, retail_price_cents, preferred_vendor, vendor_sku, variant_name")
        .eq("workspace_id", job.workspaceId),
      supabase
        .from("material_vendor_skus")
        .select("id, material_id, vendor_name, sku, unit_cost_cents, retail_price_cents, variant_name, notes")
        .eq("workspace_id", job.workspaceId),
    ])
      .then(([catalogResult, skuResult]) => {
        if (cancelled) return;
        const catalogs = (catalogResult.data ?? []) as MaterialCatalogRow[];
        const skus = (skuResult.data ?? []) as VendorSkuRow[];
        const options: MaterialOption[] = [];

        for (const item of workspaceInventory) {
          const catalog = catalogs.find((row) => row.inventory_item_id === item.id);
          const baseDetails = [
            catalog?.category,
            catalog?.unit ? `Unit: ${catalog.unit}` : item.unit ? `Unit: ${item.unit}` : undefined,
            catalog?.preferred_vendor ? `Vendor: ${catalog.preferred_vendor}` : undefined,
            catalog?.vendor_sku ? `SKU: ${catalog.vendor_sku}` : undefined,
            catalog?.variant_name,
            catalog?.default_cost_cents != null ? `Cost: $${(catalog.default_cost_cents / 100).toFixed(2)}` : undefined,
            catalog?.retail_price_cents != null ? `Retail: $${(catalog.retail_price_cents / 100).toFixed(2)}` : undefined,
            item.storageLocation ? `Location: ${item.storageLocation}` : undefined,
          ].filter(Boolean).join(" | ");
          const baseLabel = [
            item.name,
            catalog?.preferred_vendor,
            catalog?.vendor_sku ? `SKU ${catalog.vendor_sku}` : undefined,
            catalog?.variant_name,
          ].filter(Boolean).join(" - ");

          options.push({
            key: item.id ?? item.name,
            label: baseLabel || item.name,
            details: baseDetails || "Inventory item",
            searchText: `${item.name} ${baseLabel} ${baseDetails}`.toLowerCase(),
          });

          if (!catalog) continue;
          for (const sku of skus.filter((row) => row.material_id === catalog.id)) {
            const skuDetails = [
              `Vendor: ${sku.vendor_name}`,
              `SKU: ${sku.sku}`,
              sku.variant_name,
              sku.unit_cost_cents != null ? `Cost: $${(sku.unit_cost_cents / 100).toFixed(2)}` : undefined,
              sku.retail_price_cents != null ? `Retail: $${(sku.retail_price_cents / 100).toFixed(2)}` : undefined,
              sku.notes,
            ].filter(Boolean).join(" | ");
            const skuLabel = `${item.name} - ${sku.vendor_name} - SKU ${sku.sku}${sku.variant_name ? ` - ${sku.variant_name}` : ""}`;
            options.push({
              key: `${item.id}:${sku.id}`,
              label: skuLabel,
              details: skuDetails,
              searchText: `${skuLabel} ${skuDetails}`.toLowerCase(),
            });
          }
        }

        setMaterialOptions(options);
      })
      .catch(() => {
        if (!cancelled) setMaterialOptions([]);
      });

    return () => {
      cancelled = true;
    };
  }, [inventoryItems, isDatabaseMode, job, supabase]);

  const filteredMaterialOptions = useMemo(() => {
    const query = editMaterialName.trim().toLowerCase();
    const options = query
      ? materialOptions.filter((option) => option.searchText.includes(query))
      : materialOptions;
    return options.slice(0, 8);
  }, [editMaterialName, materialOptions]);

  function getClientForJob(jobItem: Job) {
    if (jobItem.clientId) {
      const matchedById = workspaceClients.find(
        (client) => client.id === jobItem.clientId
      );

      if (matchedById) return matchedById;
    }

    return workspaceClients.find(
      (client) =>
        client.name.trim().toLowerCase() ===
        jobItem.client.trim().toLowerCase()
    );
  }

  function openEditBox() {
    if (!job) return;
    const matchedClient = getClientForJob(job);

    setEditName(job.name);
    setEditClientId(matchedClient?.id ?? "");
    setEditStatus(job.status);
    setEditDate(job.date);
    setEditTime(job.time ?? "");
    setEditValue(job.value.replace("$", "").replace(",", ""));
    setEditNotes(job.notes ?? "");
    setEditMaterials(job.materials ?? []);
    setEditMaterialName("");
    setEditMaterialQuantity("");
    setEditOpen(true);
  }

  function closeEditBox() {
    setEditOpen(false);
    setEditMaterialName("");
    setEditMaterialQuantity("");
  }

  function addEditMaterial() {
    if (!editMaterialName.trim()) return;

    const quantity = Number(editMaterialQuantity);
    if (Number.isNaN(quantity) || quantity <= 0) return;

    setEditMaterials((current) => [...current, { name: editMaterialName.trim(), quantity }]);
    setEditMaterialName("");
    setEditMaterialQuantity("");
  }

  function removeEditMaterial(indexToRemove: number) {
    setEditMaterials((current) => current.filter((_, index) => index !== indexToRemove));
  }

  async function saveEditedJob() {
    if (!job) return;
    if (!editName.trim() || !editClientId) return;

    const selectedClient = workspaceClients.find(
      (client) => client.id === editClientId
    );

    if (!selectedClient) return;

    const formattedValue = editValue.trim()
      ? editValue.trim().startsWith("$")
        ? editValue.trim()
        : `$${editValue.trim()}`
      : "$0";

    const updatedJob: Job = {
      ...job,
      name: editName.trim(),
      clientId: selectedClient.id,
      client: selectedClient.name,
      status: editStatus,
      date: editDate,
      time: editTime,
      value: formattedValue,
      notes: editNotes,
      materials: editMaterials,
    };

    try {
      const result = await updateJobAction(jobsRepository, updatedJob);
      if (!result.ok) {
        setDataError(result.error);
        return;
      }
      const saved = result.data;
      if (isDatabaseMode) setDatabaseJob(saved);
      setDataError("");
      setEditOpen(false);
    } catch (error) {
      setDataError(error instanceof Error ? error.message : "Unable to update job.");
    }
  }

  async function markJobComplete() {
    if (!job || job.status === "Completed") return;
    const confirmed = window.confirm("Mark this job complete?");
    if (!confirmed) return;
    try {
      const result = await updateJobAction(jobsRepository, {
        ...job,
        status: "Completed",
        completedAt: job.completedAt ?? new Date().toISOString(),
      });
      if (!result.ok) {
        setDataError(result.error);
        return;
      }
      if (isDatabaseMode) setDatabaseJob(result.data);
      else setLocalJobItems((current) => current.map((item) => item.id === job.id ? result.data : item));
      setDataError("");
    } catch (error) {
      setDataError(error instanceof Error ? error.message : "Unable to complete job.");
    }
  }

  if (isLoadingJob) {
    return (
      <div className="space-y-4 p-6 text-gray-950 dark:text-gray-100">
        <h1 className="text-3xl font-bold">Loading job...</h1>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="space-y-4 p-6 text-gray-950 dark:text-gray-100">
        <h1 className="text-3xl font-bold">Job not found</h1>
        <p className="text-gray-500 dark:text-gray-400">
          {dataError || "This job does not exist in the current saved job list."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-gray-950 dark:text-gray-100">
      {dataError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {dataError}
        </div>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{job.name}</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">{job.client}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/invoices/new?jobId=${job.id}`}
            className="rounded-lg border border-blue-600 px-5 py-3 font-semibold text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30"
          >
            Create Invoice
          </Link>

          <button
            type="button"
            onClick={openEditBox}
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Edit Job
          </button>
          {job.status !== "Completed" && (
            <button
              type="button"
              onClick={markJobComplete}
              className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
            >
              Mark Complete
            </button>
          )}
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-900">
        <h2 className="mb-4 text-xl font-semibold">Job Information</h2>
        <div className="space-y-3">
          <p><strong>Client:</strong> {job.client}</p>
          <div className="flex items-center gap-2">
            <strong>Status:</strong>
            <span className={`rounded-full px-3 py-1 text-sm font-semibold ${getStatusClasses(job.status)}`}>{job.status}</span>
          </div>
          <p><strong>Scheduled:</strong> {formatDateTime12Hour(job.date, job.time)}</p>
          {job.completedAt && <p><strong>Completed:</strong> {new Date(job.completedAt).toLocaleString()}</p>}
          <p><strong>Estimated Value:</strong> {job.value}</p>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-900">
        <h2 className="mb-4 text-xl font-semibold">Materials</h2>
        {job.materials && job.materials.length > 0 ? (
          <ul className="ml-6 list-disc">
            {job.materials.map((material, index) => (
              <li key={`${material.name}-${index}`}>{material.quantity} - {material.name}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No materials added.</p>
        )}
      </div>

      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-900">
        <h2 className="mb-4 text-xl font-semibold">Notes</h2>
        <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
          {job.notes || "No notes added."}
        </p>
      </div>

      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-900">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold">Invoices</h2>
          <Link href={`/invoices/new?jobId=${job.id}`} className="text-blue-600 hover:underline dark:text-blue-400">
            + Create invoice for this job
          </Link>
        </div>

        {jobInvoices.length > 0 ? (
          <div className="space-y-3">
            {jobInvoices.map((invoice) => (
              <div key={invoice.id} className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <Link href={`/invoices/${invoice.id}`} className="font-semibold text-blue-600 hover:underline dark:text-blue-400">
                      {invoice.invoiceNumber}
                    </Link>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {invoice.status} - {invoice.invoiceDate}
                    </p>
                  </div>
                  <div className="text-lg font-bold">
                    {formatCurrency(getInvoiceTotals(invoice).total)}
                  </div>
                </div>
              </div>
            ))}

            <div className="border-t border-gray-200 pt-3 text-right text-lg font-bold dark:border-gray-800">
              Invoice Total: {formatCurrency(invoiceTotal)}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No invoices attached to this job.</p>
        )}
      </div>

      <DocumentAttachments
        workspaceId={job.workspaceId}
        jobId={job.id}
        title="Job Documents"
      />

      {editOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-950 dark:text-gray-100">Edit Job</h2>
              <button type="button" onClick={closeEditBox} className="text-2xl text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">-</button>
            </div>

            <div className="space-y-4">
              <input type="text" value={editName} onChange={(event) => setEditName(event.target.value)} placeholder="Job Name" className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800" />
              <select value={editClientId} onChange={(event) => setEditClientId(event.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
                <option value="">Select Client</option>
                {workspaceClients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
              <select value={editStatus} onChange={(event) => setEditStatus(event.target.value as JobStatus)} className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
                {jobStatuses.map((statusItem) => <option key={statusItem}>{statusItem}</option>)}
              </select>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input type="date" value={editDate} onChange={(event) => setEditDate(event.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800" />
                <input type="time" value={editTime} onChange={(event) => setEditTime(event.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800" />
              </div>
              <input type="number" value={editValue} onChange={(event) => setEditValue(event.target.value)} placeholder="Estimated Value" className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800" />

              <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-950 dark:text-gray-100">Materials</h3>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_140px_auto]">
                  <div>
                    <input type="text" value={editMaterialName} onChange={(event) => setEditMaterialName(event.target.value)} placeholder="Search or type material name" className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800" />
                    {filteredMaterialOptions.length > 0 && (
                      <div className="mt-2 max-h-44 overflow-y-auto rounded-lg border border-gray-200 bg-white text-sm shadow-sm dark:border-gray-800 dark:bg-gray-950">
                        {filteredMaterialOptions.map((option) => (
                          <button
                            key={option.key}
                            type="button"
                            title={option.details}
                            onClick={() => setEditMaterialName(option.label)}
                            className="block w-full border-b border-gray-100 px-3 py-2 text-left last:border-b-0 hover:bg-blue-50 dark:border-gray-800 dark:hover:bg-blue-950/40"
                          >
                            <span className="block font-semibold">{option.label}</span>
                            <span className="block truncate text-xs text-gray-500 dark:text-gray-400">{option.details}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <input type="number" value={editMaterialQuantity} onChange={(event) => setEditMaterialQuantity(event.target.value)} placeholder="Qty" className="rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800" />
                  <button type="button" onClick={addEditMaterial} className="rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700">Add</button>
                </div>

                <div className="mt-4 space-y-2">
                  {editMaterials.length > 0 ? (
                    editMaterials.map((material, index) => (
                      <div key={`${material.name}-${index}`} className="flex items-center justify-between rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
                        <span>{material.quantity} - {material.name}</span>
                        <button type="button" onClick={() => removeEditMaterial(index)} className="text-sm text-red-600 hover:underline dark:text-red-400">Remove</button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No materials added.</p>
                  )}
                </div>
              </div>

              <textarea rows={4} value={editNotes} onChange={(event) => setEditNotes(event.target.value)} placeholder="Notes" className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800" />

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button type="button" onClick={closeEditBox} className="rounded-lg border border-gray-300 px-5 py-3 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800">Cancel</button>
                <button type="button" onClick={saveEditedJob} className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
