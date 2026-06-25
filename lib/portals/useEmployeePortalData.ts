"use client";

import { useEffect, useState } from "react";

import { useWorkspace } from "@/components/WorkspaceContext";

export type EmployeePortalDataType = "jobs" | "routes" | "materials" | "photos" | "updates" | "assignments";

export type EmployeePortalDataItem = Record<string, string | number | null>;

export function useEmployeePortalData(type: EmployeePortalDataType) {
  const { activeWorkspace } = useWorkspace();
  const [items, setItems] = useState<EmployeePortalDataItem[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const query = new URLSearchParams({ type, workspaceId: activeWorkspace.id });

    fetch(`/api/employee-portal/data?${query.toString()}`)
      .then((response) => response.json())
      .then((payload: { items?: EmployeePortalDataItem[]; error?: string }) => {
        if (cancelled) return;
        if (payload.error) {
          setItems([]);
          setError(payload.error);
          return;
        }
        setItems(payload.items ?? []);
        setError("");
      })
      .catch(() => {
        if (!cancelled) {
          setItems([]);
          setError("Unable to load employee portal data.");
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
