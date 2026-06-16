"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { useWorkspace } from "@/components/WorkspaceContext";
import { invoices as defaultInvoices } from "@/lib/invoices";
import { expenses as defaultExpenses, Expense } from "@/lib/expenses";
import {
  formatCurrency,
  getInvoiceClientName,
  getInvoiceTotals,
  InvoiceRow,
  InvoiceStatus,
  invoiceStatuses,
  loadSavedInvoices,
  moneyToNumber,
  saveSavedInvoices,
} from "@/lib/frontierInvoices";

type DefaultInvoice = (typeof defaultInvoices)[number];

type FinancialInvoice =
  | { source: "saved"; id: string; invoice: InvoiceRow }
  | { source: "default"; id: string; invoice: DefaultInvoice };

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

      <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${iconClass}`}>
        {icon}
      </div>
    </div>
  );
}

function getFinancialInvoiceNumber(row: FinancialInvoice) {
  return row.source === "saved" ? row.invoice.invoiceNumber : row.invoice.id;
}

function getFinancialInvoiceClient(row: FinancialInvoice) {
  return row.source === "saved"
    ? getInvoiceClientName(row.invoice)
    : row.invoice.client;
}

function getFinancialInvoiceStatus(row: FinancialInvoice): InvoiceStatus {
  return row.invoice.status as InvoiceStatus;
}

function getFinancialInvoiceTotal(row: FinancialInvoice) {
  return row.source === "saved"
    ? getInvoiceTotals(row.invoice).total
    : moneyToNumber(row.invoice.amount);
}

export default function FinancialsPage() {
  const { activeWorkspace } = useWorkspace();

  const [savedInvoices, setSavedInvoices] = useState<InvoiceRow[]>([]);
  const [defaultInvoiceItems, setDefaultInvoiceItems] =
    useState(defaultInvoices);
  const [expenseItems, setExpenseItems] = useState<Expense[]>(defaultExpenses);

  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);
  const [newExpenseOpen, setNewExpenseOpen] = useState(false);

  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("Materials");
  const [expenseAmount, setExpenseAmount] = useState("");

  useEffect(() => {
    setSavedInvoices(loadSavedInvoices());

    const savedExpenses = localStorage.getItem("frontier-expenses");

    if (savedExpenses) {
      try {
        setExpenseItems(JSON.parse(savedExpenses));
      } catch {
        setExpenseItems(defaultExpenses);
      }
    }
  }, []);

  const generatedInvoiceRows: FinancialInvoice[] = savedInvoices
    .filter((invoice) => invoice.workspaceId === activeWorkspace.id)
    .map((invoice) => ({
      source: "saved",
      id: invoice.id,
      invoice,
    }));

  const defaultInvoiceRows: FinancialInvoice[] = defaultInvoiceItems
    .filter((invoice) => invoice.workspaceId === activeWorkspace.id)
    .map((invoice) => ({
      source: "default",
      id: `default-${invoice.id}`,
      invoice,
    }));

  const workspaceInvoices = [...generatedInvoiceRows, ...defaultInvoiceRows];

  const workspaceExpenses = expenseItems.filter(
    (expense) => expense.workspaceId === activeWorkspace.id
  );

  function saveSavedInvoiceItems(updatedInvoices: InvoiceRow[]) {
    setSavedInvoices(updatedInvoices);
    saveSavedInvoices(updatedInvoices);
  }

  function saveExpenses(updatedExpenses: Expense[]) {
    setExpenseItems(updatedExpenses);
    localStorage.setItem("frontier-expenses", JSON.stringify(updatedExpenses));
  }

  function toggleInvoice(rowId: string) {
    setSelectedInvoices((current) =>
      current.includes(rowId)
        ? current.filter((invoiceId) => invoiceId !== rowId)
        : [...current, rowId]
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
    const selectedSavedInvoiceIds = selectedInvoices.filter(
      (id) => !id.startsWith("default-")
    );

    if (selectedSavedInvoiceIds.length > 0) {
      saveSavedInvoiceItems(
        savedInvoices.filter(
          (invoice) => !selectedSavedInvoiceIds.includes(invoice.id)
        )
      );
    }

    setDefaultInvoiceItems((current) =>
      current.filter(
        (invoice) => !selectedInvoices.includes(`default-${invoice.id}`)
      )
    );

    setSelectedInvoices([]);
  }

  function removeSelectedExpenses() {
    saveExpenses(
      expenseItems.filter(
        (expense) =>
          !selectedExpenses.includes(`${expense.workspaceId}-${expense.description}`)
      )
    );

    setSelectedExpenses([]);
  }

  function updateInvoiceStatus(row: FinancialInvoice, status: InvoiceStatus) {
    if (row.source === "saved") {
      saveSavedInvoiceItems(
        savedInvoices.map((invoice) =>
          invoice.id === row.invoice.id ? { ...invoice, status } : invoice
        )
      );
      return;
    }

    setDefaultInvoiceItems((current) =>
      current.map((invoice) =>
        invoice.id === row.invoice.id ? { ...invoice, status } : invoice
      )
    );
  }

  function closeExpenseModal() {
    setNewExpenseOpen(false);
    setExpenseDescription("");
    setExpenseCategory("Materials");
    setExpenseAmount("");
  }

  function addExpense() {
    if (!expenseDescription.trim()) return;

    const amount = Number(expenseAmount);
    if (Number.isNaN(amount) || amount <= 0) return;

    saveExpenses([
      ...expenseItems,
      {
        description: expenseDescription.trim(),
        category: expenseCategory,
        amount: formatCurrency(amount),
        workspaceId: activeWorkspace.id,
      },
    ]);

    closeExpenseModal();
  }

  const revenue = workspaceInvoices
    .filter((row) => getFinancialInvoiceStatus(row) === "Paid")
    .reduce((total, row) => total + getFinancialInvoiceTotal(row), 0);

  const outstanding = workspaceInvoices
    .filter((row) => getFinancialInvoiceStatus(row) !== "Paid")
    .reduce((total, row) => total + getFinancialInvoiceTotal(row), 0);

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
          value={formatCurrency(revenue)}
          icon="$"
          iconClass="bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300"
          note="Paid invoices"
        />

        <SummaryCard
          title="Expenses"
          value={formatCurrency(totalExpenses)}
          icon="↘"
          iconClass="bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300"
        />

        <SummaryCard
          title="Outstanding"
          value={formatCurrency(outstanding)}
          icon="◷"
          iconClass="bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300"
        />

        <SummaryCard
          title="Profit"
          value={formatCurrency(profit)}
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
              <Link
                href="/invoices/new"
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
              >
                + Create Invoice
              </Link>

              <button
                type="button"
                onClick={removeSelectedInvoices}
                disabled={selectedInvoices.length === 0}
                className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          </div>

          <table className="min-w-[820px] w-full">
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
                workspaceInvoices.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-gray-200 text-base last:border-b-0 dark:border-gray-800 lg:text-lg"
                  >
                    <td className="px-4 py-5 text-center">
                      <input
                        type="checkbox"
                        checked={selectedInvoices.includes(row.id)}
                        onChange={() => toggleInvoice(row.id)}
                        className="h-4 w-4"
                      />
                    </td>

                    <td className="px-6 py-5 font-medium text-gray-950 dark:text-gray-100">
                      {row.source === "saved" ? (
                        <Link
                          href={`/invoices/${row.invoice.id}`}
                          className="text-blue-600 hover:underline dark:text-blue-400"
                        >
                          {getFinancialInvoiceNumber(row)}
                        </Link>
                      ) : (
                        getFinancialInvoiceNumber(row)
                      )}
                    </td>

                    <td className="px-6 py-5 text-gray-500 dark:text-gray-400">
                      {getFinancialInvoiceClient(row)}
                    </td>

                    <td className="px-6 py-5">
                      <select
                        value={getFinancialInvoiceStatus(row)}
                        onChange={(event) =>
                          updateInvoiceStatus(row, event.target.value as InvoiceStatus)
                        }
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                      >
                        {invoiceStatuses.map((status) => (
                          <option key={status}>{status}</option>
                        ))}
                      </select>
                    </td>

                    <td className="px-6 py-5 text-right font-medium text-gray-950 dark:text-gray-100">
                      {formatCurrency(getFinancialInvoiceTotal(row))}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-lg text-gray-500 dark:text-gray-400">
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
                    <tr key={expenseId} className="border-b border-gray-200 text-base last:border-b-0 dark:border-gray-800 lg:text-lg">
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
                  <td colSpan={4} className="px-6 py-12 text-center text-lg text-gray-500 dark:text-gray-400">
                    No expenses for {activeWorkspace.name}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {newExpenseOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-950 dark:text-gray-100">Add Expense</h2>
              <button onClick={closeExpenseModal} className="text-2xl text-gray-500">×</button>
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
