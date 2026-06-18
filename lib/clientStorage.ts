"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

export const storageKeys = {
  activeWorkspace: "frontier-active-workspace",
  adminViewAdminUserId: "frontier-admin-view-admin-user-id",
  adminViewUserId: "frontier-admin-view-user-id",
  adminViewWorkspaceId: "frontier-admin-view-workspace-id",
  adminViewWorkspaceName: "frontier-admin-view-workspace-name",
  adminViewWorkspaceType: "frontier-admin-view-workspace-type",
  clientCalendarEvents: "frontier-client-calendar-events",
  clients: "frontier-clients",
  documents: "frontier-documents",
  expenses: "frontier-expenses",
  inventory: "frontier-inventory",
  invoiceDraft: "frontier-invoice-draft",
  invoices: "frontier-invoices",
  jobs: "frontier-jobs",
  settings: "frontier-settings",
  theme: "frontier-theme",
  workspaces: "frontier-workspaces",
} as const;

type StoredStateSetter<T> = T | ((current: T) => T);

type StoredClientForMigration = {
  id: string;
  workspaceId: string;
  name: string;
};

type StoredJobForMigration = {
  client?: string;
  clientId?: string;
  workspaceId?: string;
};

function getStorageEventName(key: string) {
  return `frontier-storage:${key}`;
}

function repairLegacyJobClientIds(snapshot: string) {
  if (typeof window === "undefined") return snapshot;

  try {
    const jobs = JSON.parse(snapshot) as StoredJobForMigration[];
    const savedClients = window.localStorage.getItem(storageKeys.clients);
    const storedClients = savedClients ? JSON.parse(savedClients) : [];
    const clients = Array.isArray(storedClients)
      ? (storedClients as StoredClientForMigration[])
      : [];

    if (!Array.isArray(jobs)) return snapshot;

    let changed = false;
    const repairedJobs = jobs.map((job) => {
      if (job.clientId || !job.client?.trim() || !job.workspaceId) return job;

      // Legacy localStorage jobs only stored the client name.
      const matchingClient = clients.find(
        (client) =>
          client.workspaceId === job.workspaceId &&
          client.name.trim().toLowerCase() === job.client?.trim().toLowerCase()
      );

      if (!matchingClient) return job;

      changed = true;
      return { ...job, clientId: matchingClient.id };
    });

    if (!changed) return snapshot;

    const repairedSnapshot = JSON.stringify(repairedJobs);
    queueMicrotask(() => {
      window.localStorage.setItem(storageKeys.jobs, repairedSnapshot);
      window.dispatchEvent(new Event(getStorageEventName(storageKeys.jobs)));
    });

    return repairedSnapshot;
  } catch {
    return snapshot;
  }
}

function maybeRepairStoredJsonSnapshot(key: string, snapshot: string) {
  return key === storageKeys.jobs ? repairLegacyJobClientIds(snapshot) : snapshot;
}

export function readStoredJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  const saved = window.localStorage.getItem(key);
  if (!saved) return fallback;

  try {
    return JSON.parse(maybeRepairStoredJsonSnapshot(key, saved)) as T;
  } catch {
    return fallback;
  }
}

export function writeStoredJson<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(getStorageEventName(key)));
}

export function readStoredString(key: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  return window.localStorage.getItem(key) ?? fallback;
}

export function writeStoredString(key: string, value: string) {
  window.localStorage.setItem(key, value);
  window.dispatchEvent(new Event(getStorageEventName(key)));
}

export function removeStoredValue(key: string) {
  window.localStorage.removeItem(key);
  window.dispatchEvent(new Event(getStorageEventName(key)));
}

export function useStoredJsonState<T>(
  key: string,
  fallback: T
): [T, (value: StoredStateSetter<T>) => void] {
  const fallbackSnapshot = useMemo(() => JSON.stringify(fallback), [fallback]);

  const getSnapshot = useCallback(() => {
    if (typeof window === "undefined") return fallbackSnapshot;
    const saved = window.localStorage.getItem(key) ?? fallbackSnapshot;
    return maybeRepairStoredJsonSnapshot(key, saved);
  }, [fallbackSnapshot, key]);

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      function handleStorage(event: StorageEvent) {
        if (event.key === key) onStoreChange();
      }

      window.addEventListener("storage", handleStorage);
      window.addEventListener(getStorageEventName(key), onStoreChange);

      return () => {
        window.removeEventListener("storage", handleStorage);
        window.removeEventListener(getStorageEventName(key), onStoreChange);
      };
    },
    [key]
  );

  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => fallbackSnapshot
  );

  const value = useMemo(() => {
    try {
      return JSON.parse(snapshot) as T;
    } catch {
      return fallback;
    }
  }, [fallback, snapshot]);

  const setValue = useCallback(
    (nextValue: StoredStateSetter<T>) => {
      const current = readStoredJson(key, fallback);
      const resolvedValue =
        typeof nextValue === "function"
          ? (nextValue as (current: T) => T)(current)
          : nextValue;

      writeStoredJson(key, resolvedValue);
    },
    [fallback, key]
  );

  return [value, setValue];
}

export function useStoredStringState(
  key: string,
  fallback: string
): [string, (value: StoredStateSetter<string>) => void] {
  const getSnapshot = useCallback(() => readStoredString(key, fallback), [
    fallback,
    key,
  ]);

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      function handleStorage(event: StorageEvent) {
        if (event.key === key) onStoreChange();
      }

      window.addEventListener("storage", handleStorage);
      window.addEventListener(getStorageEventName(key), onStoreChange);

      return () => {
        window.removeEventListener("storage", handleStorage);
        window.removeEventListener(getStorageEventName(key), onStoreChange);
      };
    },
    [key]
  );

  const value = useSyncExternalStore(subscribe, getSnapshot, () => fallback);

  const setValue = useCallback(
    (nextValue: StoredStateSetter<string>) => {
      const current = readStoredString(key, fallback);
      const resolvedValue =
        typeof nextValue === "function"
          ? (nextValue as (current: string) => string)(current)
          : nextValue;

      writeStoredString(key, resolvedValue);
    },
    [fallback, key]
  );

  return [value, setValue];
}
