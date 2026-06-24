"use client";

import { useEffect, useMemo, useState } from "react";

import { useAuthSession } from "@/components/AuthSessionProvider";
import { useWorkspace } from "@/components/WorkspaceContext";
import { storageKeys, useStoredJsonState } from "@/lib/clientStorage";
import { createDocumentsRepository, type StoredDocument } from "@/lib/db/documents";
import { createInvoicesRepository } from "@/lib/db/invoices";
import { createJobsRepository } from "@/lib/db/jobs";
import type { InvoiceRow } from "@/lib/frontierInvoices";
import type { Job } from "@/lib/jobTypes";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export type PortalMetrics = {
  activeJobs: number;
  openInvoices: number;
  pendingEstimates: number;
  documents: number;
  scheduledJobs: number;
  materialLines: number;
  photos: number;
};

const emptyMetrics: PortalMetrics = {
  activeJobs: 0,
  openInvoices: 0,
  pendingEstimates: 0,
  documents: 0,
  scheduledJobs: 0,
  materialLines: 0,
  photos: 0,
};

export function usePortalMetrics() {
  const { activeWorkspace } = useWorkspace();
  const { isSupabaseConfigured, user } = useAuthSession();
  const isDatabaseMode = Boolean(isSupabaseConfigured && user);
  const [localJobs, setLocalJobs] = useStoredJsonState<Job[]>(storageKeys.jobs, []);
  const [localInvoices, setLocalInvoices] = useStoredJsonState<InvoiceRow[]>(
    storageKeys.invoices,
    []
  );
  const [localDocuments, setLocalDocuments] = useStoredJsonState<StoredDocument[]>(
    storageKeys.documents,
    []
  );
  const [databaseJobs, setDatabaseJobs] = useState<Job[]>([]);
  const [databaseInvoices, setDatabaseInvoices] = useState<InvoiceRow[]>([]);
  const [databaseDocuments, setDatabaseDocuments] = useState<StoredDocument[]>([]);
  const [error, setError] = useState("");

  const supabase = useMemo(
    () => (isDatabaseMode ? createBrowserSupabaseClient() : null),
    [isDatabaseMode]
  );
  const jobsRepo = useMemo(
    () =>
      createJobsRepository({
        isSignedIn: isDatabaseMode,
        supabase,
        localJobs,
        setLocalJobs,
      }),
    [isDatabaseMode, localJobs, setLocalJobs, supabase]
  );
  const invoicesRepo = useMemo(
    () =>
      createInvoicesRepository({
        isSignedIn: isDatabaseMode,
        supabase,
        localInvoices,
        setLocalInvoices,
      }),
    [isDatabaseMode, localInvoices, setLocalInvoices, supabase]
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
    Promise.all([
      jobsRepo.getJobs(activeWorkspace.id),
      invoicesRepo.getInvoices(activeWorkspace.id),
      documentsRepo.getDocuments(activeWorkspace.id),
    ])
      .then(([jobs, invoices, documents]) => {
        if (cancelled) return;
        setDatabaseJobs(jobs);
        setDatabaseInvoices(invoices);
        setDatabaseDocuments(documents);
        setError("");
      })
      .catch((loadError) => {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load portal metrics."
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeWorkspace.id, documentsRepo, invoicesRepo, isDatabaseMode, jobsRepo]);

  const jobs = isDatabaseMode ? databaseJobs : localJobs;
  const invoices = isDatabaseMode ? databaseInvoices : localInvoices;
  const documents = isDatabaseMode ? databaseDocuments : localDocuments;

  const metrics = useMemo<PortalMetrics>(() => {
    if (!user) return emptyMetrics;
    const workspaceJobs = jobs.filter((job) => job.workspaceId === activeWorkspace.id);
    const workspaceInvoices = invoices.filter(
      (invoice) => invoice.workspaceId === activeWorkspace.id
    );
    const workspaceDocuments = documents.filter(
      (document) => document.workspaceId === activeWorkspace.id
    );

    return {
      activeJobs: workspaceJobs.filter(
        (job) => job.status !== "Completed" && job.status !== "Paid"
      ).length,
      openInvoices: workspaceInvoices.filter(
        (invoice) => invoice.status !== "Paid" && invoice.status !== "Estimate"
      ).length,
      pendingEstimates: workspaceInvoices.filter(
        (invoice) => invoice.status === "Estimate"
      ).length,
      documents: workspaceDocuments.length,
      scheduledJobs: workspaceJobs.filter((job) => job.status === "Scheduled").length,
      materialLines: workspaceJobs.reduce(
        (total, job) => total + (job.materials?.length ?? 0),
        0
      ),
      photos: workspaceDocuments.filter((document) =>
        document.mimeType?.startsWith("image/")
      ).length,
    };
  }, [activeWorkspace.id, documents, invoices, jobs, user]);

  return {
    metrics,
    error,
    isAuthenticated: Boolean(user),
    activeWorkspace,
  };
}
