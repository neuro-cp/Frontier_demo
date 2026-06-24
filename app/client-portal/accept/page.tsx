"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { useAuthSession } from "@/components/AuthSessionProvider";

export default function ClientPortalAcceptPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { user } = useAuthSession();
  const [status, setStatus] = useState<"idle" | "accepted" | "error">("idle");
  const [message, setMessage] = useState("");
  const [isAccepting, setIsAccepting] = useState(false);

  async function acceptInvite() {
    if (!token || isAccepting) return;
    setIsAccepting(true);
    setMessage("");

    try {
      const response = await fetch("/api/client-portal/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Unable to accept invite.");
      setStatus("accepted");
      setMessage("Client portal invite accepted.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to accept invite.");
    } finally {
      setIsAccepting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <h1 className="text-2xl font-bold text-gray-950 dark:text-gray-100">
        Accept Client Portal Invite
      </h1>

      {!token && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          Invite token is missing.
        </p>
      )}

      {!user ? (
        <div className="mt-4 space-y-3">
          <p className="text-gray-600 dark:text-gray-300">
            Sign in or create an account to accept this invite. After signing in, return to this invite link.
          </p>
          <div className="flex gap-2">
            <Link href="/login" className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">
              Log in
            </Link>
            <Link href="/signup" className="rounded-lg border border-gray-300 px-4 py-2 font-semibold hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800">
              Create account
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Accept this invite to connect your account to the company client portal record.
          </p>
          <button
            type="button"
            onClick={acceptInvite}
            disabled={!token || isAccepting || status === "accepted"}
            className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isAccepting ? "Accepting..." : "Accept Invite"}
          </button>
        </div>
      )}

      {message && (
        <div
          className={`mt-4 rounded-lg border p-3 text-sm ${
            status === "accepted"
              ? "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300"
              : "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
          }`}
        >
          {message}
        </div>
      )}

      {status === "accepted" && (
        <Link
          href="/client-portal"
          className="mt-4 inline-flex rounded-lg border border-blue-600 px-4 py-2 font-semibold text-blue-700 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-950/30"
        >
          Open Client Portal
        </Link>
      )}
    </div>
  );
}
