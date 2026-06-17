"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function signup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const supabase = createBrowserSupabaseClient();
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setMessage(error.message);
      return;
    }
    if (data.session) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setMessage("Account created. Check your email to confirm your signup.");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center p-6 text-gray-950 dark:text-gray-100">
      <form onSubmit={signup} className="space-y-4 rounded-xl bg-white p-6 shadow dark:bg-gray-900">
        <h1 className="text-2xl font-bold">Create Account</h1>
        {message && <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">{message}</div>}
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className="w-full rounded-lg border p-3 dark:border-gray-700 dark:bg-gray-800" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required className="w-full rounded-lg border p-3 dark:border-gray-700 dark:bg-gray-800" />
        <button className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white">Create Account</button>
        <Link href="/login" className="block text-sm text-blue-600">Already have an account?</Link>
      </form>
    </main>
  );
}
