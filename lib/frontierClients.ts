import { clients as defaultClients } from "@/lib/clients";
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
  if (!value) return defaultClients;

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : defaultClients;
  } catch {
    return defaultClients;
  }
}

export function loadClients() {
  return readStoredJson(storageKeys.clients, defaultClients as ClientRow[]);
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
