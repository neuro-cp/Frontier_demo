import { NextRequest, NextResponse } from "next/server";

import { createServiceRoleClient } from "@/lib/platformAdmin/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function requireWorkspaceMember(workspaceId: string) {
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) return { ok: false as const, status: 401, error: "Sign in required." };

  const serviceClient = createServiceRoleClient();
  const { data: member, error: memberError } = await serviceClient
    .from("workspace_members")
    .select("id, role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .eq("status", "Active")
    .maybeSingle();

  if (memberError) return { ok: false as const, status: 500, error: memberError.message };
  if (!member) return { ok: false as const, status: 403, error: "Workspace access required." };
  return { ok: true as const, userId: user.id, serviceClient };
}

export async function GET(request: NextRequest) {
  const workspaceId = request.nextUrl.searchParams.get("workspaceId");
  if (!workspaceId) return jsonError("Workspace is required.", 400);

  const access = await requireWorkspaceMember(workspaceId);
  if (!access.ok) return jsonError(access.error, access.status);

  const { data, error } = await access.serviceClient
    .from("workspace_notifications")
    .select("id, type, title, body, entity_type, entity_id, read_at, archived_at, metadata, created_at")
    .eq("workspace_id", workspaceId)
    .is("archived_at", null)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return jsonError(error.message || "Unable to load notifications.", 500);
  return NextResponse.json({
    notifications: data ?? [],
    unreadCount: (data ?? []).filter((notification) => !notification.read_at).length,
  });
}

export async function PATCH(request: NextRequest) {
  let body: { workspaceId?: string; notificationId?: string; action?: "read" | "archive" };
  try {
    body = (await request.json()) as { workspaceId?: string; notificationId?: string; action?: "read" | "archive" };
  } catch {
    return jsonError("Invalid notification request.", 400);
  }

  if (!body.workspaceId || !body.notificationId || !body.action) {
    return jsonError("Workspace, notification, and action are required.", 400);
  }

  const access = await requireWorkspaceMember(body.workspaceId);
  if (!access.ok) return jsonError(access.error, access.status);

  const patch =
    body.action === "archive"
      ? { archived_at: new Date().toISOString(), read_at: new Date().toISOString() }
      : { read_at: new Date().toISOString() };

  const { data, error } = await access.serviceClient
    .from("workspace_notifications")
    .update(patch)
    .eq("id", body.notificationId)
    .eq("workspace_id", body.workspaceId)
    .select("id, read_at, archived_at")
    .single();

  if (error) return jsonError(error.message || "Unable to update notification.", 500);
  return NextResponse.json({ notification: data });
}
