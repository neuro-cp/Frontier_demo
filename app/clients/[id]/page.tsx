"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { storageKeys, useStoredJsonState } from "@/lib/clientStorage";
import { clients as defaultClients } from "@/lib/clients";
import { jobs as defaultJobs, Job } from "@/lib/jobs";
import { ClientRow } from "@/lib/frontierClients";
import {
  formatCurrency,
  getInvoiceTotals,
  InvoiceRow,
} from "@/lib/frontierInvoices";

export default function ClientPage() {
  const params = useParams();
  const id = String(params.id);

  const [clients] = useStoredJsonState<ClientRow[]>(
    storageKeys.clients,
    defaultClients
  );
  const [jobs] = useStoredJsonState<Job[]>(storageKeys.jobs, defaultJobs);
  const [invoices] = useStoredJsonState<InvoiceRow[]>(
    storageKeys.invoices,
    []
  );

  const client = clients.find((clientItem) => clientItem.id === id);

  const clientJobs = useMemo(() => {
    if (!client) return [];
    return jobs.filter(
      (job) =>
        job.workspaceId === client.workspaceId &&
        job.client.trim().toLowerCase() === client.name.trim().toLowerCase()
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

  if (!client) {
    return (
      <div className="space-y-4 text-gray-950 dark:text-gray-100">
        <Link href="/clients" className="text-blue-600 hover:underline dark:text-blue-400">- Back to Clients</Link>
        <h1 className="text-3xl font-bold">Client not found</h1>
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
    </div>
  );
}
