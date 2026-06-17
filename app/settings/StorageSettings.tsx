"use client";

import { useEffect, useMemo, useState } from "react";

import { useAuthSession } from "@/components/AuthSessionProvider";
import { storageKeys, useStoredJsonState } from "@/lib/clientStorage";
import { createDocumentsRepository, type StoredDocument } from "@/lib/db/documents";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function StorageSettings({ workspaceId }: { workspaceId: string }) {
  const { isSupabaseConfigured, user } = useAuthSession();
  const isDatabaseMode = Boolean(isSupabaseConfigured && user);
  const [localDocuments, setLocalDocuments] = useStoredJsonState<StoredDocument[]>(storageKeys.documents, []);
  const [databaseDocuments, setDatabaseDocuments] = useState<StoredDocument[]>([]);
  const supabase = useMemo(() => (isDatabaseMode ? createBrowserSupabaseClient() : null), [isDatabaseMode]);
  const documentsRepo = useMemo(() => createDocumentsRepository({ isSignedIn: isDatabaseMode, supabase, localDocuments, setLocalDocuments }), [isDatabaseMode, localDocuments, setLocalDocuments, supabase]);

  useEffect(() => {
    if (!isDatabaseMode) return;
    let cancelled = false;
    documentsRepo.getDocuments(workspaceId).then((items) => { if (!cancelled) setDatabaseDocuments(items); });
    return () => { cancelled = true; };
  }, [documentsRepo, isDatabaseMode, workspaceId]);

  const documents = isDatabaseMode ? databaseDocuments : localDocuments;
  const workspaceDocuments = documents.filter((doc) => doc.workspaceId === workspaceId);
  const docsWithFiles = workspaceDocuments.filter((doc) => doc.fileName && doc.fileName !== "No file selected");
  const totalSize = docsWithFiles.reduce((sum, doc) => sum + (doc.sizeBytes ?? 0), 0);

  return (
    <section className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div>
        <h2 className="text-2xl font-bold">Storage Planning</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Current mode: Metadata only. File upload provider not configured.</p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {["documents", "invoice-attachments", "client-files"].map((bucket) => (
          <div key={bucket} className="rounded-lg bg-gray-50 p-4 font-semibold dark:bg-gray-800">{bucket}</div>
        ))}
      </div>
      <div className="rounded-lg bg-blue-50 p-4 text-blue-800 dark:bg-blue-950/40 dark:text-blue-200">
        Documents with file metadata: {docsWithFiles.length}. Placeholder size: {formatBytes(totalSize)}.
      </div>
    </section>
  );
}
