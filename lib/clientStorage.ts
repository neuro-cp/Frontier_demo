"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

export const storageKeys = {
  activeWorkspace: "frontier-active-workspace",
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

function getStorageEventName(key: string) {
  return `frontier-storage:${key}`;
}

export function readStoredJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  const saved = window.localStorage.getItem(key);
  if (!saved) return fallback;

  try {
    return JSON.parse(saved) as T;
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
    return window.localStorage.getItem(key) ?? fallbackSnapshot;
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
