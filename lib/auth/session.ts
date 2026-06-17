import { redirect } from "next/navigation";

import { maybeCreateServerSupabaseClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = await maybeCreateServerSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getUser();
  if (error) return null;

  return data.user;
}

export async function getCurrentClaims() {
  const supabase = await maybeCreateServerSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getClaims();
  if (error) return null;

  return data?.claims ?? null;
}

export async function requireCurrentUser(redirectTo = "/") {
  const user = await getCurrentUser();

  if (!user) {
    redirect(redirectTo);
  }

  return user;
}
