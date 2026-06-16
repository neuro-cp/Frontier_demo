"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { useWorkspace } from "@/components/WorkspaceContext";
import {
  formatCurrency,
  getInvoiceClientName,
  getInvoiceTotals,
  InvoiceRow,
  invoiceStatuses,
  InvoiceStatus,
  loadSavedInvoices,
  saveSavedInvoices,
} from "@/lib/frontierInvoices";

export default function InvoicesPage() {
  const { activeWorkspace } = useWorkspace();

  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    setInvoices(loadSavedInvoices());
  }, []);

  const workspaceInvoices = invoices.filter(
    (invoice) => invoice.workspaceId === activeWorkspace.id
  );

  const totalOutstanding = workspaceInvoices
    .filter((invoice) => invoice.status !== "Paid")
    .reduce((total, invoice) => total + getInvoiceTotals(invoice).total, 0);

  function saveInvoices(updatedInvoices: InvoiceRow[]) {
    setInvoices(updatedInvoices);
    saveSavedInvoices(updatedInvoices);
  }

  function toggleInvoice(id: string) {
    setSelectedInvoices((current) =>
      current.includes(id)
        ? current.filter((invoiceId) => invoiceId !== id)
        : [...current, id]
    );
  }

  function openDeleteModal() {
    if (selectedInvoices.length === 0) return;
    setShowDeleteModal(true);
  }

  function removeSelectedInvoices() {
    saveInvoices(
      invoices.filter((invoice) => !selectedInvoices.includes(invoice.id))
    );

    setSelectedInvoices([]);
    setShowDeleteModal(false);
  }

  function updateInvoiceStatus(id: string, nextStatus: InvoiceStatus) {
    saveInvoices(
      invoices.map((invoice) =>
        invoice.id === id ? { ...invoice, status: nextStatus } : invoice
      )
    );
  }

  return (
    <div className="space-y-6 text-gray-950 dark:text-gray-100">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Create and manage invoices for {activeWorkspace.name}
          </p>
        </div>

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
            disabled={selectedInvoices.length === 0}
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
          <p className="text-sm text-gray-500 dark:text-gray-400">Workspace</p>
          <p className="mt-1 truncate text-2xl font-bold">
            {activeWorkspace.name}
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
            {workspaceInvoices.length > 0 ? (
              workspaceInvoices.map((invoice) => (
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
                      "—"
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
                  No invoices found for {activeWorkspace.name}
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
                className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
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
