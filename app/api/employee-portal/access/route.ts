import { NextResponse } from "next/server";

import { createServiceRoleClient } from "@/lib/platformAdmin/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET() {
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) return jsonError("Sign in required.", 401);

  const serviceClient = createServiceRoleClient();
  const { data, error } = await serviceClient
    .from("workspace_members")
    .select("id, workspace_id, role, status, workspaces(id, name, type)")
    .eq("user_id", user.id)
    .eq("role", "Employee")
    .eq("status", "Active")
    .order("created_at", { ascending: false });

  if (error) return jsonError(error.message || "Unable to load employee access.", 500);
  return NextResponse.json({ access: data ?? [] });
}
