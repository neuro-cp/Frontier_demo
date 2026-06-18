"use client";

import Link from "next/link";
import { useState } from "react";

import { getAuthErrorMessage } from "@/lib/auth/messages";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  async function reset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSending(true);

    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      setMessage(
        error
          ? getAuthErrorMessage(error, "Unable to send reset email.")
          : "Password reset email sent."
      );
    } catch (error) {
      setMessage(getAuthErrorMessage(error, "Unable to send reset email."));
    } finally {
      setIsSending(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center p-6 text-gray-950 dark:text-gray-100">
      <form onSubmit={reset} className="space-y-4 rounded-xl bg-white p-6 shadow dark:bg-gray-900">
        <h1 className="text-2xl font-bold">Reset Password</h1>
        {message && <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">{message}</div>}
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required disabled={isSending} className="w-full rounded-lg border p-3 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:disabled:bg-gray-800/60" />
        <button disabled={isSending} className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-400">{isSending ? "Sending reset email..." : "Send Reset Email"}</button>
        <Link href="/login" className="block text-sm text-blue-600">Back to login</Link>
      </form>
    </main>
  );
}
