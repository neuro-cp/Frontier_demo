"use client";
import type { SupabaseClient } from "@supabase/supabase-js";
type Setter<T> = (value: T | ((current: T) => T)) => void;
export type StoredDocument = { id: string; workspaceId: string; name: string; detectedType: string; extractionStatus: string; fileName: string; notes: string; clientId: string; jobId: string; createdAt: string; storageBucket?: string; storagePath?: string; mimeType?: string; sizeBytes?: number; storageStatus?: string };
type DbDoc = { id: string; workspace_id: string; client_id: string | null; job_id: string | null; name: string; detected_type: string | null; extraction_status: string | null; file_name: string | null; notes: string | null; created_at: string; storage_bucket: string | null; storage_path: string | null; mime_type: string | null; size_bytes: number | null };
const dbToDoc = (d: DbDoc): StoredDocument => ({ id: d.id, workspaceId: d.workspace_id, clientId: d.client_id ?? "", jobId: d.job_id ?? "", name: d.name, detectedType: d.detected_type ?? "Pending", extractionStatus: d.extraction_status ?? "Waiting for extraction", fileName: d.file_name ?? "No file selected", notes: d.notes ?? "", createdAt: d.created_at, storageBucket: d.storage_bucket ?? "", storagePath: d.storage_path ?? "", mimeType: d.mime_type ?? "", sizeBytes: d.size_bytes ?? 0, storageStatus: d.storage_path ? "Stored" : "Pending storage setup" });
export function createDocumentsRepository({ isSignedIn, supabase, localDocuments, setLocalDocuments }: { isSignedIn: boolean; supabase: SupabaseClient | null; localDocuments: StoredDocument[]; setLocalDocuments: Setter<StoredDocument[]> }) {
  const useDb = isSignedIn && supabase;
  return {
    async getDocuments(workspaceId: string) {
      if (!useDb) return localDocuments.filter((d) => d.workspaceId === workspaceId);
      const { data, error } = await supabase.from("documents").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false });
      if (error) return console.error("Unable to load documents.", error), [];
      return ((data ?? []) as DbDoc[]).map(dbToDoc);
    },
    async createDocument(doc: StoredDocument) {
      if (!useDb) return setLocalDocuments((c) => [doc, ...c]), doc;
      const { data, error } = await supabase.from("documents").insert({ id: doc.id, workspace_id: doc.workspaceId, client_id: doc.clientId || null, job_id: doc.jobId || null, name: doc.name, detected_type: doc.detectedType, extraction_status: doc.extractionStatus, file_name: doc.fileName, notes: doc.notes, storage_bucket: doc.storageBucket || null, storage_path: doc.storagePath || null, mime_type: doc.mimeType || null, size_bytes: doc.sizeBytes ?? null }).select("*").single();
      if (error) return console.error("Unable to create document.", error), null;
      return dbToDoc(data as DbDoc);
    },
    async updateDocument(doc: StoredDocument) {
      if (!useDb) return setLocalDocuments((c) => c.map((d) => d.id === doc.id ? doc : d)), doc;
      const { data, error } = await supabase.from("documents").update({ client_id: doc.clientId || null, job_id: doc.jobId || null, name: doc.name, detected_type: doc.detectedType, extraction_status: doc.extractionStatus, file_name: doc.fileName, notes: doc.notes, storage_bucket: doc.storageBucket || null, storage_path: doc.storagePath || null, mime_type: doc.mimeType || null, size_bytes: doc.sizeBytes ?? null }).eq("id", doc.id).select("*").single();
      if (error) return console.error("Unable to update document.", error), null;
      return dbToDoc(data as DbDoc);
    },
    async deleteDocument(id: string) {
      if (!useDb) return setLocalDocuments((c) => c.filter((d) => d.id !== id)), true;
      const { error } = await supabase.from("documents").delete().eq("id", id);
      if (error) return console.error("Unable to delete document.", error), false;
      return true;
    },
  };
}
