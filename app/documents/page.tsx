"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthSession } from "@/components/AuthSessionProvider";
import { useWorkspace } from "@/components/WorkspaceContext";
import {
  createDocumentAction,
  deleteDocumentAction,
  updateDocumentAction,
} from "@/lib/actions/documents";
import { storageKeys, useStoredJsonState } from "@/lib/clientStorage";
import type { ClientRow } from "@/lib/clientTypes";
import { createClientsRepository } from "@/lib/db/clients";
import {
  createDocumentsRepository,
  type DocumentProcessingStatus,
  type StoredDocument,
} from "@/lib/db/documents";
import { createInvoicesRepository } from "@/lib/db/invoices";
import { createJobsRepository } from "@/lib/db/jobs";
import type { InvoiceRow } from "@/lib/frontierInvoices";
import type { Job } from "@/lib/jobTypes";
import {
  DOCUMENT_STORAGE_BUCKET,
  buildDocumentStoragePath,
  createDocumentDownloadUrl,
  getDocumentEntity,
  removeDocumentFile,
  uploadDocumentFile,
} from "@/lib/storage";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getWorkspaceDisplayName } from "@/lib/workspaceDisplay";

type ApiDocument = {
  id: string;
  workspace_id: string;
  client_id: string | null;
  job_id: string | null;
  invoice_id?: string | null;
  name: string;
  detected_type: string | null;
  extraction_status: string | null;
  file_name: string | null;
  notes: string | null;
  created_at: string;
  uploaded_by?: string | null;
  status?: string | null;
  storage_bucket: string | null;
  storage_path: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  processing_status?: DocumentProcessingStatus | null;
  extracted_text?: string | null;
  extracted_json?: Record<string, unknown> | null;
  ocr_provider?: string | null;
  ai_job_id?: string | null;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  confidence?: number | null;
  document_type?: string | null;
};

function getJobDisplayName(job: Job) {
  return job.name || "Untitled job";
}

function apiDocumentToStoredDocument(document: ApiDocument): StoredDocument {
  return {
    id: document.id,
    workspaceId: document.workspace_id,
    clientId: document.client_id ?? "",
    jobId: document.job_id ?? "",
    invoiceId: document.invoice_id ?? "",
    name: document.name,
    detectedType: document.detected_type ?? "Pending",
    extractionStatus: document.extraction_status ?? "Waiting for extraction",
    fileName: document.file_name ?? "No file selected",
    notes: document.notes ?? "",
    createdAt: document.created_at,
    uploadedBy: document.uploaded_by ?? "",
    status: document.status ?? "Metadata available",
    storageBucket: document.storage_bucket ?? "",
    storagePath: document.storage_path ?? "",
    mimeType: document.mime_type ?? "",
    sizeBytes: document.size_bytes ?? 0,
    storageStatus: document.storage_path ? "Stored" : "Pending storage setup",
    processingStatus: document.processing_status ?? "uploaded",
    extractedText: document.extracted_text ?? "",
    extractedJson: document.extracted_json ?? null,
    ocrProvider: document.ocr_provider ?? "",
    aiJobId: document.ai_job_id ?? "",
    reviewedAt: document.reviewed_at ?? "",
    reviewedBy: document.reviewed_by ?? "",
    confidence: document.confidence ?? null,
    documentType: document.document_type ?? document.detected_type ?? "",
  };
}

export default function DocumentsPage() {
  const { activeWorkspace, canDeleteBusinessRecords } = useWorkspace();
  const { isSupabaseConfigured, user } = useAuthSession();
  const isDatabaseMode = Boolean(isSupabaseConfigured && user);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [localDocuments, setLocalDocuments] = useStoredJsonState<StoredDocument[]>(
    storageKeys.documents,
    []
  );
  const [databaseDocuments, setDatabaseDocuments] = useState<StoredDocument[]>([]);
  const [localClients, setLocalClients] = useStoredJsonState<ClientRow[]>(
    storageKeys.clients,
    []
  );
  const [databaseClients, setDatabaseClients] = useState<ClientRow[]>([]);
  const [localJobs, setLocalJobs] = useStoredJsonState<Job[]>(
    storageKeys.jobs,
    []
  );
  const [databaseJobs, setDatabaseJobs] = useState<Job[]>([]);
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
  const [documentNotice, setDocumentNotice] = useState("");
  const [isSavingDocument, setIsSavingDocument] = useState(false);
  const [processingDocumentIds, setProcessingDocumentIds] = useState<string[]>([]);
  const [draftingDocumentIds, setDraftingDocumentIds] = useState<string[]>([]);
  const [reviewDocumentId, setReviewDocumentId] = useState("");
  const [reviewDocumentType, setReviewDocumentType] = useState("unknown");
  const [reviewText, setReviewText] = useState("");
  const [reviewJsonText, setReviewJsonText] = useState("");

  const supabase = useMemo(() => (isDatabaseMode ? createBrowserSupabaseClient() : null), [isDatabaseMode]);
  const documentsRepo = useMemo(() => createDocumentsRepository({ isSignedIn: isDatabaseMode, supabase, localDocuments, setLocalDocuments }), [isDatabaseMode, localDocuments, setLocalDocuments, supabase]);
  const invoicesRepo = useMemo(() => createInvoicesRepository({ isSignedIn: isDatabaseMode, supabase, localInvoices, setLocalInvoices }), [isDatabaseMode, localInvoices, setLocalInvoices, supabase]);
  const clientsRepo = useMemo(() => createClientsRepository({ isSignedIn: isDatabaseMode, supabase, localClients, setLocalClients }), [isDatabaseMode, localClients, setLocalClients, supabase]);
  const jobsRepo = useMemo(() => createJobsRepository({ isSignedIn: isDatabaseMode, supabase, localJobs, setLocalJobs }), [isDatabaseMode, localJobs, setLocalJobs, supabase]);
  const documents = isDatabaseMode ? databaseDocuments : localDocuments;
  const invoices = isDatabaseMode ? databaseInvoices : localInvoices;
  const clients = isDatabaseMode ? databaseClients : localClients;
  const jobs = isDatabaseMode ? databaseJobs : localJobs;

  useEffect(() => {
    if (!isDatabaseMode) return;
    let cancelled = false;
    Promise.all([
      documentsRepo.getDocuments(activeWorkspace.id),
      invoicesRepo.getInvoices(activeWorkspace.id),
      clientsRepo.getClients(activeWorkspace.id),
      jobsRepo.getJobs(activeWorkspace.id),
    ])
      .then(([items, invoiceItems, clientItems, jobItems]) => {
        if (!cancelled) {
          setDatabaseDocuments(items);
          setDatabaseInvoices(invoiceItems);
          setDatabaseClients(clientItems);
          setDatabaseJobs(jobItems);
        }
      })
      .catch((error) => {
        if (!cancelled) setDocumentError(error instanceof Error ? error.message : "Unable to load documents.");
      });
    return () => { cancelled = true; };
  }, [activeWorkspace.id, clientsRepo, documentsRepo, invoicesRepo, isDatabaseMode, jobsRepo]);

  const workspaceDocuments = documents.filter(
    (document) => document.workspaceId === activeWorkspace.id
  );
  const workspaceDisplayName = getWorkspaceDisplayName(activeWorkspace);

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
    setDocumentNotice("");
    setIsSavingDocument(true);

    const documentId = crypto.randomUUID();
    const entity = getDocumentEntity({ clientId, jobId, invoiceId });
    const storageFileName = selectedFile ? `${documentId}-${selectedFile.name}` : fileName;
    const storagePath = isDatabaseMode && storageFileName
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
      processingStatus: "uploaded",
      documentType: detectedType,
      notes: notes.trim(),
      clientId,
      jobId,
      invoiceId,
      createdAt: new Date().toISOString(),
      uploadedBy: user?.id,
    };

    try {
      if (isDatabaseMode && supabase && selectedFile && storagePath) {
        await uploadDocumentFile({ workspaceId: activeWorkspace.id, path: storagePath, file: selectedFile });
      }

      const result = await createDocumentAction(documentsRepo, newDocument);
      if (!result.ok) {
        throw new Error(result.error);
      }
      const created = result.data;
      if (isDatabaseMode) setDatabaseDocuments((current) => [created, ...current]);
      closeUploadModal();
    } catch (error) {
      if (isDatabaseMode && supabase && storagePath) {
        try {
          await removeDocumentFile({ workspaceId: activeWorkspace.id, path: storagePath });
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
    if (!canDeleteBusinessRecords) return;

    setDocumentError("");
    setDocumentNotice("");
    const document = workspaceDocuments.find((item) => item.id === documentId);
    if (!window.confirm(`Delete "${document?.fileName || document?.name || "this document"}"? This cannot be undone.`)) return;

    try {
      if (isDatabaseMode && supabase && document?.storagePath) {
        await removeDocumentFile({ workspaceId: document.workspaceId, path: document.storagePath });
      }
      const result = await deleteDocumentAction(
        documentsRepo,
        documentId,
        document?.workspaceId
      );
      if (!result.ok) {
        throw new Error(result.error);
      }
      if (isDatabaseMode) setDatabaseDocuments((current) => current.filter((document) => document.id !== documentId));
    } catch (error) {
      setDocumentError(error instanceof Error ? error.message : "Unable to delete document.");
    }
  }

  async function downloadDocument(document: StoredDocument) {
    setDocumentError("");
    setDocumentNotice("");

    try {
      if (!isDatabaseMode || !supabase || !document.storagePath) {
        setDocumentError("This document does not have a stored cloud file yet.");
        return;
      }

      const url = await createDocumentDownloadUrl({ workspaceId: document.workspaceId, path: document.storagePath });
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      setDocumentError(error instanceof Error ? error.message : "Unable to download document.");
    }
  }

  function replaceDocument(updatedDocument: StoredDocument) {
    if (isDatabaseMode) {
      setDatabaseDocuments((current) =>
        current.map((document) =>
          document.id === updatedDocument.id ? updatedDocument : document
        )
      );
      return;
    }

    setLocalDocuments((current) =>
      current.map((document) =>
        document.id === updatedDocument.id ? updatedDocument : document
      )
    );
  }

  async function runOcr(document: StoredDocument) {
    setDocumentError("");
    setDocumentNotice("");

    if (!isDatabaseMode) {
      setDocumentError("OCR requires a signed-in cloud workspace.");
      return;
    }

    setProcessingDocumentIds((current) => [...current, document.id]);

    try {
      const response = await fetch("/api/documents/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: document.id,
          workspaceId: document.workspaceId,
        }),
      });
      const payload = (await response.json()) as {
        document?: ApiDocument;
        error?: string;
      };

      if (!response.ok || !payload.document) {
        throw new Error(payload.error || "Unable to run OCR.");
      }

      const updatedDocument = apiDocumentToStoredDocument(payload.document);
      replaceDocument(updatedDocument);
      openReview(updatedDocument);
    } catch (error) {
      setDocumentError(error instanceof Error ? error.message : "Unable to run OCR.");
    } finally {
      setProcessingDocumentIds((current) =>
        current.filter((documentId) => documentId !== document.id)
      );
    }
  }

  async function generateDraft(document: StoredDocument) {
    setDocumentError("");
    setDocumentNotice("");

    if (!isDatabaseMode) {
      setDocumentError("AI drafts require a signed-in cloud workspace.");
      return;
    }

    if (!document.extractedText?.trim()) {
      setDocumentError("Run OCR before generating an AI review draft.");
      return;
    }

    setDraftingDocumentIds((current) => [...current, document.id]);

    try {
      const response = await fetch("/api/ai/interpret-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: document.id,
          workspaceId: document.workspaceId,
        }),
      });
      const payload = (await response.json()) as {
        reviewDraft?: { id: string };
        error?: string;
      };

      if (!response.ok || !payload.reviewDraft) {
        throw new Error(payload.error || "Unable to generate review draft.");
      }

      setDocumentNotice("AI review draft created. Open Review Queue to approve it.");
    } catch (error) {
      setDocumentError(
        error instanceof Error ? error.message : "Unable to generate review draft."
      );
    } finally {
      setDraftingDocumentIds((current) =>
        current.filter((documentId) => documentId !== document.id)
      );
    }
  }

  function openReview(document: StoredDocument) {
    setReviewDocumentId(document.id);
    setReviewDocumentType(document.documentType || "unknown");
    setReviewText(document.extractedText || "");
    setReviewJsonText(JSON.stringify(document.extractedJson ?? {}, null, 2));
  }

  function closeReview() {
    setReviewDocumentId("");
    setReviewDocumentType("unknown");
    setReviewText("");
    setReviewJsonText("");
  }

  async function saveReview() {
    const document = workspaceDocuments.find((item) => item.id === reviewDocumentId);
    if (!document) return;

    let parsedJson: Record<string, unknown>;
    try {
      parsedJson = JSON.parse(reviewJsonText || "{}") as Record<string, unknown>;
    } catch {
      setDocumentError("Reviewed extraction JSON is not valid.");
      return;
    }

    try {
      const result = await updateDocumentAction(documentsRepo, {
        ...document,
        documentType: reviewDocumentType,
        detectedType: reviewDocumentType,
        extractionStatus: "Reviewed",
        processingStatus: "reviewed",
        extractedText: reviewText,
        extractedJson: parsedJson,
        reviewedAt: new Date().toISOString(),
        reviewedBy: user?.id,
      });
      if (!result.ok) {
        setDocumentError(result.error);
        return;
      }
      const updatedDocument = result.data;
      replaceDocument(updatedDocument);
      closeReview();
      setDocumentError("");
    } catch (error) {
      setDocumentError(error instanceof Error ? error.message : "Unable to save OCR review.");
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

  const reviewDocument = workspaceDocuments.find(
    (document) => document.id === reviewDocumentId
  );

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
        Review extracted information before using it. OCR drafts never create
        clients, jobs, invoices, expenses, or calendar items automatically.
        {!isDatabaseMode && (
          <span className="mt-2 block font-semibold">
            Sign in to use cloud OCR and AI drafts. Local document metadata remains available in demo mode.
          </span>
        )}
      </div>

      {documentError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {documentError}
        </div>
      )}

      {documentNotice && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
          {documentNotice}
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
                  No documents uploaded for {workspaceDisplayName}
                </td>
              </tr>
            ) : (
              workspaceDocuments.map((document) => (
                <tr
                  key={document.id}
                  id={`document-${document.id}`}
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
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      OCR: {document.processingStatus || "uploaded"}
                    </div>
                    {document.ocrProvider && (
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Provider: {document.ocrProvider}
                      </div>
                    )}
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
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => runOcr(document)}
                        disabled={
                          !isDatabaseMode ||
                          processingDocumentIds.includes(document.id) ||
                          document.processingStatus === "processing"
                        }
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {processingDocumentIds.includes(document.id) ||
                        document.processingStatus === "processing"
                          ? "Processing..."
                          : "Run OCR"}
                      </button>
                      <button
                        type="button"
                        onClick={() => openReview(document)}
                        disabled={!document.extractedText && !document.extractedJson}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
                      >
                        Review
                      </button>
                      <button
                        type="button"
                        onClick={() => generateDraft(document)}
                        disabled={
                          !isDatabaseMode ||
                          !document.extractedText ||
                          draftingDocumentIds.includes(document.id)
                        }
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {draftingDocumentIds.includes(document.id)
                          ? "Generating..."
                          : "Generate Draft"}
                      </button>
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
                        disabled={!canDeleteBusinessRecords}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
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

      {reviewDocument && (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-950 dark:text-gray-100">
                Review Extraction
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Review extracted information before using it. Saving this review
                only updates the document metadata.
              </p>
            </div>
            <button
              type="button"
              onClick={closeReview}
              className="rounded-lg border border-gray-300 px-4 py-2 font-semibold hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-gray-100">
                Document Type
              </label>
              <select
                value={reviewDocumentType}
                onChange={(event) => setReviewDocumentType(event.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-950 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              >
                <option value="receipt">receipt</option>
                <option value="invoice">invoice</option>
                <option value="estimate">estimate</option>
                <option value="contract">contract</option>
                <option value="unknown">unknown</option>
              </select>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-300">
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {reviewDocument.name}
              </p>
              <p>Status: {reviewDocument.processingStatus || "uploaded"}</p>
              <p>Confidence: {reviewDocument.confidence ?? "unscored"}</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-gray-100">
                Extracted Text
              </label>
              <textarea
                rows={12}
                value={reviewText}
                onChange={(event) => setReviewText(event.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 font-mono text-sm text-gray-950 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-gray-100">
                Extracted Fields Draft
              </label>
              <textarea
                rows={12}
                value={reviewJsonText}
                onChange={(event) => setReviewJsonText(event.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 font-mono text-sm text-gray-950 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={saveReview}
              className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Save Reviewed Extraction
            </button>
          </div>
        </section>
      )}

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
                  value={workspaceDisplayName}
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
