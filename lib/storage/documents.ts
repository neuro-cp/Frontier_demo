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
  workspaceId,
  path,
  file,
}: {
  workspaceId: string;
  path: string;
  file: File;
}) {
  const formData = new FormData();
  formData.append("workspaceId", workspaceId);
  formData.append("path", path);
  formData.append("file", file);
  const response = await fetch("/api/documents/storage", { method: "POST", body: formData });
  const payload = (await response.json()) as { error?: string };
  if (!response.ok) throw new Error(payload.error || "Unable to upload document.");
}

export async function createDocumentDownloadUrl({
  workspaceId,
  path,
}: {
  workspaceId: string;
  path: string;
}) {
  const query = new URLSearchParams({ workspaceId, path });
  const response = await fetch(`/api/documents/storage?${query.toString()}`);
  const payload = (await response.json()) as { url?: string; error?: string };
  if (!response.ok || !payload.url) throw new Error(payload.error || "Unable to create download link.");
  return payload.url;
}

export async function removeDocumentFile({
  workspaceId,
  path,
}: {
  workspaceId: string;
  path: string;
}) {
  const response = await fetch("/api/documents/storage", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ workspaceId, path }),
  });
  const payload = (await response.json()) as { error?: string };
  if (!response.ok) throw new Error(payload.error || "Unable to remove document file.");
}
