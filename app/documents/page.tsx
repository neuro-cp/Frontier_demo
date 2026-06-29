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
  normalizeImageForAi,
  type NormalizedImageResult,
} from "@/lib/images/normalizeImage";
import {
  buildDocumentStoragePath,
  createDocumentDownloadUrl,
  getDocumentEntity,
  getDocumentStorageBucketLabel,
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
  original_file_name?: string | null;
  original_mime_type?: string | null;
  original_size_bytes?: number | null;
  normalized_file_name?: string | null;
  normalized_mime_type?: string | null;
  normalized_size_bytes?: number | null;
  normalization_status?: string | null;
  ocr_queued_at?: string | null;
  ocr_started_at?: string | null;
  ocr_completed_at?: string | null;
  ocr_failed_at?: string | null;
  ocr_error?: string | null;
  ocr_retry_count?: number | null;
  ocr_review_draft_id?: string | null;
  image_analysis_status?: StoredDocument["imageAnalysisStatus"] | null;
  image_analysis_queued_at?: string | null;
  image_analysis_started_at?: string | null;
  image_analysis_completed_at?: string | null;
  image_analysis_failed_at?: string | null;
  image_analysis_error?: string | null;
  image_analysis_retry_count?: number | null;
  image_analysis_provider?: string | null;
  image_analysis_model?: string | null;
  image_analysis_confidence?: number | null;
  image_analysis_summary?: string | null;
  image_review_draft_id?: string | null;
};

type UploadFileItem = {
  file: File;
  originalFile: File;
  normalization: NormalizedImageResult | null;
};

type ApiReviewDraft = {
  id: string;
  sourceId: string | null;
  sourceType: string;
  status?: string | null;
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
    originalFileName: document.original_file_name ?? "",
    originalMimeType: document.original_mime_type ?? "",
    originalSizeBytes: document.original_size_bytes ?? undefined,
    normalizedFileName: document.normalized_file_name ?? "",
    normalizedMimeType: document.normalized_mime_type ?? "",
    normalizedSizeBytes: document.normalized_size_bytes ?? undefined,
    normalizationStatus: document.normalization_status ?? "",
    ocrQueuedAt: document.ocr_queued_at ?? "",
    ocrStartedAt: document.ocr_started_at ?? "",
    ocrCompletedAt: document.ocr_completed_at ?? "",
    ocrFailedAt: document.ocr_failed_at ?? "",
    ocrError: document.ocr_error ?? "",
    ocrRetryCount: document.ocr_retry_count ?? 0,
    ocrReviewDraftId: document.ocr_review_draft_id ?? "",
    imageAnalysisStatus: document.image_analysis_status ?? "",
    imageAnalysisQueuedAt: document.image_analysis_queued_at ?? "",
    imageAnalysisStartedAt: document.image_analysis_started_at ?? "",
    imageAnalysisCompletedAt: document.image_analysis_completed_at ?? "",
    imageAnalysisFailedAt: document.image_analysis_failed_at ?? "",
    imageAnalysisError: document.image_analysis_error ?? "",
    imageAnalysisRetryCount: document.image_analysis_retry_count ?? 0,
    imageAnalysisProvider: document.image_analysis_provider ?? "",
    imageAnalysisModel: document.image_analysis_model ?? "",
    imageAnalysisConfidence: document.image_analysis_confidence ?? null,
    imageAnalysisSummary: document.image_analysis_summary ?? "",
    imageReviewDraftId: document.image_review_draft_id ?? "",
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
  const [originalSelectedFile, setOriginalSelectedFile] = useState<File | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<UploadFileItem[]>([]);
  const [normalization, setNormalization] = useState<NormalizedImageResult | null>(null);
  const [notes, setNotes] = useState("");
  const [clientId, setClientId] = useState("");
  const [jobId, setJobId] = useState("");
  const [invoiceId, setInvoiceId] = useState("");
  const [documentError, setDocumentError] = useState("");
  const [documentNotice, setDocumentNotice] = useState("");
  const [isSavingDocument, setIsSavingDocument] = useState(false);
  const [processingDocumentIds, setProcessingDocumentIds] = useState<string[]>([]);
  const [draftingDocumentIds, setDraftingDocumentIds] = useState<string[]>([]);
  const [analyzingImageDocumentIds, setAnalyzingImageDocumentIds] = useState<string[]>([]);
  const [reviewDraftByDocumentId, setReviewDraftByDocumentId] = useState<Record<string, string>>({});
  const [reviewDraftStatusByDocumentId, setReviewDraftStatusByDocumentId] = useState<Record<string, string>>({});
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

  useEffect(() => {
    if (!isDatabaseMode) {
      queueMicrotask(() => {
        setReviewDraftByDocumentId({});
        setReviewDraftStatusByDocumentId({});
      });
      return;
    }

    let cancelled = false;
    fetch(`/api/ai/review-drafts?workspaceId=${encodeURIComponent(activeWorkspace.id)}`)
      .then((response) => response.json())
      .then((payload: { reviewDrafts?: ApiReviewDraft[] }) => {
        if (cancelled) return;
        const next: Record<string, string> = {};
        const nextStatus: Record<string, string> = {};
        for (const draft of payload.reviewDrafts ?? []) {
          if (draft.sourceId && (draft.sourceType === "ocr" || draft.sourceType === "image")) {
            next[draft.sourceId] ??= draft.id;
            nextStatus[draft.sourceId] ??= draft.status ?? "Pending";
          }
        }
        setReviewDraftByDocumentId(next);
        setReviewDraftStatusByDocumentId(nextStatus);
      })
      .catch(() => {
        if (!cancelled) {
          setReviewDraftByDocumentId({});
          setReviewDraftStatusByDocumentId({});
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeWorkspace.id, isDatabaseMode]);

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
    setOriginalSelectedFile(null);
    setSelectedFiles([]);
    setNormalization(null);
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

  async function createStoredDocumentFromUpload(uploadItem: UploadFileItem | null, total: number) {
    const documentId = crypto.randomUUID();
    const entity = getDocumentEntity({ clientId, jobId, invoiceId });
    const file = uploadItem?.file ?? selectedFile;
    const originalFile = uploadItem?.originalFile ?? originalSelectedFile;
    const fileLabel = file?.name || fileName || "No file selected";
    const storageFileName = file ? `${documentId}-${file.name}` : fileName;
    const storagePath = isDatabaseMode && storageFileName
      ? buildDocumentStoragePath({
          workspaceId: activeWorkspace.id,
          entityType: entity.entityType,
          entityId: entity.entityId,
          fileName: storageFileName,
      })
      : "";
    const baseName = documentName.trim();
    const documentDisplayName =
      total > 1 && file?.name ? `${baseName} - ${file.name}` : baseName;
    const fileNormalization = uploadItem?.normalization ?? normalization;

    const newDocument: StoredDocument = {
      id: documentId,
      workspaceId: activeWorkspace.id,
      name: documentDisplayName,
      detectedType,
      extractionStatus: "Waiting for extraction",
      fileName: fileLabel,
      mimeType: file?.type || mimeType,
      sizeBytes: file?.size || sizeBytes,
      storageBucket: storagePath ? getDocumentStorageBucketLabel() : "",
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
      originalFileName: fileNormalization?.originalFileName || originalFile?.name || file?.name || "",
      originalMimeType: fileNormalization?.originalMimeType || originalFile?.type || file?.type || "",
      originalSizeBytes: fileNormalization?.originalSizeBytes ?? originalFile?.size ?? file?.size,
      normalizedFileName: fileNormalization?.normalizedFileName || file?.name || "",
      normalizedMimeType: fileNormalization?.normalizedMimeType || file?.type || "",
      normalizedSizeBytes: fileNormalization?.normalizedSizeBytes ?? file?.size,
      normalizationStatus: fileNormalization?.normalizationStatus || (file?.type.startsWith("image/") ? "kept_original" : "not_applicable"),
    };

    try {
      if (isDatabaseMode && supabase && file && storagePath) {
        await uploadDocumentFile({ workspaceId: activeWorkspace.id, path: storagePath, file });
      }

      const result = await createDocumentAction(documentsRepo, newDocument);
      if (!result.ok) {
        throw new Error(result.error);
      }
      return result.data;
    } catch (error) {
      if (isDatabaseMode && supabase && storagePath) {
        try {
          await removeDocumentFile({
            workspaceId: activeWorkspace.id,
            path: storagePath,
            bucket: getDocumentStorageBucketLabel(),
          });
        } catch (cleanupError) {
          console.error("Unable to clean up failed document upload.", cleanupError);
        }
      }
      throw error;
    }
  }

  async function saveUploadPlaceholder() {
    if (!documentName.trim()) return;
    setDocumentError("");
    setDocumentNotice("");
    setIsSavingDocument(true);

    try {
      const uploadItems = selectedFiles.length > 0 ? selectedFiles : [null];
      const createdDocuments: StoredDocument[] = [];
      for (const uploadItem of uploadItems) {
        createdDocuments.push(await createStoredDocumentFromUpload(uploadItem, uploadItems.length));
      }
      if (isDatabaseMode) setDatabaseDocuments((current) => [...createdDocuments, ...current]);
      setDocumentNotice(
        createdDocuments.length === 1
          ? "Document uploaded."
          : `${createdDocuments.length} documents uploaded.`
      );
      closeUploadModal();
    } catch (error) {
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
        await removeDocumentFile({
          workspaceId: document.workspaceId,
          path: document.storagePath,
          bucket: document.storageBucket,
        });
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

      const url = await createDocumentDownloadUrl({
        workspaceId: document.workspaceId,
        path: document.storagePath,
        bucket: document.storageBucket,
      });
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
        reviewDraftId?: string | null;
        draftError?: string | null;
        error?: string;
      };

      if (!response.ok || !payload.document) {
        throw new Error(payload.error || "Unable to run OCR.");
      }

      const updatedDocument = apiDocumentToStoredDocument(payload.document);
      replaceDocument(updatedDocument);
      if (payload.reviewDraftId) {
        setReviewDraftByDocumentId((current) => ({
          ...current,
          [document.id]: payload.reviewDraftId ?? "",
        }));
        setReviewDraftStatusByDocumentId((current) => ({
          ...current,
          [document.id]: "Pending",
        }));
        setDocumentNotice("OCR completed and review draft created. Open Review Queue to approve it.");
      } else if (payload.draftError) {
        setDocumentNotice(`OCR completed. Draft creation needs attention: ${payload.draftError}`);
      } else {
        setDocumentNotice("OCR completed. Review the extraction before generating a draft.");
      }
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

      setReviewDraftByDocumentId((current) => ({
        ...current,
        [document.id]: payload.reviewDraft?.id ?? "",
      }));
      setReviewDraftStatusByDocumentId((current) => ({
        ...current,
        [document.id]: "Pending",
      }));
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

  function isImageDocument(document: StoredDocument) {
    return ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(
      (document.mimeType || "").toLowerCase()
    );
  }

  function isPdfDocument(document: StoredDocument) {
    return (document.mimeType || "").toLowerCase() === "application/pdf";
  }

  function getDocumentStatus(document: StoredDocument) {
    const draftStatus = reviewDraftStatusByDocumentId[document.id];
    const isImage = isImageDocument(document);

    if (draftStatus === "Approved") {
      return {
        label: isImage ? "approved" : "reviewed",
        detail: isImage ? "Image draft approved" : "OCR draft approved",
        className:
          "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
      };
    }
    if (draftStatus === "Rejected") {
      return {
        label: "rejected",
        detail: isImage ? "Image draft rejected" : "OCR draft rejected",
        className: "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300",
      };
    }
    if (draftStatus === "Needs Changes") {
      return {
        label: "needs changes",
        detail: isImage ? "Image draft needs changes" : "OCR draft needs changes",
        className: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
      };
    }
    if (draftStatus === "Pending") {
      return {
        label: isImage ? "analyzed" : "needs review",
        detail: isImage ? "Image draft pending" : "AI draft pending",
        className: "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300",
      };
    }
    if (isImage) {
      const failed = document.imageAnalysisStatus === "failed";
      const processing = document.imageAnalysisStatus === "processing";
      const queued = document.imageAnalysisStatus === "queued";
      const completed = document.imageAnalysisStatus === "completed";
      return {
        label: failed
          ? "failed"
          : completed
            ? "analyzed"
            : processing
              ? "processing"
              : queued
                ? "queued"
                : "uploaded",
        detail: failed
          ? document.imageAnalysisError || "Image analysis failed"
          : completed
            ? document.imageAnalysisSummary || "Image analyzed"
            : processing || queued
              ? "Image analysis in progress"
              : "Image uploaded",
        className: failed
          ? "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300"
          : completed
            ? "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300"
            : processing || queued
              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-300"
              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
      };
    }

    const reviewed = document.extractionStatus.toLowerCase() === "reviewed";
    const processing = document.processingStatus === "processing";
    const queued = document.processingStatus === "queued";
    const failed = document.processingStatus === "failed";
    const hasExtraction = Boolean(document.extractedText || document.extractedJson);
    return {
      label: failed
        ? "failed"
        : reviewed
        ? "reviewed"
        : processing
          ? "processing"
          : queued
            ? "queued"
          : hasExtraction
            ? "needs review"
            : "uploaded",
      detail: failed
        ? document.ocrError || "OCR failed"
        : `OCR: ${document.processingStatus || "uploaded"}`,
      className: failed
        ? "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300"
        : reviewed
        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
        : processing || queued || hasExtraction
          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-300"
          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    };
  }

  async function prepareUploadFile(file: File): Promise<UploadFileItem> {
    if (!file.type.startsWith("image/")) {
      return { file, originalFile: file, normalization: null };
    }
    const normalized = await normalizeImageForAi(file);
    return { file: normalized.file, originalFile: file, normalization: normalized };
  }

  async function handleSelectedFiles(files: FileList | File[]) {
    setDocumentError("");
    setNormalization(null);

    const nextFiles = Array.from(files);
    if (nextFiles.length === 0) {
      setSelectedFiles([]);
      setSelectedFile(null);
      setOriginalSelectedFile(null);
      setFileName("");
      setMimeType("");
      setSizeBytes(0);
      return;
    }

    try {
      const preparedFiles = [];
      for (const file of nextFiles) {
        preparedFiles.push(await prepareUploadFile(file));
      }
      const primary = preparedFiles[0];
      setSelectedFiles(preparedFiles);
      setOriginalSelectedFile(primary.originalFile);
      setSelectedFile(primary.file);
      setNormalization(primary.normalization);
      setFileName(primary.file.name);
      setMimeType(primary.file.type);
      setSizeBytes(primary.file.size);
      if (!documentName.trim() && nextFiles.length === 1) {
        setDocumentName(primary.originalFile.name.replace(/\.[^.]+$/, ""));
      }
    } catch (error) {
      setSelectedFiles([]);
      setSelectedFile(null);
      setOriginalSelectedFile(null);
      setFileName("");
      setMimeType("");
      setSizeBytes(0);
      setDocumentError(error instanceof Error ? error.message : "Unable to prepare selected files.");
    }
  }

  async function analyzeImageDocument(document: StoredDocument) {
    setDocumentError("");
    setDocumentNotice("");

    if (!isDatabaseMode) {
      setDocumentError("Image analysis requires a signed-in cloud workspace.");
      return;
    }
    if (!isImageDocument(document)) {
      setDocumentError("Only JPG, PNG, and WebP image documents can be analyzed.");
      return;
    }

    setAnalyzingImageDocumentIds((current) => [...current, document.id]);

    try {
      const formData = new FormData();
      formData.append("workspaceId", document.workspaceId);
      formData.append("documentId", document.id);
      formData.append("sourceLabel", document.fileName || document.name);

      const response = await fetch("/api/images/analyze", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as {
        reviewDraft?: { id: string };
        document?: ApiDocument | null;
        error?: string;
      };
      if (!response.ok || !payload.reviewDraft) {
        throw new Error(payload.error || "Unable to analyze image.");
      }
      setReviewDraftByDocumentId((current) => ({
        ...current,
        [document.id]: payload.reviewDraft?.id ?? "",
      }));
      setReviewDraftStatusByDocumentId((current) => ({
        ...current,
        [document.id]: "Pending",
      }));
      if (payload.document) {
        replaceDocument(apiDocumentToStoredDocument(payload.document));
      }
      setDocumentNotice("Image analysis draft created. Open Review Queue to approve it.");
    } catch (error) {
      setDocumentError(error instanceof Error ? error.message : "Unable to analyze image.");
    } finally {
      setAnalyzingImageDocumentIds((current) =>
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

  function openReviewQueue(draftId?: string) {
    window.location.assign(draftId ? `/review?draftId=${encodeURIComponent(draftId)}` : "/review");
  }

  async function handleDocumentAction(document: StoredDocument, action: string) {
    if (!action) return;
    if (action === "run-ocr") return runOcr(document);
    if (action === "review-ocr") return openReview(document);
    if (action === "generate-draft") return generateDraft(document);
    if (action === "analyze-image") return analyzeImageDocument(document);
    if (action === "review-draft") return openReviewQueue(reviewDraftByDocumentId[document.id]);
    if (action === "download") return downloadDocument(document);
    if (action === "delete") return deleteDocument(document.id);
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <button
          type="button"
          onClick={() => setIsUploadOpen(true)}
          className="w-full rounded-lg bg-blue-600 px-6 py-3 text-center font-semibold text-white shadow hover:bg-blue-700 sm:w-auto"
        >
          + Upload Document
        </button>
        {isDatabaseMode && (
          <button
            type="button"
            onClick={() => openReviewQueue()}
            className="w-full rounded-lg border border-gray-300 px-6 py-3 text-center font-semibold text-gray-950 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800 sm:w-auto"
          >
            Open Review Queue
          </button>
        )}
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
        <div className="flex flex-col gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 sm:flex-row sm:items-center sm:justify-between">
          <span>{documentNotice}</span>
          {documentNotice.includes("Review Queue") && (
            <button
              type="button"
              onClick={() => openReviewQueue()}
              className="rounded-lg border border-emerald-300 px-3 py-2 text-sm font-bold hover:bg-emerald-100 dark:border-emerald-800 dark:hover:bg-emerald-950"
            >
              Open Review Queue
            </button>
          )}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <table className="min-w-[900px] w-full">
          <thead>
            <tr className="border-b border-gray-200 text-left text-sm uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:text-gray-400">
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Detected Type</th>
              <th className="px-6 py-4">Status</th>
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
              workspaceDocuments.map((document) => {
                const isPdf = isPdfDocument(document);
                const isImage = isImageDocument(document);
                const draftId = reviewDraftByDocumentId[document.id];
                const hasOcrReview = Boolean(document.extractedText || document.extractedJson);
                const isProcessing =
                  processingDocumentIds.includes(document.id) ||
                  document.processingStatus === "processing";
                const isDrafting = draftingDocumentIds.includes(document.id);
                const isAnalyzing = analyzingImageDocumentIds.includes(document.id);
                const documentStatus = getDocumentStatus(document);

                return (
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
                    <span className={`rounded-full px-3 py-1 text-sm font-semibold ${documentStatus.className}`}>
                      {documentStatus.label}
                    </span>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {documentStatus.detail}
                    </div>
                    {isPdf && document.ocrProvider && (
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Provider: {document.ocrProvider}
                      </div>
                    )}
                    {isPdf && document.ocrCompletedAt && (
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        OCR completed: {new Date(document.ocrCompletedAt).toLocaleString()}
                      </div>
                    )}
                    {isPdf && document.ocrFailedAt && (
                      <div className="mt-1 text-xs text-red-600 dark:text-red-300">
                        OCR failed: {new Date(document.ocrFailedAt).toLocaleString()}
                      </div>
                    )}
                    {isPdf && Boolean(document.ocrRetryCount) && (
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        OCR attempts: {document.ocrRetryCount}
                      </div>
                    )}
                    {isImage && document.imageAnalysisProvider && (
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Provider: {document.imageAnalysisProvider}
                      </div>
                    )}
                    {isImage && document.imageAnalysisCompletedAt && (
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Image analyzed: {new Date(document.imageAnalysisCompletedAt).toLocaleString()}
                      </div>
                    )}
                    {isImage && document.imageAnalysisFailedAt && (
                      <div className="mt-1 text-xs text-red-600 dark:text-red-300">
                        Image failed: {new Date(document.imageAnalysisFailedAt).toLocaleString()}
                      </div>
                    )}
                    {isImage && Boolean(document.imageAnalysisRetryCount) && (
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Image attempts: {document.imageAnalysisRetryCount}
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
                      <select
                        aria-label={`Actions for ${document.name}`}
                        value=""
                        disabled={isProcessing || isDrafting || isAnalyzing}
                        onChange={(event) => {
                          const action = event.target.value;
                          event.currentTarget.value = "";
                          void handleDocumentAction(document, action);
                        }}
                        className="w-44 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-950 shadow-sm dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
                      >
                        <option value="">
                          {isProcessing
                            ? "Processing..."
                            : isDrafting
                              ? "Generating..."
                              : isAnalyzing
                                ? "Analyzing..."
                                : "Actions"}
                        </option>
                        {isPdf && isDatabaseMode && <option value="run-ocr">Run OCR</option>}
                        {isPdf && hasOcrReview && <option value="review-ocr">Review OCR</option>}
                        {isPdf && isDatabaseMode && document.extractedText && (
                          <option value="generate-draft">Generate Draft</option>
                        )}
                        {isImage && isDatabaseMode && <option value="analyze-image">Analyze Image</option>}
                        {draftId && <option value="review-draft">Review Draft</option>}
                        {isDatabaseMode && document.storagePath && <option value="download">Download</option>}
                        {canDeleteBusinessRecords && <option value="delete">Delete</option>}
                      </select>
                    </td>
                  </tr>
                );
              })
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
                  Files
                </label>

                <div
                  onDragOver={(event) => {
                    event.preventDefault();
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    void handleSelectedFiles(event.dataTransfer.files);
                  }}
                  className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-950/40"
                >
                  <input
                    type="file"
                    multiple
                    onChange={(event) => {
                      void handleSelectedFiles(event.target.files ?? []);
                    }}
                    className="block w-full text-sm text-gray-900 dark:text-gray-100"
                  />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Select or drag multiple PDFs, images, receipts, notes, or client documents.
                  </p>
                </div>
                {selectedFiles.length > 0 && (
                  <div className="mt-3 rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-800">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {selectedFiles.length} file{selectedFiles.length === 1 ? "" : "s"} queued
                    </p>
                    <ul className="mt-2 space-y-1 text-gray-600 dark:text-gray-300">
                      {selectedFiles.slice(0, 5).map((item) => (
                        <li key={`${item.originalFile.name}-${item.originalFile.size}`}>
                          {item.originalFile.name}
                          {item.normalization ? ` -> ${item.file.name}` : ""}
                        </li>
                      ))}
                      {selectedFiles.length > 5 && <li>+ {selectedFiles.length - 5} more</li>}
                    </ul>
                  </div>
                )}
                {normalization && (
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Image {normalization.normalizationStatus.replace("_", " ")}:
                    {" "}
                    {normalization.originalSizeBytes} bytes to {normalization.normalizedSizeBytes} bytes
                    ({normalization.normalizedMimeType}).
                  </p>
                )}
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
