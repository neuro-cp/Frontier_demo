import { NextRequest, NextResponse } from "next/server";

import { createServiceRoleClient } from "@/lib/platformAdmin/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type DataType = "jobs" | "routes" | "materials" | "photos" | "updates" | "assignments";

const validTypes = new Set<DataType>(["jobs", "routes", "materials", "photos", "updates", "assignments"]);

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function resolveEmployeeWorkspace(userId: string, requestedWorkspaceId: string | null) {
  const serviceClient = createServiceRoleClient();
  let query = serviceClient
    .from("workspace_members")
    .select("workspace_id, role, status, workspaces(id, name, type)")
    .eq("user_id", userId)
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
  if (access.role !== "Employee" && access.role !== "Owner" && access.role !== "Manager") {
    return jsonError("Active employee portal access required.", 403);
  }

  const workspaceId = access.workspace_id;
  let assignmentQuery = serviceClient
    .from("employee_job_assignments")
    .select("id, job_id, status, notes, created_at")
    .eq("workspace_id", workspaceId)
    .neq("status", "Removed")
    .order("created_at", { ascending: false });
  if (access.role === "Employee") assignmentQuery = assignmentQuery.eq("employee_user_id", user.id);
  const { data: assignments, error: assignmentError } = await assignmentQuery;

  if (assignmentError) return jsonError(assignmentError.message || "Unable to load assignments.", 500);

  const jobIds = (assignments ?? []).map((assignment) => assignment.job_id);
  if (type === "assignments") {
    return NextResponse.json({ access, items: assignments ?? [] });
  }

  if (type === "routes" || type === "updates") {
    if (type === "routes") return NextResponse.json({ access, items: [] });
  }

  if (jobIds.length === 0 && access.role === "Employee") {
    return NextResponse.json({ access, items: [] });
  }

  if (type === "jobs") {
    let query = serviceClient
      .from("jobs")
      .select("id, workspace_id, name, status, scheduled_date, scheduled_time, estimated_value_cents, notes, client_name_snapshot, created_at")
      .eq("workspace_id", workspaceId)
      .order("scheduled_date", { ascending: true, nullsFirst: false });
    if (access.role === "Employee") query = query.in("id", jobIds);
    const { data, error } = await query;
    if (error) return jsonError(error.message || "Unable to load assigned jobs.", 500);
    return NextResponse.json({ access, items: data ?? [] });
  }

  if (type === "materials") {
    let query = serviceClient
      .from("job_materials")
      .select("id, job_id, name, quantity, created_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });
    if (access.role === "Employee") query = query.in("job_id", jobIds);
    const { data, error } = await query;
    if (error) return jsonError(error.message || "Unable to load assigned materials.", 500);
    return NextResponse.json({ access, items: data ?? [] });
  }

  if (type === "updates") {
    let query = serviceClient
      .from("employee_job_updates")
      .select("id, job_id, update_type, body, completion_percent, material_name, material_quantity, status, created_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });
    if (access.role === "Employee") query = query.eq("employee_user_id", user.id).in("job_id", jobIds);
    const { data, error } = await query;
    if (error) return jsonError(error.message || "Unable to load employee updates.", 500);
    return NextResponse.json({ access, items: data ?? [] });
  }

  let query = serviceClient
    .from("documents")
    .select("id, job_id, name, detected_type, extraction_status, file_name, mime_type, size_bytes, created_at")
    .eq("workspace_id", workspaceId)
    .like("mime_type", "image/%")
    .order("created_at", { ascending: false });
  if (access.role === "Employee") query = query.in("job_id", jobIds);
  const { data, error } = await query;
  if (error) return jsonError(error.message || "Unable to load assigned photos.", 500);
  return NextResponse.json({ access, items: data ?? [] });
}
