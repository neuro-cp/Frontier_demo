import { readStoredJson, storageKeys, writeStoredJson } from "@/lib/clientStorage";
import { formatCurrency } from "@/lib/frontierInvoices";

export type ClientRow = {
  id: string;
  workspaceId: string;
  name: string;
  status: string;
  balance: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
};

export const clientStatuses = ["Lead", "Active", "Inactive"] as const;
export type ClientStatus = (typeof clientStatuses)[number];

export function safeParseClients(value: string | null): ClientRow[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function loadClients() {
  return readStoredJson(storageKeys.clients, [] as ClientRow[]);
}

export function saveClients(clients: ClientRow[]) {
  writeStoredJson(storageKeys.clients, clients);
}

export function formatClientBalance(value: string) {
  const numericValue = Number(value.replace(/[$,]/g, ""));

  if (Number.isNaN(numericValue)) {
    return "$0";
  }

  return formatCurrency(numericValue).replace(".00", "");
}

export function normalizeName(value: string) {
  return value.trim().toLowerCase();
}
