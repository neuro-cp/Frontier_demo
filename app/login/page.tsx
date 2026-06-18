"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { getAuthErrorMessage } from "@/lib/auth/messages";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSigningIn(true);

    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage(getAuthErrorMessage(error, "Unable to sign in."));
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setMessage(getAuthErrorMessage(error, "Unable to sign in."));
    } finally {
      setIsSigningIn(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center p-6 text-gray-950 dark:text-gray-100">
      <form onSubmit={login} className="space-y-4 rounded-xl bg-white p-6 shadow dark:bg-gray-900">
        <h1 className="text-2xl font-bold">Sign In</h1>
        {message && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{message}</div>}
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required disabled={isSigningIn} className="w-full rounded-lg border p-3 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:disabled:bg-gray-800/60" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required disabled={isSigningIn} className="w-full rounded-lg border p-3 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:disabled:bg-gray-800/60" />
        <button disabled={isSigningIn} className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-400">{isSigningIn ? "Signing in..." : "Sign In"}</button>
        <div className="flex justify-between text-sm">
          <Link href="/signup" className="text-blue-600">Create account</Link>
          <Link href="/reset-password" className="text-blue-600">Reset password</Link>
        </div>
      </form>
    </main>
  );
}
