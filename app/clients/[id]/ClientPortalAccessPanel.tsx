"use client";

import { useEffect, useState } from "react";

import type { ClientRow } from "@/lib/clientTypes";

type AccessRow = {
  id: string;
  user_id: string | null;
  email: string;
  status: "Invited" | "Active" | "Revoked" | "Expired";
  invite_expires_at: string | null;
  accepted_at: string | null;
  created_at: string;
};

type ClientPortalAccessPanelProps = {
  client: ClientRow;
  isDatabaseMode: boolean;
};

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : "-";
}

export default function ClientPortalAccessPanel({
  client,
  isDatabaseMode,
}: ClientPortalAccessPanelProps) {
  const [accessRows, setAccessRows] = useState<AccessRow[]>([]);
  const [inviteEmail, setInviteEmail] = useState(client.email ?? "");
  const [inviteLink, setInviteLink] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isDatabaseMode) return;
    let cancelled = false;
    fetch(
      `/api/client-portal/access?workspaceId=${encodeURIComponent(
        client.workspaceId
      )}&clientId=${encodeURIComponent(client.id)}`
    )
      .then((response) => response.json())
      .then((payload: { access?: AccessRow[]; error?: string }) => {
        if (cancelled) return;
        if (payload.error) {
          setError(payload.error);
          return;
        }
        setAccessRows(payload.access ?? []);
      })
      .catch(() => {
        if (!cancelled) setError("Unable to load client portal access.");
      });

    return () => {
      cancelled = true;
    };
  }, [client.id, client.workspaceId, isDatabaseMode]);

  async function createInvite() {
    if (!inviteEmail.trim() || isSaving) return;
    setIsSaving(true);
    setError("");
    setStatusMessage("");
    setInviteLink("");

    try {
      const response = await fetch("/api/client-portal/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: client.workspaceId,
          clientId: client.id,
          email: inviteEmail,
        }),
      });
      const payload = (await response.json()) as {
        access?: AccessRow;
        invitePath?: string;
        error?: string;
      };

      if (!response.ok || !payload.access || !payload.invitePath) {
        throw new Error(payload.error || "Unable to create invite.");
      }

      setAccessRows((current) => [
        payload.access as AccessRow,
        ...current.filter((row) => row.id !== payload.access?.id),
      ]);
      setInviteLink(`${window.location.origin}${payload.invitePath}`);
      setStatusMessage("Client portal invite created.");
    } catch (inviteError) {
      setError(
        inviteError instanceof Error
          ? inviteError.message
          : "Unable to create invite."
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function revokeAccess(accessId: string) {
    setError("");
    setStatusMessage("");
    const response = await fetch("/api/client-portal/invites", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspaceId: client.workspaceId,
        accessId,
        status: "Revoked",
      }),
    });
    const payload = (await response.json()) as {
      access?: AccessRow;
      error?: string;
    };
    if (!response.ok || !payload.access) {
      setError(payload.error || "Unable to revoke access.");
      return;
    }
    setAccessRows((current) =>
      current.map((row) => (row.id === accessId ? payload.access as AccessRow : row))
    );
    setStatusMessage("Client portal access revoked.");
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-900">
      <h2 className="text-xl font-semibold">Client Portal Access</h2>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Invite this client to connect their user account to this workspace client record.
      </p>

      {!isDatabaseMode ? (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          Sign in to create client portal invites.
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              value={inviteEmail}
              onChange={(event) => setInviteEmail(event.target.value)}
              placeholder="client@example.com"
              className="min-w-0 flex-1 rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
            />
            <button
              type="button"
              onClick={createInvite}
              disabled={isSaving || !inviteEmail.trim()}
              className="rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Creating..." : "Invite to Client Portal"}
            </button>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </div>
          )}
          {statusMessage && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300">
              {statusMessage}
            </div>
          )}
          {inviteLink && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm dark:border-blue-900 dark:bg-blue-950/40">
              <div className="font-semibold text-blue-800 dark:text-blue-200">
                Copyable invite link
              </div>
              <div className="mt-2 break-all text-blue-700 dark:text-blue-300">
                {inviteLink}
              </div>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(inviteLink)}
                className="mt-3 rounded-lg border border-blue-600 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 dark:text-blue-300 dark:hover:bg-blue-950"
              >
                Copy Link
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Accepted</th>
                  <th className="py-2 pr-4">Expires</th>
                  <th className="py-2 pr-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {accessRows.length > 0 ? (
                  accessRows.map((row) => (
                    <tr key={row.id} className="border-t border-gray-200 dark:border-gray-800">
                      <td className="py-3 pr-4">{row.email}</td>
                      <td className="py-3 pr-4">{row.status}</td>
                      <td className="py-3 pr-4">{formatDate(row.accepted_at)}</td>
                      <td className="py-3 pr-4">{formatDate(row.invite_expires_at)}</td>
                      <td className="py-3 pr-4">
                        {row.status !== "Revoked" && (
                          <button
                            type="button"
                            onClick={() => revokeAccess(row.id)}
                            className="rounded-lg border border-red-600 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/30"
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-4 text-gray-500 dark:text-gray-400" colSpan={5}>
                      No client portal access exists for this client yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
