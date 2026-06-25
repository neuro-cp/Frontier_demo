"use client";

import { useEffect, useState } from "react";

import { useWorkspace } from "@/components/WorkspaceContext";

export type ClientPortalDataType = "jobs" | "invoices" | "estimates" | "documents";

export type ClientPortalDataItem = Record<string, string | number | null>;

export function useClientPortalData(type: ClientPortalDataType) {
  const { activeWorkspace } = useWorkspace();
  const [items, setItems] = useState<ClientPortalDataItem[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const query = new URLSearchParams({ type, workspaceId: activeWorkspace.id });

    fetch(`/api/client-portal/data?${query.toString()}`)
      .then((response) => response.json())
      .then((payload: { items?: ClientPortalDataItem[]; error?: string }) => {
        if (cancelled) return;
        if (payload.error) {
          setItems([]);
          setError(payload.error);
          return;
        }
        setItems(payload.items ?? []);
      })
      .catch(() => {
        if (!cancelled) {
          setItems([]);
          setError("Unable to load client portal data.");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeWorkspace.id, type]);

  return { items, error, isLoading };
}
