"use client";

import { useWorkspace } from "@/components/WorkspaceContext";

const invoices = [
  {
    id: "INV-001",
    status: "Paid",
    amount: "$850",
    workspaceId: "landscaping",
  },
  {
    id: "INV-005",
    status: "Sent",
    amount: "$450",
    workspaceId: "landscaping",
  },
  {
    id: "INV-002",
    status: "Overdue",
    amount: "$2,400",
    workspaceId: "snow-removal",
  },
  {
    id: "INV-003",
    status: "Paid",
    amount: "$3,200",
    workspaceId: "properties",
  },
  {
    id: "INV-004",
    status: "Sent",
    amount: "$1,200",
    workspaceId: "properties",
  },
];

const expenses = [
  {
    description: "Mulch bulk order",
    category: "Materials",
    amount: "$1,750",
    workspaceId: "landscaping",
  },
  {
    description: "Fuel for fleet",
    category: "Fuel",
    amount: "$420",
    workspaceId: "landscaping",
  },
  {
    description: "Salt bulk order",
    category: "Materials",
    amount: "$900",
    workspaceId: "snow-removal",
  },
  {
    description: "Snow plow maintenance",
    category: "Equipment",
    amount: "$380",
    workspaceId: "snow-removal",
  },
  {
    description: "Monthly property insurance",
    category: "Insurance",
    amount: "$650",
    workspaceId: "properties",
  },
];

function moneyToNumber(value: string) {
  return Number(value.replace(/[$,]/g, ""));
}

function formatMoney(value: number) {
  return `$${value.toLocaleString()}`;
}

function StatusBadge({ status }: { status: string }) {
  const classes =
    status === "Paid"
      ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
      : status === "Sent"
      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
      : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300";

  return (
    <span className={`rounded-full px-3 py-1 text-sm ${classes}`}>
      {status}
    </span>
  );
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
    <div className="flex min-h-36 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
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

  const workspaceInvoices = invoices.filter(
    (invoice) => invoice.workspaceId === activeWorkspace.id
  );

  const workspaceExpenses = expenses.filter(
    (expense) => expense.workspaceId === activeWorkspace.id
  );

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-950 dark:text-gray-100">
          Financials
        </h1>

        <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
          Revenue, expenses, and cash flow for {activeWorkspace.name}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Revenue"
          value={formatMoney(revenue)}
          icon="$"
          iconClass="bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300"
          note="Workspace total"
        />

        <SummaryCard
          title="Expenses"
          value={formatMoney(totalExpenses)}
          icon="↘"
          iconClass="bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300"
        />

        <SummaryCard
          title="Outstanding Invoices"
          value={formatMoney(outstanding)}
          icon="◷"
          iconClass="bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300"
        />

        <SummaryCard
          title="Accounts Receivable"
          value={formatMoney(outstanding)}
          icon="↗"
          iconClass="bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300"
        />
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-200 p-6 dark:border-gray-800">
            <h2 className="text-2xl font-bold text-gray-950 dark:text-gray-100">
              Recent Invoices
            </h2>
          </div>

          <table className="min-w-[650px] w-full">
            <thead>
              <tr className="border-b border-gray-200 text-left text-sm uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:text-gray-400">
                <th className="px-6 py-4">Invoice</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>

            <tbody>
              {workspaceInvoices.length > 0 ? (
                workspaceInvoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="border-b border-gray-200 text-base lg:text-lg last:border-b-0 dark:border-gray-800"
                  >
                    <td className="px-6 py-5 font-medium text-gray-950 dark:text-gray-100">
                      {invoice.id}
                    </td>

                    <td className="px-6 py-5">
                      <StatusBadge status={invoice.status} />
                    </td>

                    <td className="px-6 py-5 text-right font-medium text-gray-950 dark:text-gray-100">
                      {invoice.amount}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={3}
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
          <div className="border-b border-gray-200 p-6 dark:border-gray-800">
            <h2 className="text-2xl font-bold text-gray-950 dark:text-gray-100">
              Recent Expenses
            </h2>
          </div>

          <table className="min-w-[650px] w-full">
            <thead>
              <tr className="border-b border-gray-200 text-left text-sm uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:text-gray-400">
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>

            <tbody>
              {workspaceExpenses.length > 0 ? (
                workspaceExpenses.map((expense) => (
                  <tr
                    key={expense.description}
                    className="border-b border-gray-200 text-base lg:text-lg last:border-b-0 dark:border-gray-800"
                  >
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
                ))
              ) : (
                <tr>
                  <td
                    colSpan={3}
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
    </div>
  );
}