"use client";

import { useEffect, useState } from "react";

export type ClientPortalDataType = "jobs" | "invoices" | "estimates" | "documents";

export type ClientPortalDataItem = Record<string, string | number | null>;

export function useClientPortalData(type: ClientPortalDataType) {
  const [items, setItems] = useState<ClientPortalDataItem[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/client-portal/data?type=${encodeURIComponent(type)}`)
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
  }, [type]);

  return { items, error, isLoading };
}
