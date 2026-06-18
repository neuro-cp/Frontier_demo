"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthSession } from "@/components/AuthSessionProvider";
import { useWorkspace } from "@/components/WorkspaceContext";
import { storageKeys, useStoredJsonState } from "@/lib/clientStorage";
import { createDocumentsRepository, type StoredDocument } from "@/lib/db/documents";
import { createInvoicesRepository } from "@/lib/db/invoices";
import type { InvoiceRow } from "@/lib/frontierInvoices";
import {
  DOCUMENT_STORAGE_BUCKET,
  buildDocumentStoragePath,
  createDocumentDownloadUrl,
  getDocumentEntity,
  removeDocumentFile,
  uploadDocumentFile,
} from "@/lib/storage";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type ClientLike = {
  id: string;
  workspaceId: string;
  name: string;
};

type JobLike = {
  id: string;
  workspaceId: string;
  jobName?: string;
  name?: string;
  clientId?: string;
  client?: string;
};

function getJobDisplayName(job: JobLike) {
  return job.jobName || job.name || "Untitled job";
}

export default function DocumentsPage() {
  const { activeWorkspace } = useWorkspace();
  const { isSupabaseConfigured, user } = useAuthSession();
  const isDatabaseMode = Boolean(isSupabaseConfigured && user);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [localDocuments, setLocalDocuments] = useStoredJsonState<StoredDocument[]>(
    storageKeys.documents,
    []
  );
  const [databaseDocuments, setDatabaseDocuments] = useState<StoredDocument[]>([]);
  const [clients] = useStoredJsonState<ClientLike[]>(
    storageKeys.clients,
    []
  );
  const [jobs] = useStoredJsonState<JobLike[]>(
    storageKeys.jobs,
    []
  );
  const [localInvoices, setLocalInvoices] = useStoredJsonState<InvoiceRow[]>(
    storageKeys.invoices,
    []
  );
  const [databaseInvoices, setDatabaseInvoices] = useState<InvoiceRow[]>([]);

  const [documentName, setDocumentName] = useState("");
  const [detectedType, setDetectedType] = useState("Pending");
  const [fileName, setFileName] = useState("");
  const [mimeType, setMimeType] = useState("");
  const [sizeBytes, setSizeBytes] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [clientId, setClientId] = useState("");
  const [jobId, setJobId] = useState("");
  const [invoiceId, setInvoiceId] = useState("");
  const [documentError, setDocumentError] = useState("");
  const [isSavingDocument, setIsSavingDocument] = useState(false);

  const supabase = useMemo(() => (isDatabaseMode ? createBrowserSupabaseClient() : null), [isDatabaseMode]);
  const documentsRepo = useMemo(() => createDocumentsRepository({ isSignedIn: isDatabaseMode, supabase, localDocuments, setLocalDocuments }), [isDatabaseMode, localDocuments, setLocalDocuments, supabase]);
  const invoicesRepo = useMemo(() => createInvoicesRepository({ isSignedIn: isDatabaseMode, supabase, localInvoices, setLocalInvoices }), [isDatabaseMode, localInvoices, setLocalInvoices, supabase]);
  const documents = isDatabaseMode ? databaseDocuments : localDocuments;
  const invoices = isDatabaseMode ? databaseInvoices : localInvoices;

  useEffect(() => {
    if (!isDatabaseMode) return;
    let cancelled = false;
    Promise.all([
      documentsRepo.getDocuments(activeWorkspace.id),
      invoicesRepo.getInvoices(activeWorkspace.id),
    ])
      .then(([items, invoiceItems]) => {
        if (!cancelled) {
          setDatabaseDocuments(items);
          setDatabaseInvoices(invoiceItems);
        }
      })
      .catch((error) => {
        if (!cancelled) setDocumentError(error instanceof Error ? error.message : "Unable to load documents.");
      });
    return () => { cancelled = true; };
  }, [activeWorkspace.id, documentsRepo, invoicesRepo, isDatabaseMode]);

  const workspaceDocuments = documents.filter(
    (document) => document.workspaceId === activeWorkspace.id
  );

  const workspaceClients = clients.filter(
    (client) => client.workspaceId === activeWorkspace.id
  );

  const workspaceJobs = jobs.filter(
    (job) => job.workspaceId === activeWorkspace.id
  );
  const workspaceInvoices = invoices.filter(
    (invoice) => invoice.workspaceId === activeWorkspace.id
  );

  const selectedClient = workspaceClients.find(
    (client) => client.id === clientId
  );

  const jobsForSelectedClient = selectedClient
    ? workspaceJobs.filter((job) => {
        if (job.clientId) {
          return job.clientId === selectedClient.id;
        }

        // Legacy localStorage jobs may only have a client name snapshot.
        return (
          (job.client ?? "").trim().toLowerCase() ===
          selectedClient.name.trim().toLowerCase()
        );
      })
    : [];

  function resetUploadForm() {
    setDocumentName("");
    setDetectedType("Pending");
    setFileName("");
    setMimeType("");
    setSizeBytes(0);
    setSelectedFile(null);
    setNotes("");
    setClientId("");
    setJobId("");
    setInvoiceId("");
  }

  function closeUploadModal() {
    setIsUploadOpen(false);
    resetUploadForm();
  }

  function handleClientChange(nextClientId: string) {
    setClientId(nextClientId);
    setJobId("");
  }

  async function saveUploadPlaceholder() {
    if (!documentName.trim()) return;
    setDocumentError("");
    setIsSavingDocument(true);

    const documentId = crypto.randomUUID();
    const entity = getDocumentEntity({ clientId, jobId, invoiceId });
    const storageFileName = selectedFile ? `${documentId}-${selectedFile.name}` : fileName;
    const storagePath = storageFileName
      ? buildDocumentStoragePath({
          workspaceId: activeWorkspace.id,
          entityType: entity.entityType,
          entityId: entity.entityId,
          fileName: storageFileName,
        })
      : "";

    const newDocument: StoredDocument = {
      id: documentId,
      workspaceId: activeWorkspace.id,
      name: documentName.trim(),
      detectedType,
      extractionStatus: "Waiting for extraction",
      fileName: selectedFile?.name || fileName || "No file selected",
      mimeType: selectedFile?.type || mimeType,
      sizeBytes: selectedFile?.size || sizeBytes,
      storageBucket: storagePath ? DOCUMENT_STORAGE_BUCKET : "",
      storagePath,
      storageStatus: storagePath ? "Stored" : "Pending storage setup",
      notes: notes.trim(),
      clientId,
      jobId,
      invoiceId,
      createdAt: new Date().toISOString(),
      uploadedBy: user?.id,
    };

    try {
      if (isDatabaseMode && supabase && selectedFile && storagePath) {
        await uploadDocumentFile({ supabase, path: storagePath, file: selectedFile });
      }

      const created = await documentsRepo.createDocument(newDocument);
      if (!created) return;
      if (isDatabaseMode) setDatabaseDocuments((current) => [created, ...current]);
      closeUploadModal();
    } catch (error) {
      if (isDatabaseMode && supabase && storagePath) {
        try {
          await removeDocumentFile({ supabase, path: storagePath });
        } catch (cleanupError) {
          console.error("Unable to clean up failed document upload.", cleanupError);
        }
      }
      setDocumentError(error instanceof Error ? error.message : "Unable to save document.");
    } finally {
      setIsSavingDocument(false);
    }
  }

  async function deleteDocument(documentId: string) {
    setDocumentError("");
    const document = workspaceDocuments.find((item) => item.id === documentId);
    if (!window.confirm(`Delete "${document?.fileName || document?.name || "this document"}"? This cannot be undone.`)) return;

    try {
      if (isDatabaseMode && supabase && document?.storagePath) {
        await removeDocumentFile({ supabase, path: document.storagePath });
      }
      const deleted = await documentsRepo.deleteDocument(documentId);
      if (!deleted) return;
      if (isDatabaseMode) setDatabaseDocuments((current) => current.filter((document) => document.id !== documentId));
    } catch (error) {
      setDocumentError(error instanceof Error ? error.message : "Unable to delete document.");
    }
  }

  async function downloadDocument(document: StoredDocument) {
    setDocumentError("");

    try {
      if (!isDatabaseMode || !supabase || !document.storagePath) {
        setDocumentError("This document does not have a stored cloud file yet.");
        return;
      }

      const url = await createDocumentDownloadUrl({ supabase, path: document.storagePath });
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      setDocumentError(error instanceof Error ? error.message : "Unable to download document.");
    }
  }

  function getClientName(documentClientId: string) {
    if (!documentClientId) return "-";

    const client = clients.find((item) => item.id === documentClientId);
    return client?.name ?? "Unknown client";
  }

  function getJobName(documentJobId: string) {
    if (!documentJobId) return "-";

    const job = jobs.find((item) => item.id === documentJobId);
    return job ? getJobDisplayName(job) : "Unknown job";
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <button
          type="button"
          onClick={() => setIsUploadOpen(true)}
          className="w-full rounded-lg bg-blue-600 px-6 py-3 text-center font-semibold text-white shadow hover:bg-blue-700 sm:w-auto"
        >
          + Upload Document
        </button>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
        upload once - extract intended use and data - verify - choose whether to
        create a client, job, quote, invoice, expense, or calendar item.
      </div>

      {documentError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {documentError}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <table className="min-w-[900px] w-full">
          <thead>
            <tr className="border-b border-gray-200 text-left text-sm uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:text-gray-400">
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Detected Type</th>
              <th className="px-6 py-4">Extraction Status</th>
              <th className="px-6 py-4">Client</th>
              <th className="px-6 py-4">Job</th>
              <th className="px-6 py-4">File</th>
              <th className="px-6 py-4">Storage</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {workspaceDocuments.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-16 text-center text-2xl text-gray-500 dark:text-gray-400"
                >
                  No documents uploaded for {activeWorkspace.name}
                </td>
              </tr>
            ) : (
              workspaceDocuments.map((document) => (
                <tr
                  key={document.id}
                  className="border-b border-gray-100 dark:border-gray-800"
                >
                  <td className="px-6 py-4 font-semibold">{document.name}</td>

                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {document.detectedType}
                  </td>

                  <td className="px-6 py-4">
                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-300">
                      {document.extractionStatus}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {getClientName(document.clientId)}
                  </td>

                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {getJobName(document.jobId)}
                  </td>

                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {document.fileName}
                  </td>

                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    <div>{document.storageStatus || "Pending storage setup"}</div>
                    <div className="text-xs text-gray-500">
                      {document.mimeType || "No MIME type"} {document.sizeBytes ? `- ${document.sizeBytes} bytes` : ""}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => downloadDocument(document)}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                      >
                        Download
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteDocument(document.id)}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/75 p-3 sm:items-center sm:p-4">
          <div className="my-4 max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-4 shadow-xl dark:bg-gray-900 sm:my-0 sm:p-6 lg:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-950 dark:text-gray-100 sm:text-2xl">
                Upload for Extraction
              </h2>

              <button
                type="button"
                onClick={closeUploadModal}
                className="text-2xl text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                -
              </button>
            </div>

            <form className="space-y-5 sm:space-y-6">
              <div>
                <label className="mb-2 block text-base font-medium text-gray-900 dark:text-gray-100 sm:text-lg">
                  Workspace
                </label>

                <input
                  value={activeWorkspace.name}
                  readOnly
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-700 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 sm:text-lg"
                />
              </div>

              <div>
                <label className="mb-2 block text-base font-medium text-gray-900 dark:text-gray-100 sm:text-lg">
                  Document Name
                </label>

                <input
                  type="text"
                  value={documentName}
                  onChange={(event) => setDocumentName(event.target.value)}
                  placeholder="Quote, invoice, receipt, handwritten note..."
                  className="w-full rounded-lg border border-blue-500 bg-white px-4 py-3 text-base text-gray-950 outline-none dark:bg-gray-800 dark:text-gray-100 sm:text-lg"
                />
              </div>

              <div>
                <label className="mb-2 block text-base font-medium text-gray-900 dark:text-gray-100 sm:text-lg">
                  Detected Type
                </label>

                <select
                  value={detectedType}
                  onChange={(event) => setDetectedType(event.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-base text-gray-950 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 sm:text-lg"
                >
                  <option>Pending</option>
                  <option>Invoice</option>
                  <option>Quote</option>
                  <option>Receipt</option>
                  <option>Contract</option>
                  <option>Job Note</option>
                  <option>Client Document</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-base font-medium text-gray-900 dark:text-gray-100 sm:text-lg">
                    Link Client
                  </label>

                  <select
                    value={clientId}
                    onChange={(event) => handleClientChange(event.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-base text-gray-950 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 sm:text-lg"
                  >
                    <option value="">No client</option>
                    {workspaceClients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-base font-medium text-gray-900 dark:text-gray-100 sm:text-lg">
                    Link Job
                  </label>

                  <select
                    value={jobId}
                    onChange={(event) => setJobId(event.target.value)}
                    disabled={!clientId}
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-base text-gray-950 outline-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:disabled:bg-gray-950 dark:disabled:text-gray-600"
                  >
                    <option value="">No job</option>
                    {jobsForSelectedClient.map((job) => (
                      <option key={job.id} value={job.id}>
                        {getJobDisplayName(job)}
                      </option>
                    ))}
                  </select>

                  {!clientId && (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Select a client first to show linked jobs.
                    </p>
                  )}

                  {clientId && jobsForSelectedClient.length === 0 && (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      No jobs found for the selected client.
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-base font-medium text-gray-900 dark:text-gray-100 sm:text-lg">
                  Link Invoice
                </label>

                <select
                  value={invoiceId}
                  onChange={(event) => setInvoiceId(event.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-base text-gray-950 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 sm:text-lg"
                >
                  <option value="">No invoice</option>
                  {workspaceInvoices.map((invoice) => (
                    <option key={invoice.id} value={invoice.id}>
                      {invoice.invoiceNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-base font-medium text-gray-900 dark:text-gray-100 sm:text-lg">
                  File
                </label>

                <input
                  type="file"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    setSelectedFile(file ?? null);
                    setFileName(file?.name ?? "");
                    setMimeType(file?.type ?? "");
                    setSizeBytes(file?.size ?? 0);
                  }}
                  className="block w-full text-sm text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-base font-medium text-gray-900 dark:text-gray-100 sm:text-lg">
                  Notes
                </label>

                <textarea
                  rows={3}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Optional context for later extraction."
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 sm:text-lg"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeUploadModal}
                  className="w-full rounded-lg border border-gray-200 px-6 py-3 text-base text-gray-900 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800 sm:w-auto sm:text-lg"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={saveUploadPlaceholder}
                  disabled={isSavingDocument}
                  className="w-full rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white hover:bg-blue-700 sm:w-auto sm:text-lg"
                >
                  {isSavingDocument ? "Uploading..." : "Save Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
