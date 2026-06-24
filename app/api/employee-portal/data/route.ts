import { NextRequest, NextResponse } from "next/server";

import { createServiceRoleClient } from "@/lib/platformAdmin/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type DataType = "jobs" | "routes" | "materials" | "photos" | "updates";

const validTypes = new Set<DataType>(["jobs", "routes", "materials", "photos", "updates"]);

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function resolveEmployeeWorkspace(userId: string, requestedWorkspaceId: string | null) {
  const serviceClient = createServiceRoleClient();
  let query = serviceClient
    .from("workspace_members")
    .select("workspace_id, role, status, workspaces(id, name, type)")
    .eq("user_id", userId)
    .eq("role", "Employee")
    .eq("status", "Active")
    .order("created_at", { ascending: false });

  if (requestedWorkspaceId) query = query.eq("workspace_id", requestedWorkspaceId);

  const { data, error } = await query.limit(1).maybeSingle();
  if (error) throw error;
  return { serviceClient, access: data };
}

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type") as DataType | null;
  if (!type || !validTypes.has(type)) return jsonError("Unsupported employee portal data type.", 400);

  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) return jsonError("Sign in required.", 401);

  const requestedWorkspaceId = request.nextUrl.searchParams.get("workspaceId");
  const { serviceClient, access } = await resolveEmployeeWorkspace(user.id, requestedWorkspaceId);
  if (!access) return jsonError("Active employee portal access required.", 403);

  const workspaceId = access.workspace_id;
  const { data: assignments, error: assignmentError } = await serviceClient
    .from("employee_job_assignments")
    .select("id, job_id, status, notes, created_at")
    .eq("workspace_id", workspaceId)
    .eq("employee_user_id", user.id)
    .neq("status", "Removed")
    .order("created_at", { ascending: false });

  if (assignmentError) return jsonError(assignmentError.message || "Unable to load assignments.", 500);

  const jobIds = (assignments ?? []).map((assignment) => assignment.job_id);
  if (type === "routes" || type === "updates") {
    return NextResponse.json({ access, items: [] });
  }

  if (jobIds.length === 0) {
    return NextResponse.json({ access, items: [] });
  }

  if (type === "jobs") {
    const { data, error } = await serviceClient
      .from("jobs")
      .select("id, name, status, scheduled_date, scheduled_time, estimated_value_cents, notes, client_name_snapshot, created_at")
      .eq("workspace_id", workspaceId)
      .in("id", jobIds)
      .order("scheduled_date", { ascending: true, nullsFirst: false });
    if (error) return jsonError(error.message || "Unable to load assigned jobs.", 500);
    return NextResponse.json({ access, items: data ?? [] });
  }

  if (type === "materials") {
    const { data, error } = await serviceClient
      .from("job_materials")
      .select("id, job_id, name, quantity, created_at")
      .eq("workspace_id", workspaceId)
      .in("job_id", jobIds)
      .order("created_at", { ascending: false });
    if (error) return jsonError(error.message || "Unable to load assigned materials.", 500);
    return NextResponse.json({ access, items: data ?? [] });
  }

  const { data, error } = await serviceClient
    .from("documents")
    .select("id, job_id, name, detected_type, extraction_status, file_name, mime_type, size_bytes, created_at")
    .eq("workspace_id", workspaceId)
    .in("job_id", jobIds)
    .like("mime_type", "image/%")
    .order("created_at", { ascending: false });
  if (error) return jsonError(error.message || "Unable to load assigned photos.", 500);
  return NextResponse.json({ access, items: data ?? [] });
}
