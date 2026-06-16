"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import { jobs as defaultJobs, Job, JobMaterial, JobStatus } from "@/lib/jobs";
import {
  formatCurrency,
  getInvoiceTotals,
  InvoiceRow,
  loadSavedInvoices,
} from "@/lib/frontierInvoices";

const jobStatuses: JobStatus[] = ["Lead", "Quoted", "Scheduled", "Completed", "Paid"];

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

  const [jobItems, setJobItems] = useState<Job[]>(defaultJobs);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const [editName, setEditName] = useState("");
  const [editClient, setEditClient] = useState("");
  const [editStatus, setEditStatus] = useState<JobStatus>("Lead");
  const [editDate, setEditDate] = useState("");
  const [editValue, setEditValue] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const [editMaterials, setEditMaterials] = useState<JobMaterial[]>([]);
  const [editMaterialName, setEditMaterialName] = useState("");
  const [editMaterialQuantity, setEditMaterialQuantity] = useState("");

  useEffect(() => {
    const savedJobs = localStorage.getItem("frontier-jobs");

    if (savedJobs) {
      try {
        setJobItems(JSON.parse(savedJobs));
      } catch {
        setJobItems(defaultJobs);
      }
    }

    setInvoiceItems(loadSavedInvoices());
    setLoaded(true);
  }, []);

  const job = jobItems.find((item) => item.id === id);
  const jobInvoices = invoiceItems.filter((invoice) => invoice.jobId === id);
  const invoiceTotal = jobInvoices.reduce(
    (total, invoice) => total + getInvoiceTotals(invoice).total,
    0
  );

  function openEditBox() {
    if (!job) return;

    setEditName(job.name);
    setEditClient(job.client);
    setEditStatus(job.status);
    setEditDate(job.date);
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

  function saveEditedJob() {
    if (!job) return;
    if (!editName.trim() || !editClient.trim()) return;

    const formattedValue = editValue.trim()
      ? editValue.trim().startsWith("$")
        ? editValue.trim()
        : `$${editValue.trim()}`
      : "$0";

    const updatedJobs = jobItems.map((item) =>
      item.id === job.id
        ? {
            ...item,
            name: editName.trim(),
            client: editClient.trim(),
            status: editStatus,
            date: editDate,
            value: formattedValue,
            notes: editNotes,
            materials: editMaterials,
          }
        : item
    );

    setJobItems(updatedJobs);
    localStorage.setItem("frontier-jobs", JSON.stringify(updatedJobs));
    setEditOpen(false);
  }

  if (!loaded) return null;

  if (!job) {
    return (
      <div className="space-y-4 p-6 text-gray-950 dark:text-gray-100">
        <h1 className="text-3xl font-bold">Job not found</h1>
        <p className="text-gray-500 dark:text-gray-400">
          This job does not exist in the current saved job list.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-gray-950 dark:text-gray-100">
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
          <p><strong>Scheduled Date:</strong> {job.date || "—"}</p>
          <p><strong>Estimated Value:</strong> {job.value}</p>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-900">
        <h2 className="mb-4 text-xl font-semibold">Materials</h2>
        {job.materials && job.materials.length > 0 ? (
          <ul className="ml-6 list-disc">
            {job.materials.map((material, index) => (
              <li key={`${material.name}-${index}`}>{material.quantity} × {material.name}</li>
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
                      {invoice.status} · {invoice.invoiceDate}
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

      {editOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-950 dark:text-gray-100">Edit Job</h2>
              <button type="button" onClick={closeEditBox} className="text-2xl text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">×</button>
            </div>

            <div className="space-y-4">
              <input type="text" value={editName} onChange={(event) => setEditName(event.target.value)} placeholder="Job Name" className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800" />
              <input type="text" value={editClient} onChange={(event) => setEditClient(event.target.value)} placeholder="Client" className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800" />
              <select value={editStatus} onChange={(event) => setEditStatus(event.target.value as JobStatus)} className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
                {jobStatuses.map((statusItem) => <option key={statusItem}>{statusItem}</option>)}
              </select>
              <input type="date" value={editDate} onChange={(event) => setEditDate(event.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800" />
              <input type="number" value={editValue} onChange={(event) => setEditValue(event.target.value)} placeholder="Estimated Value" className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800" />

              <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-950 dark:text-gray-100">Materials</h3>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_140px_auto]">
                  <input type="text" value={editMaterialName} onChange={(event) => setEditMaterialName(event.target.value)} placeholder="Material name" className="rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800" />
                  <input type="number" value={editMaterialQuantity} onChange={(event) => setEditMaterialQuantity(event.target.value)} placeholder="Qty" className="rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800" />
                  <button type="button" onClick={addEditMaterial} className="rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700">Add</button>
                </div>

                <div className="mt-4 space-y-2">
                  {editMaterials.length > 0 ? (
                    editMaterials.map((material, index) => (
                      <div key={`${material.name}-${index}`} className="flex items-center justify-between rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
                        <span>{material.quantity} × {material.name}</span>
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
