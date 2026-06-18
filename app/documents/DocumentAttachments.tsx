"use client";

import { useEffect, useMemo, useState } from "react";

import { useAuthSession } from "@/components/AuthSessionProvider";
import { storageKeys, useStoredJsonState } from "@/lib/clientStorage";
import { createDocumentsRepository, type StoredDocument } from "@/lib/db/documents";
import { createDocumentDownloadUrl, removeDocumentFile } from "@/lib/storage";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type DocumentAttachmentsProps = {
  workspaceId: string;
  clientId?: string;
  jobId?: string;
  invoiceId?: string;
  title?: string;
};

function formatSize(value?: number) {
  if (!value) return "-";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentAttachments({
  workspaceId,
  clientId = "",
  jobId = "",
  invoiceId = "",
  title = "Documents",
}: DocumentAttachmentsProps) {
  const { isSupabaseConfigured, user } = useAuthSession();
  const isDatabaseMode = Boolean(isSupabaseConfigured && user);
  const [localDocuments, setLocalDocuments] = useStoredJsonState<StoredDocument[]>(
    storageKeys.documents,
    []
  );
  const [databaseDocuments, setDatabaseDocuments] = useState<StoredDocument[]>([]);
  const [error, setError] = useState("");

  const supabase = useMemo(
    () => (isDatabaseMode ? createBrowserSupabaseClient() : null),
    [isDatabaseMode]
  );
  const documentsRepo = useMemo(
    () =>
      createDocumentsRepository({
        isSignedIn: isDatabaseMode,
        supabase,
        localDocuments,
        setLocalDocuments,
      }),
    [isDatabaseMode, localDocuments, setLocalDocuments, supabase]
  );

  useEffect(() => {
    if (!isDatabaseMode) return;
    let cancelled = false;
    documentsRepo
      .getDocuments(workspaceId)
      .then((items) => {
        if (!cancelled) setDatabaseDocuments(items);
      })
      .catch((loadError) => {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load documents.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [documentsRepo, isDatabaseMode, workspaceId]);

  const documents = (isDatabaseMode ? databaseDocuments : localDocuments).filter((document) => {
    if (document.workspaceId !== workspaceId) return false;
    if (invoiceId) return document.invoiceId === invoiceId;
    if (jobId) return document.jobId === jobId;
    if (clientId) return document.clientId === clientId;
    return false;
  });

  async function downloadDocument(document: StoredDocument) {
    setError("");
    if (!isDatabaseMode || !supabase || !document.storagePath) {
      setError("This document does not have a stored cloud file yet.");
      return;
    }

    try {
      const url = await createDocumentDownloadUrl({ supabase, path: document.storagePath });
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : "Unable to download document.");
    }
  }

  async function deleteDocument(document: StoredDocument) {
    setError("");
    if (!window.confirm(`Delete "${document.fileName || document.name}"? This cannot be undone.`)) return;

    try {
      if (isDatabaseMode && supabase && document.storagePath) {
        await removeDocumentFile({ supabase, path: document.storagePath });
      }
      await documentsRepo.deleteDocument(document.id);
      if (isDatabaseMode) {
        setDatabaseDocuments((current) => current.filter((item) => item.id !== document.id));
      }
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete document.");
    }
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-900">
      <h2 className="mb-4 text-xl font-semibold">{title}</h2>
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}
      {documents.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No documents attached.</p>
      ) : (
        <div className="space-y-3">
          {documents.map((document) => (
            <div key={document.id} className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-semibold">{document.fileName || document.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {document.mimeType || "Unknown type"} - {formatSize(document.sizeBytes)} - {document.status || document.storageStatus || "Metadata available"}
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => downloadDocument(document)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800">
                  Download
                </button>
                <button type="button" onClick={() => deleteDocument(document)} className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
