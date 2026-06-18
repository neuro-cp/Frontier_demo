"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { useAuthSession } from "@/components/AuthSessionProvider";
import { useWorkspace } from "@/components/WorkspaceContext";
import DocumentAttachments from "@/app/documents/DocumentAttachments";
import { storageKeys, useStoredJsonState } from "@/lib/clientStorage";
import type { Job } from "@/lib/jobTypes";
import type { ClientRow } from "@/lib/clientTypes";
import { createClientsRepository } from "@/lib/db/clients";
import { createInvoicesRepository } from "@/lib/db/invoices";
import { createJobsRepository } from "@/lib/db/jobs";
import {
  formatCurrency,
  getInvoiceTotals,
  InvoiceRow,
} from "@/lib/frontierInvoices";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export default function ClientPage() {
  const params = useParams();
  const id = String(params.id);
  const { activeWorkspace } = useWorkspace();
  const { isSupabaseConfigured, user } = useAuthSession();
  const isDatabaseMode = Boolean(isSupabaseConfigured && user);

  const [localClients, setLocalClients] = useStoredJsonState<ClientRow[]>(
    storageKeys.clients,
    []
  );
  const [databaseClient, setDatabaseClient] = useState<ClientRow | null>(null);
  const [isLoadingClient, setIsLoadingClient] = useState(false);
  const [clientLoadError, setClientLoadError] = useState<string | null>(null);
  const [localJobs, setLocalJobs] = useStoredJsonState<Job[]>(storageKeys.jobs, []);
  const [localInvoices, setLocalInvoices] = useStoredJsonState<InvoiceRow[]>(
    storageKeys.invoices,
    []
  );
  const [databaseJobs, setDatabaseJobs] = useState<Job[]>([]);
  const [databaseInvoices, setDatabaseInvoices] = useState<InvoiceRow[]>([]);

  const supabase = useMemo(
    () => (isDatabaseMode ? createBrowserSupabaseClient() : null),
    [isDatabaseMode]
  );
  const clientsRepository = useMemo(
    () =>
      createClientsRepository({
        isSignedIn: isDatabaseMode,
        supabase,
        localClients,
        setLocalClients,
      }),
    [isDatabaseMode, localClients, setLocalClients, supabase]
  );
  const jobsRepository = useMemo(
    () =>
      createJobsRepository({
        isSignedIn: isDatabaseMode,
        supabase,
        localJobs,
        setLocalJobs,
      }),
    [isDatabaseMode, localJobs, setLocalJobs, supabase]
  );
  const invoicesRepository = useMemo(
    () =>
      createInvoicesRepository({
        isSignedIn: isDatabaseMode,
        supabase,
        localInvoices,
        setLocalInvoices,
      }),
    [isDatabaseMode, localInvoices, setLocalInvoices, supabase]
  );

  useEffect(() => {
    if (!isDatabaseMode) {
      return;
    }

    let cancelled = false;

    async function loadClient() {
      setIsLoadingClient(true);
      const loadedClient = await clientsRepository.getClientById(
        id,
        activeWorkspace.id
      );

      if (!cancelled) {
        setDatabaseClient(loadedClient);
        setClientLoadError(null);
        if (loadedClient) {
          const [jobs, invoices] = await Promise.all([
            jobsRepository.getJobs(loadedClient.workspaceId),
            invoicesRepository.getInvoices(loadedClient.workspaceId),
          ]);
          if (!cancelled) {
            setDatabaseJobs(jobs);
            setDatabaseInvoices(invoices);
          }
        }
      }
    }

    loadClient()
      .catch((error) => {
        console.error("Unable to load client.", error);

        if (!cancelled) {
          setClientLoadError("Unable to load client.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingClient(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeWorkspace.id, clientsRepository, id, invoicesRepository, isDatabaseMode, jobsRepository]);

  const client = isDatabaseMode
    ? databaseClient
    : localClients.find((clientItem) => clientItem.id === id);
  const jobs = isDatabaseMode ? databaseJobs : localJobs;
  const invoices = isDatabaseMode ? databaseInvoices : localInvoices;

  const clientJobs = useMemo(() => {
    if (!client) return [];
    return jobs.filter(
      (job) =>
        job.workspaceId === client.workspaceId &&
        (job.clientId === client.id ||
          (!job.clientId &&
            job.client.trim().toLowerCase() ===
              client.name.trim().toLowerCase()))
    );
  }, [client, jobs]);

  const clientInvoices = useMemo(() => {
    if (!client) return [];
    return invoices.filter(
      (invoice) =>
        invoice.workspaceId === client.workspaceId &&
        (invoice.sourceClientId === client.id ||
          invoice.billToName.trim().toLowerCase() === client.name.trim().toLowerCase() ||
          invoice.billToCompany.trim().toLowerCase() === client.name.trim().toLowerCase())
    );
  }, [client, invoices]);

  const invoiceTotal = clientInvoices.reduce(
    (total, invoice) => total + getInvoiceTotals(invoice).total,
    0
  );

  if (isLoadingClient) {
    return (
      <div className="space-y-4 text-gray-950 dark:text-gray-100">
        <Link href="/clients" className="text-blue-600 hover:underline dark:text-blue-400">- Back to Clients</Link>
        <h1 className="text-3xl font-bold">Loading client...</h1>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="space-y-4 text-gray-950 dark:text-gray-100">
        <Link href="/clients" className="text-blue-600 hover:underline dark:text-blue-400">- Back to Clients</Link>
        <h1 className="text-3xl font-bold">Client not found</h1>
        {clientLoadError && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {clientLoadError}
          </p>
        )}
      </div>
    );
  }

  const addressParts = [client.address, client.city, client.state, client.zip].filter(Boolean);

  return (
    <div className="space-y-6 text-gray-950 dark:text-gray-100">
      <Link href="/clients" className="text-blue-600 hover:underline dark:text-blue-400">- Back to Clients</Link>

      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">{client.name}</h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">{client.status}</p>
          </div>
          <div className="text-right text-lg font-bold">{client.balance}</div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <p><strong>Phone:</strong> {client.phone || "-"}</p>
          <p><strong>Email:</strong> {client.email || "-"}</p>
          <p className="sm:col-span-2"><strong>Address:</strong> {addressParts.length > 0 ? addressParts.join(", ") : "-"}</p>
          {client.notes && <p className="sm:col-span-2"><strong>Notes:</strong> {client.notes}</p>}
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-900">
        <h2 className="mb-4 text-xl font-semibold">Jobs</h2>
        {clientJobs.length > 0 ? (
          <div className="space-y-3">
            {clientJobs.map((job) => (
              <Link key={job.id} href={`/jobs/${job.id}`} className="block rounded-lg border border-gray-200 p-4 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="font-semibold text-blue-600 dark:text-blue-400">{job.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{job.status} - {job.date || "No date"}</div>
                  </div>
                  <div className="font-bold">{job.value}</div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No jobs found for this client.</p>
        )}
      </div>

      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-900">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold">Invoices</h2>
          <div className="font-bold">Total: {formatCurrency(invoiceTotal)}</div>
        </div>

        {clientInvoices.length > 0 ? (
          <div className="space-y-3">
            {clientInvoices.map((invoice) => (
              <Link key={invoice.id} href={`/invoices/${invoice.id}`} className="block rounded-lg border border-gray-200 p-4 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="font-semibold text-blue-600 dark:text-blue-400">{invoice.invoiceNumber}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{invoice.status} - {invoice.invoiceDate}</div>
                  </div>
                  <div className="font-bold">{formatCurrency(getInvoiceTotals(invoice).total)}</div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No invoices found for this client.</p>
        )}
      </div>

      <DocumentAttachments
        workspaceId={client.workspaceId}
        clientId={client.id}
        title="Client Documents"
      />
    </div>
  );
}
