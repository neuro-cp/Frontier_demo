"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { useAuthSession } from "@/components/AuthSessionProvider";
import { useWorkspace } from "@/components/WorkspaceContext";
import { deleteInvoiceAction, updateInvoiceAction } from "@/lib/actions/invoices";
import { storageKeys, useStoredJsonState } from "@/lib/clientStorage";
import { createInvoicesRepository } from "@/lib/db/invoices";
import {
  formatCurrency,
  getInvoiceClientName,
  getInvoiceTotals,
  InvoiceRow,
  invoiceStatuses,
  InvoiceStatus,
} from "@/lib/frontierInvoices";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getWorkspaceDisplayName } from "@/lib/workspaceDisplay";

export default function InvoicesPage() {
  const { activeWorkspace, canDeleteBusinessRecords } = useWorkspace();
  const { isSupabaseConfigured, user } = useAuthSession();
  const isDatabaseMode = Boolean(isSupabaseConfigured && user);

  const [localInvoices, setLocalInvoices] = useStoredJsonState<InvoiceRow[]>(
    storageKeys.invoices,
    []
  );
  const [databaseInvoices, setDatabaseInvoices] = useState<InvoiceRow[]>([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
  const [invoiceError, setInvoiceError] = useState("");
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "All">("All");

  const supabase = useMemo(() => (isDatabaseMode ? createBrowserSupabaseClient() : null), [isDatabaseMode]);
  const invoicesRepo = useMemo(() => createInvoicesRepository({ isSignedIn: isDatabaseMode, supabase, localInvoices, setLocalInvoices }), [isDatabaseMode, localInvoices, setLocalInvoices, supabase]);
  const invoices = isDatabaseMode ? databaseInvoices : localInvoices;

  useEffect(() => {
    if (!isDatabaseMode) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) {
        setIsLoadingInvoices(true);
        setInvoiceError("");
      }
    });
    invoicesRepo.getInvoices(activeWorkspace.id).then((items) => { if (!cancelled) setDatabaseInvoices(items); }).catch((error) => {
      if (!cancelled) setInvoiceError(error instanceof Error ? error.message : "Unable to load invoices.");
    }).finally(() => {
      if (!cancelled) setIsLoadingInvoices(false);
    });
    return () => { cancelled = true; };
  }, [activeWorkspace.id, invoicesRepo, isDatabaseMode]);

  const workspaceInvoices = invoices.filter(
    (invoice) => invoice.workspaceId === activeWorkspace.id
  );
  const workspaceDisplayName = getWorkspaceDisplayName(activeWorkspace);

  const totalOutstanding = workspaceInvoices
    .filter((invoice) => invoice.status !== "Paid")
    .reduce((total, invoice) => total + getInvoiceTotals(invoice).total, 0);
  const totalPaid = workspaceInvoices
    .filter((invoice) => invoice.status === "Paid")
    .reduce((total, invoice) => total + getInvoiceTotals(invoice).total, 0);
  const overdueCount = workspaceInvoices.filter((invoice) => invoice.status === "Overdue").length;
  const filteredInvoices = workspaceInvoices.filter((invoice) => {
    const query = searchText.trim().toLowerCase();
    const matchesStatus = statusFilter === "All" || invoice.status === statusFilter;
    const matchesSearch =
      !query ||
      [
        invoice.invoiceNumber,
        getInvoiceClientName(invoice),
        invoice.billToEmail,
        invoice.jobName,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    return matchesStatus && matchesSearch;
  });

  function saveInvoices(updatedInvoices: InvoiceRow[]) {
    if (isDatabaseMode) setDatabaseInvoices(updatedInvoices);
    else setLocalInvoices(updatedInvoices);
  }

  function toggleInvoice(id: string) {
    setSelectedInvoices((current) =>
      current.includes(id)
        ? current.filter((invoiceId) => invoiceId !== id)
        : [...current, id]
    );
  }

  function openDeleteModal() {
    if (!canDeleteBusinessRecords) return;
    if (selectedInvoices.length === 0) return;
    setShowDeleteModal(true);
  }

  async function removeSelectedInvoices() {
    if (!canDeleteBusinessRecords) return;

    try {
      const results = await Promise.all(
        selectedInvoices.map((id) =>
          deleteInvoiceAction(invoicesRepo, id, activeWorkspace.id)
        )
      );
      const deletedIds = selectedInvoices.filter((_, index) => results[index].ok);
      const failedDelete = results.find((result) => !result.ok);
      if (failedDelete && !deletedIds.length) {
        setInvoiceError(failedDelete.ok ? "Unable to delete invoices." : failedDelete.error);
        return;
      }
      saveInvoices(invoices.filter((invoice) => !deletedIds.includes(invoice.id)));
      setSelectedInvoices([]);
      setShowDeleteModal(false);
      setInvoiceError("");
    } catch (error) {
      setInvoiceError(error instanceof Error ? error.message : "Unable to delete invoices.");
    }
  }

  async function updateInvoiceStatus(id: string, nextStatus: InvoiceStatus) {
    const invoice = invoices.find((item) => item.id === id);
    if (!invoice) return;
    try {
      const result = await updateInvoiceAction(invoicesRepo, { ...invoice, status: nextStatus });
      if (!result.ok) {
        setInvoiceError(result.error);
        return;
      }
      const saved = result.data;
      saveInvoices(invoices.map((item) => item.id === id ? saved : item));
      setInvoiceError("");
    } catch (error) {
      setInvoiceError(error instanceof Error ? error.message : "Unable to update invoice.");
    }
  }

  return (
    <div className="space-y-6 text-gray-950 dark:text-gray-100">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">


        <div className="flex flex-wrap gap-2">
          <Link
            href="/invoices/new"
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            + Add Invoice
          </Link>

          <button
            type="button"
            onClick={openDeleteModal}
            disabled={selectedInvoices.length === 0 || !canDeleteBusinessRecords}
            className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Remove Invoice
          </button>
        </div>
      </div>

      {selectedInvoices.length > 0 && (
        <div className="rounded-lg bg-gray-900 p-4 text-white">
          {selectedInvoices.length} invoice
          {selectedInvoices.length === 1 ? "" : "s"} selected
        </div>
      )}

      {invoiceError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {invoiceError}
        </div>
      )}

      {isLoadingInvoices && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
          Loading invoices...
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl bg-white p-4 shadow dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Invoices</p>
          <p className="mt-1 text-2xl font-bold">{workspaceInvoices.length}</p>
        </div>

        <div className="rounded-xl bg-white p-4 shadow dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">Outstanding</p>
          <p className="mt-1 text-2xl font-bold">
            {formatCurrency(totalOutstanding)}
          </p>
        </div>

        <div className="rounded-xl bg-white p-4 shadow dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">Paid Revenue</p>
          <p className="mt-1 text-2xl font-bold">{formatCurrency(totalPaid)}</p>
        </div>

        <div className="rounded-xl bg-white p-4 shadow dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">Overdue</p>
          <p className="mt-1 text-2xl font-bold">{overdueCount}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow dark:bg-gray-900 md:flex-row">
        <input
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="Search invoice, client, email, or job"
          className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
        />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as InvoiceStatus | "All")}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
        >
          <option>All</option>
          {invoiceStatuses.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
        <div className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
          Workspace:{" "}
          <p className="mt-1 truncate text-2xl font-bold">
            {workspaceDisplayName}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg bg-white shadow dark:bg-gray-900">
        <table className="w-full min-w-[1000px]">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr className="text-left text-gray-700 dark:text-gray-300">
              <th className="w-12 p-4"></th>
              <th className="p-4">Invoice #</th>
              <th className="p-4">Date</th>
              <th className="p-4">Bill To</th>
              <th className="p-4">Job</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Total</th>
            </tr>
          </thead>

          <tbody>
            {filteredInvoices.length > 0 ? (
              filteredInvoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedInvoices.includes(invoice.id)}
                      onChange={() => toggleInvoice(invoice.id)}
                      className="h-4 w-4"
                    />
                  </td>

                  <td className="p-4 font-medium">
                    <Link
                      href={`/invoices/${invoice.id}`}
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {invoice.invoiceNumber}
                    </Link>
                  </td>

                  <td className="p-4">{invoice.invoiceDate}</td>
                  <td className="p-4">{getInvoiceClientName(invoice)}</td>

                  <td className="p-4">
                    {invoice.jobId ? (
                      <Link
                        href={`/jobs/${invoice.jobId}`}
                        className="text-blue-600 hover:underline dark:text-blue-400"
                      >
                        {invoice.jobName || "Open Job"}
                      </Link>
                    ) : (
                      "-"
                    )}
                  </td>

                  <td className="p-4">
                    <select
                      value={invoice.status}
                      onChange={(event) =>
                        updateInvoiceStatus(
                          invoice.id,
                          event.target.value as InvoiceStatus
                        )
                      }
                      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                    >
                      {invoiceStatuses.map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                    <div className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs font-bold ${
                      invoice.status === "Paid"
                        ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-200"
                        : invoice.status === "Overdue"
                          ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-200"
                    }`}>
                      {invoice.status === "Paid" ? "Paid" : "Balance open"}
                    </div>
                  </td>

                  <td className="p-4 text-right font-medium">
                    {formatCurrency(getInvoiceTotals(invoice).total)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="p-10 text-center text-lg text-gray-500 dark:text-gray-400"
                >
                  No invoices match the current filters for {workspaceDisplayName}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Remove Invoice(s)
            </h2>

            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Are you sure you want to remove the selected invoice(s)?
            </p>

            <div className="mt-4 rounded-lg bg-gray-100 p-3 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              {selectedInvoices.length} invoice
              {selectedInvoices.length === 1 ? "" : "s"} selected
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={removeSelectedInvoices}
                disabled={!canDeleteBusinessRecords}
                className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
