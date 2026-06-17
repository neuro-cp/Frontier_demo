"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(error.message);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center p-6 text-gray-950 dark:text-gray-100">
      <form onSubmit={login} className="space-y-4 rounded-xl bg-white p-6 shadow dark:bg-gray-900">
        <h1 className="text-2xl font-bold">Sign In</h1>
        {message && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{message}</div>}
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className="w-full rounded-lg border p-3 dark:border-gray-700 dark:bg-gray-800" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required className="w-full rounded-lg border p-3 dark:border-gray-700 dark:bg-gray-800" />
        <button className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white">Sign In</button>
        <div className="flex justify-between text-sm">
          <Link href="/signup" className="text-blue-600">Create account</Link>
          <Link href="/reset-password" className="text-blue-600">Reset password</Link>
        </div>
      </form>
    </main>
  );
}
