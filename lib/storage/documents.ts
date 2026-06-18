import type { SupabaseClient } from "@supabase/supabase-js";

export const DOCUMENT_STORAGE_BUCKET = "workspace-documents";

export type DocumentEntityType = "client" | "job" | "invoice" | "workspace";

export type DocumentStoragePathInput = {
  workspaceId: string;
  entityType?: DocumentEntityType | "";
  entityId?: string | "";
  fileName: string;
};

function sanitizePathSegment(value: string) {
  return value
    .trim()
    .replace(/\\/g, "/")
    .split("/")
    .filter(Boolean)
    .join("-")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function buildDocumentStoragePath({
  workspaceId,
  entityType,
  entityId,
  fileName,
}: DocumentStoragePathInput) {
  const safeWorkspaceId = sanitizePathSegment(workspaceId);
  const safeEntityType = sanitizePathSegment(entityType || "workspace");
  const safeEntityId = sanitizePathSegment(entityId || "general");
  const safeFileName = sanitizePathSegment(fileName) || "document";

  return `${safeWorkspaceId}/${safeEntityType}/${safeEntityId}/${safeFileName}`;
}

export function getDocumentEntity({
  clientId,
  jobId,
  invoiceId,
}: {
  clientId?: string;
  jobId?: string;
  invoiceId?: string;
}): { entityType: DocumentEntityType; entityId: string } {
  if (invoiceId) return { entityType: "invoice", entityId: invoiceId };
  if (jobId) return { entityType: "job", entityId: jobId };
  if (clientId) return { entityType: "client", entityId: clientId };
  return { entityType: "workspace", entityId: "general" };
}

export async function uploadDocumentFile({
  supabase,
  path,
  file,
}: {
  supabase: SupabaseClient;
  path: string;
  file: File;
}) {
  const { error } = await supabase.storage
    .from(DOCUMENT_STORAGE_BUCKET)
    .upload(path, file, {
      contentType: file.type || undefined,
      upsert: false,
    });

  if (error) throw new Error(error.message || "Unable to upload document.");
}

export async function createDocumentDownloadUrl({
  supabase,
  path,
}: {
  supabase: SupabaseClient;
  path: string;
}) {
  const { data, error } = await supabase.storage
    .from(DOCUMENT_STORAGE_BUCKET)
    .createSignedUrl(path, 60);

  if (error) throw new Error(error.message || "Unable to create download link.");
  return data.signedUrl;
}

export async function removeDocumentFile({
  supabase,
  path,
}: {
  supabase: SupabaseClient;
  path: string;
}) {
  const { error } = await supabase.storage
    .from(DOCUMENT_STORAGE_BUCKET)
    .remove([path]);

  if (error) throw new Error(error.message || "Unable to remove document file.");
}
