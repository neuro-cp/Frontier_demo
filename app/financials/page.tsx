"use client";

import { useState } from "react";
import { useWorkspace } from "@/components/WorkspaceContext";
import { invoices as defaultInvoices } from "@/lib/invoices";
import { expenses as defaultExpenses } from "@/lib/expenses";
import { clients } from "@/lib/clients";

const invoiceStatuses = ["Draft", "Sent", "Overdue", "Paid"] as const;

type InvoiceStatus = (typeof invoiceStatuses)[number];

function moneyToNumber(value: string) {
  return Number(value.replace(/[$,]/g, ""));
}

function formatMoney(value: number) {
  return `$${value.toLocaleString()}`;
}

function SummaryCard({
  title,
  value,
  icon,
  iconClass,
  note,
}: {
  title: string;
  value: string;
  icon: string;
  iconClass: string;
  note?: string;
}) {
  return (
    <div className="flex min-h-36 flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:flex-row sm:items-start sm:justify-between dark:border-gray-800 dark:bg-gray-900">
      <div>
        <p className="text-lg text-gray-500 dark:text-gray-400">{title}</p>
        <p className="mt-2 text-4xl font-bold text-gray-950 dark:text-gray-100">
          {value}
        </p>
        {note && <p className="mt-3 text-green-600">{note}</p>}
      </div>

      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${iconClass}`}
      >
        {icon}
      </div>
    </div>
  );
}

export default function FinancialsPage() {
  const { activeWorkspace } = useWorkspace();

  const [invoiceItems, setInvoiceItems] = useState(defaultInvoices);
  const [expenseItems, setExpenseItems] = useState(defaultExpenses);

  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);

  const [newInvoiceOpen, setNewInvoiceOpen] = useState(false);
  const [newExpenseOpen, setNewExpenseOpen] = useState(false);

  const [invoiceClient, setInvoiceClient] = useState("");
  const [invoiceStatus, setInvoiceStatus] = useState<InvoiceStatus>("Draft");
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [invoiceFileName, setInvoiceFileName] = useState("");

  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("Materials");
  const [expenseAmount, setExpenseAmount] = useState("");

  const workspaceInvoices = invoiceItems.filter(
    (invoice) => invoice.workspaceId === activeWorkspace.id
  );

  const workspaceExpenses = expenseItems.filter(
    (expense) => expense.workspaceId === activeWorkspace.id
  );

  const workspaceClients = clients.filter(
    (client) => client.workspaceId === activeWorkspace.id
  );

  function toggleInvoice(id: string) {
    setSelectedInvoices((current) =>
      current.includes(id)
        ? current.filter((invoiceId) => invoiceId !== id)
        : [...current, id]
    );
  }

  function toggleExpense(id: string) {
    setSelectedExpenses((current) =>
      current.includes(id)
        ? current.filter((expenseId) => expenseId !== id)
        : [...current, id]
    );
  }

  function removeSelectedInvoices() {
    setInvoiceItems((current) =>
      current.filter((invoice) => !selectedInvoices.includes(invoice.id))
    );

    setSelectedInvoices([]);
  }

  function removeSelectedExpenses() {
    setExpenseItems((current) =>
      current.filter(
        (expense) =>
          !selectedExpenses.includes(
            `${expense.workspaceId}-${expense.description}`
          )
      )
    );

    setSelectedExpenses([]);
  }

  function updateInvoiceStatus(id: string, status: InvoiceStatus) {
    setInvoiceItems((current) =>
      current.map((invoice) =>
        invoice.id === id ? { ...invoice, status } : invoice
      )
    );
  }

  function closeInvoiceModal() {
    setNewInvoiceOpen(false);
    setInvoiceClient("");
    setInvoiceStatus("Draft");
    setInvoiceAmount("");
    setInvoiceFileName("");
  }

  function closeExpenseModal() {
    setNewExpenseOpen(false);
    setExpenseDescription("");
    setExpenseCategory("Materials");
    setExpenseAmount("");
  }

  function addInvoice() {
    if (!invoiceClient.trim()) return;

    const amount = Number(invoiceAmount);

    if (Number.isNaN(amount) || amount <= 0) return;

    const nextInvoiceNumber = invoiceItems.length + 1;
    const nextInvoiceId = `INV-${String(nextInvoiceNumber).padStart(3, "0")}`;

    setInvoiceItems((current) => [
      ...current,
      {
        id: nextInvoiceId,
        client: invoiceClient,
        status: invoiceStatus,
        amount: formatMoney(amount),
        workspaceId: activeWorkspace.id,
        supportingFile: invoiceFileName,
      },
    ]);

    closeInvoiceModal();
  }

  function addExpense() {
    if (!expenseDescription.trim()) return;

    const amount = Number(expenseAmount);

    if (Number.isNaN(amount) || amount <= 0) return;

    setExpenseItems((current) => [
      ...current,
      {
        description: expenseDescription.trim(),
        category: expenseCategory,
        amount: formatMoney(amount),
        workspaceId: activeWorkspace.id,
      },
    ]);

    closeExpenseModal();
  }

  const revenue = workspaceInvoices
    .filter((invoice) => invoice.status === "Paid")
    .reduce((total, invoice) => total + moneyToNumber(invoice.amount), 0);

  const outstanding = workspaceInvoices
    .filter((invoice) => invoice.status !== "Paid")
    .reduce((total, invoice) => total + moneyToNumber(invoice.amount), 0);

  const totalExpenses = workspaceExpenses.reduce(
    (total, expense) => total + moneyToNumber(expense.amount),
    0
  );

  const profit = revenue - totalExpenses;

  return (
    <div className="space-y-8">

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Revenue"
          value={formatMoney(revenue)}
          icon="$"
          iconClass="bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300"
          note="Paid invoices"
        />

        <SummaryCard
          title="Expenses"
          value={formatMoney(totalExpenses)}
          icon="↘"
          iconClass="bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300"
        />

        <SummaryCard
          title="Outstanding"
          value={formatMoney(outstanding)}
          icon="◷"
          iconClass="bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300"
        />

        <SummaryCard
          title="Profit"
          value={formatMoney(profit)}
          icon="↗"
          iconClass="bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300"
        />
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-800">
            <h2 className="text-2xl font-bold text-gray-950 dark:text-gray-100">
              Recent Invoices
            </h2>

            <div className="flex gap-2">
              <button
                onClick={() => setNewInvoiceOpen(true)}
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
              >
                + Add Invoice
              </button>

              <button
                onClick={removeSelectedInvoices}
                disabled={selectedInvoices.length === 0}
                className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          </div>

          <table className="min-w-[720px] w-full">
            <thead>
              <tr className="border-b border-gray-200 text-left text-sm uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:text-gray-400">
                <th className="w-12 px-4 py-4"></th>
                <th className="px-6 py-4">Invoice</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>

            <tbody>
              {workspaceInvoices.length > 0 ? (
                workspaceInvoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="border-b border-gray-200 text-base last:border-b-0 dark:border-gray-800 lg:text-lg"
                  >
                    <td className="px-4 py-5 text-center">
                      <input
                        type="checkbox"
                        checked={selectedInvoices.includes(invoice.id)}
                        onChange={() => toggleInvoice(invoice.id)}
                        className="h-4 w-4"
                      />
                    </td>

                    <td className="px-6 py-5 font-medium text-gray-950 dark:text-gray-100">
                      {invoice.id}
                    </td>

                    <td className="px-6 py-5 text-gray-500 dark:text-gray-400">
                      {invoice.client}
                    </td>

                    <td className="px-6 py-5">
                      <select
                        value={invoice.status}
                        onChange={(event) =>
                          updateInvoiceStatus(
                            invoice.id,
                            event.target.value as InvoiceStatus
                          )
                        }
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                      >
                        {invoiceStatuses.map((status) => (
                          <option key={status}>{status}</option>
                        ))}
                      </select>
                    </td>

                    <td className="px-6 py-5 text-right font-medium text-gray-950 dark:text-gray-100">
                      {invoice.amount}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-lg text-gray-500 dark:text-gray-400"
                  >
                    No invoices for {activeWorkspace.name}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-800">
            <h2 className="text-2xl font-bold text-gray-950 dark:text-gray-100">
              Recent Expenses
            </h2>

            <div className="flex gap-2">
              <button
                onClick={() => setNewExpenseOpen(true)}
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
              >
                + Add Expense
              </button>

              <button
                onClick={removeSelectedExpenses}
                disabled={selectedExpenses.length === 0}
                className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          </div>

          <table className="min-w-[700px] w-full">
            <thead>
              <tr className="border-b border-gray-200 text-left text-sm uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:text-gray-400">
                <th className="w-12 px-4 py-4"></th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>

            <tbody>
              {workspaceExpenses.length > 0 ? (
                workspaceExpenses.map((expense) => {
                  const expenseId = `${expense.workspaceId}-${expense.description}`;

                  return (
                    <tr
                      key={expenseId}
                      className="border-b border-gray-200 text-base last:border-b-0 dark:border-gray-800 lg:text-lg"
                    >
                      <td className="px-4 py-5 text-center">
                        <input
                          type="checkbox"
                          checked={selectedExpenses.includes(expenseId)}
                          onChange={() => toggleExpense(expenseId)}
                          className="h-4 w-4"
                        />
                      </td>

                      <td className="px-6 py-5 font-medium text-gray-950 dark:text-gray-100">
                        {expense.description}
                      </td>

                      <td className="px-6 py-5 text-gray-500 dark:text-gray-400">
                        {expense.category}
                      </td>

                      <td className="px-6 py-5 text-right font-medium text-red-600 dark:text-red-400">
                        {expense.amount}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-lg text-gray-500 dark:text-gray-400"
                  >
                    No expenses for {activeWorkspace.name}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {newInvoiceOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-950 dark:text-gray-100">
                Add Invoice
              </h2>

              <button
                onClick={closeInvoiceModal}
                className="text-2xl text-gray-500"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <select
                value={invoiceClient}
                onChange={(event) => setInvoiceClient(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
              >
                <option value="">Select Client</option>
                {workspaceClients.map((client) => (
                  <option key={client.id} value={client.name}>
                    {client.name}
                  </option>
                ))}
              </select>

              <select
                value={invoiceStatus}
                onChange={(event) =>
                  setInvoiceStatus(event.target.value as InvoiceStatus)
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
              >
                {invoiceStatuses.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>

              <input
                type="number"
                value={invoiceAmount}
                onChange={(event) => setInvoiceAmount(event.target.value)}
                placeholder="Amount"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
              />

              <input
                type="file"
                onChange={(event) =>
                  setInvoiceFileName(event.target.files?.[0]?.name ?? "")
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
              />

              {invoiceFileName && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Attached: {invoiceFileName}
                </p>
              )}

              <button
                onClick={addInvoice}
                className="w-full rounded-lg bg-blue-600 py-3 text-white hover:bg-blue-700"
              >
                Add Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {newExpenseOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-950 dark:text-gray-100">
                Add Expense
              </h2>

              <button
                onClick={closeExpenseModal}
                className="text-2xl text-gray-500"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={expenseDescription}
                onChange={(event) => setExpenseDescription(event.target.value)}
                placeholder="Description"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
              />

              <select
                value={expenseCategory}
                onChange={(event) => setExpenseCategory(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
              >
                <option>Materials</option>
                <option>Fuel</option>
                <option>Equipment</option>
                <option>Insurance</option>
                <option>Maintenance</option>
                <option>Labor</option>
                <option>Other</option>
              </select>

              <input
                type="number"
                value={expenseAmount}
                onChange={(event) => setExpenseAmount(event.target.value)}
                placeholder="Amount"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
              />

              <button
                onClick={addExpense}
                className="w-full rounded-lg bg-blue-600 py-3 text-white hover:bg-blue-700"
              >
                Add Expense
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}