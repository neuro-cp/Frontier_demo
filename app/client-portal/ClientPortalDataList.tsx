"use client";

import { useClientPortalData, type ClientPortalDataType } from "@/lib/portals/useClientPortalData";

type Column = {
  key: string;
  label: string;
  format?: (value: string | number | null) => string;
};

type ClientPortalDataListProps = {
  type: ClientPortalDataType;
  columns: Column[];
  emptyText: string;
};

function formatDate(value: string | number | null) {
  if (!value) return "-";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString();
}

export const clientPortalFormatters = {
  date: formatDate,
  moneyCents(value: string | number | null) {
    const cents = Number(value ?? 0);
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
  },
  bytes(value: string | number | null) {
    const bytes = Number(value ?? 0);
    if (!bytes) return "-";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  },
};

export default function ClientPortalDataList({ type, columns, emptyText }: ClientPortalDataListProps) {
  const { items, error, isLoading } = useClientPortalData(type);

  if (isLoading) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>;
  }

  if (error) {
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
        {error}
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
        {emptyText}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="border-b border-gray-200 px-3 py-2 dark:border-gray-800">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={String(item.id)} className="text-gray-700 dark:text-gray-200">
              {columns.map((column) => {
                const value = item[column.key] ?? null;
                return (
                  <td key={column.key} className="border-b border-gray-100 px-3 py-3 dark:border-gray-800">
                    {column.format ? column.format(value) : String(value ?? "-")}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
