"use client";

import { useEffect, useState } from "react";

import { useAuthSession } from "@/components/AuthSessionProvider";
import { useWorkspace } from "@/components/WorkspaceContext";

type EmployeePortalAccess = {
  id: string;
  workspace_id: string;
  role: "Employee" | "Owner" | "Manager";
  status: "Active";
  workspaces?: { id: string; name: string; type: string } | null;
};

export function useEmployeePortalAccess() {
  const { user } = useAuthSession();
  const { activeWorkspace } = useWorkspace();
  const [access, setAccess] = useState<EmployeePortalAccess[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    const query = new URLSearchParams({ workspaceId: activeWorkspace.id });
    fetch(`/api/employee-portal/access?${query.toString()}`)
      .then((response) => response.json())
      .then((payload: { access?: EmployeePortalAccess[]; error?: string }) => {
        if (cancelled) return;
        if (payload.error) {
          setAccess([]);
          setError(payload.error);
          return;
        }
        setAccess(payload.access ?? []);
        setError("");
      })
      .catch(() => {
        if (!cancelled) {
          setAccess([]);
          setError("Unable to load employee portal access.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeWorkspace.id, user]);

  return {
    access: user ? access : [],
    error,
    hasActiveAccess: Boolean(user && access.length > 0),
    isWorkspacePreview: access.some((item) => item.role === "Owner" || item.role === "Manager"),
  };
}
