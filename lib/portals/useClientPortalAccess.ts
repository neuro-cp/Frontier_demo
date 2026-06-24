"use client";

import { useEffect, useState } from "react";

import { useAuthSession } from "@/components/AuthSessionProvider";

export type ClientPortalAccess = {
  id: string;
  workspace_id: string;
  client_id: string;
  email: string;
  status: "Active";
  accepted_at: string | null;
  clients?: { id: string; name: string } | null;
};

export function useClientPortalAccess() {
  const { user } = useAuthSession();
  const [access, setAccess] = useState<ClientPortalAccess[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      return;
    }

    let cancelled = false;
    fetch("/api/client-portal/access")
      .then((response) => response.json())
      .then((payload: { access?: ClientPortalAccess[]; error?: string }) => {
        if (cancelled) return;
        if (payload.error) {
          setError(payload.error);
          setAccess([]);
          return;
        }
        setAccess(payload.access ?? []);
        setError("");
      })
      .catch(() => {
        if (!cancelled) {
          setError("Unable to load client portal access.");
          setAccess([]);
        }
      })

    return () => {
      cancelled = true;
    };
  }, [user]);

  return {
    access: user ? access : [],
    error,
    isLoading: false,
    hasActiveAccess: Boolean(user && access.length > 0),
  };
}
