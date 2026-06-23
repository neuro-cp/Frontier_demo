"use client";
import type { SupabaseClient } from "@supabase/supabase-js";
import { assertUuid, isUuid } from "@/lib/db/ids";
import { createSignedInRecord } from "@/lib/db/serverCreate";
import { mutateSignedInRecord } from "@/lib/db/serverMutate";
type Setter<T> = (value: T | ((current: T) => T)) => void;
export type DocumentProcessingStatus = "uploaded" | "queued" | "processing" | "needs_review" | "reviewed" | "failed";
export type StoredDocument = { id: string; workspaceId: string; name: string; detectedType: string; extractionStatus: string; fileName: string; notes: string; clientId: string; jobId: string; invoiceId?: string; createdAt: string; uploadedBy?: string; status?: string; storageBucket?: string; storagePath?: string; mimeType?: string; sizeBytes?: number; storageStatus?: string; processingStatus?: DocumentProcessingStatus; extractedText?: string; extractedJson?: Record<string, unknown> | null; ocrProvider?: string; aiJobId?: string; reviewedAt?: string; reviewedBy?: string; confidence?: number | null; documentType?: string; originalFileName?: string; originalMimeType?: string; originalSizeBytes?: number; normalizedFileName?: string; normalizedMimeType?: string; normalizedSizeBytes?: number; normalizationStatus?: string };
export type DbDoc = { id: string; workspace_id: string; client_id: string | null; job_id: string | null; invoice_id?: string | null; name: string; detected_type: string | null; extraction_status: string | null; file_name: string | null; notes: string | null; created_at: string; uploaded_by?: string | null; status?: string | null; storage_bucket: string | null; storage_path: string | null; mime_type: string | null; size_bytes: number | null; processing_status?: DocumentProcessingStatus | null; extracted_text?: string | null; extracted_json?: Record<string, unknown> | null; ocr_provider?: string | null; ai_job_id?: string | null; reviewed_at?: string | null; reviewed_by?: string | null; confidence?: number | null; document_type?: string | null; original_file_name?: string | null; original_mime_type?: string | null; original_size_bytes?: number | null; normalized_file_name?: string | null; normalized_mime_type?: string | null; normalized_size_bytes?: number | null; normalization_status?: string | null };
export const dbToDoc = (d: DbDoc): StoredDocument => ({ id: d.id, workspaceId: d.workspace_id, clientId: d.client_id ?? "", jobId: d.job_id ?? "", invoiceId: d.invoice_id ?? "", name: d.name, detectedType: d.detected_type ?? "Pending", extractionStatus: d.extraction_status ?? "Waiting for extraction", fileName: d.file_name ?? "No file selected", notes: d.notes ?? "", createdAt: d.created_at, uploadedBy: d.uploaded_by ?? "", status: d.status ?? "Metadata available", storageBucket: d.storage_bucket ?? "", storagePath: d.storage_path ?? "", mimeType: d.mime_type ?? "", sizeBytes: d.size_bytes ?? 0, storageStatus: d.storage_path ? "Stored" : "Pending storage setup", processingStatus: d.processing_status ?? "uploaded", extractedText: d.extracted_text ?? "", extractedJson: d.extracted_json ?? null, ocrProvider: d.ocr_provider ?? "", aiJobId: d.ai_job_id ?? "", reviewedAt: d.reviewed_at ?? "", reviewedBy: d.reviewed_by ?? "", confidence: d.confidence ?? null, documentType: d.document_type ?? d.detected_type ?? "", originalFileName: d.original_file_name ?? "", originalMimeType: d.original_mime_type ?? "", originalSizeBytes: d.original_size_bytes ?? undefined, normalizedFileName: d.normalized_file_name ?? "", normalizedMimeType: d.normalized_mime_type ?? "", normalizedSizeBytes: d.normalized_size_bytes ?? undefined, normalizationStatus: d.normalization_status ?? "" });
function docToDb(doc: StoredDocument) {
  return { client_id: doc.clientId || null, job_id: doc.jobId || null, invoice_id: doc.invoiceId || null, name: doc.name, detected_type: doc.detectedType, extraction_status: doc.extractionStatus, file_name: doc.fileName, notes: doc.notes, uploaded_by: doc.uploadedBy || null, status: doc.status || "Metadata available", storage_bucket: doc.storageBucket || null, storage_path: doc.storagePath || null, mime_type: doc.mimeType || null, size_bytes: doc.sizeBytes ?? null, processing_status: doc.processingStatus ?? "uploaded", extracted_text: doc.extractedText || null, extracted_json: doc.extractedJson ?? null, ocr_provider: doc.ocrProvider || null, ai_job_id: doc.aiJobId || null, reviewed_at: doc.reviewedAt || null, reviewed_by: doc.reviewedBy || null, confidence: doc.confidence ?? null, document_type: doc.documentType || doc.detectedType || null, original_file_name: doc.originalFileName || null, original_mime_type: doc.originalMimeType || null, original_size_bytes: doc.originalSizeBytes ?? null, normalized_file_name: doc.normalizedFileName || null, normalized_mime_type: doc.normalizedMimeType || null, normalized_size_bytes: doc.normalizedSizeBytes ?? null, normalization_status: doc.normalizationStatus || null };
}
export function createDocumentsRepository({ isSignedIn, supabase, localDocuments, setLocalDocuments }: { isSignedIn: boolean; supabase: SupabaseClient | null; localDocuments: StoredDocument[]; setLocalDocuments: Setter<StoredDocument[]> }) {
  const useDb = isSignedIn && supabase;
  return {
    async getDocuments(workspaceId: string) {
      if (!useDb) return localDocuments.filter((d) => d.workspaceId === workspaceId);
      if (!isUuid(workspaceId)) return [];
      const { data, error } = await supabase.from("documents").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false });
      if (error) throw new Error(error.message || "Unable to load documents.");
      return ((data ?? []) as DbDoc[]).map(dbToDoc);
    },
    async createDocument(doc: StoredDocument) {
      if (!useDb) return setLocalDocuments((c) => [doc, ...c]), doc;
      assertUuid(doc.workspaceId, "Workspace");
      const data = await createSignedInRecord<DbDoc>("document", { id: doc.id, workspace_id: doc.workspaceId, ...docToDb(doc) });
      return dbToDoc(data);
    },
    async updateDocument(doc: StoredDocument) {
      if (!useDb) return setLocalDocuments((c) => c.map((d) => d.id === doc.id ? doc : d)), doc;
      assertUuid(doc.workspaceId, "Workspace");
      assertUuid(doc.id, "Document");
      const data = await mutateSignedInRecord<DbDoc>("document", "update", {
        id: doc.id,
        workspace_id: doc.workspaceId,
        ...docToDb(doc),
      });
      if (!data) throw new Error("Unable to update document.");
      return dbToDoc(data);
    },
    async deleteDocument(id: string, workspaceId?: string) {
      if (!useDb) return setLocalDocuments((c) => c.filter((d) => d.id !== id)), true;
      if (!isUuid(id)) return true;
      await mutateSignedInRecord<boolean>("document", "delete", {
        id,
        workspace_id: workspaceId,
      });
      return true;
    },
  };
}
