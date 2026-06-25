import { NextRequest, NextResponse } from "next/server";

import { createServiceRoleClient } from "@/lib/platformAdmin/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type AssignmentBody = {
  workspaceId?: string;
  action?: "assign" | "update" | "remove";
  assignmentId?: string;
  jobId?: string;
  employeeUserId?: string;
  status?: "Assigned" | "Completed" | "Removed";
  notes?: string;
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function getActor(workspaceId: string) {
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
  if (!member || (member.role !== "Owner" && member.role !== "Manager")) {
    return { ok: false as const, status: 403, error: "Only Owners and Managers can manage employee assignments." };
  }

  return { ok: true as const, userId: user.id, serviceClient };
}

export async function GET(request: NextRequest) {
  const workspaceId = request.nextUrl.searchParams.get("workspaceId");
  if (!workspaceId) return jsonError("Workspace is required.", 400);

  const actor = await getActor(workspaceId);
  if (!actor.ok) return jsonError(actor.error, actor.status);
  const serviceClient = actor.serviceClient;

  const [employeesResult, jobsResult, assignmentsResult] = await Promise.all([
    serviceClient
      .from("workspace_members")
      .select("id, user_id, role, status, invited_email, created_at")
      .eq("workspace_id", workspaceId)
      .eq("role", "Employee")
      .neq("status", "Removed")
      .order("created_at", { ascending: false }),
    serviceClient
      .from("jobs")
      .select("id, name, status, scheduled_date, scheduled_time, client_name_snapshot")
      .eq("workspace_id", workspaceId)
      .order("scheduled_date", { ascending: true, nullsFirst: false }),
    serviceClient
      .from("employee_job_assignments")
      .select("id, workspace_id, job_id, employee_user_id, status, notes, created_at, updated_at")
      .eq("workspace_id", workspaceId)
      .neq("status", "Removed")
      .order("created_at", { ascending: false }),
  ]);

  if (employeesResult.error) return jsonError(employeesResult.error.message, 500);
  if (jobsResult.error) return jsonError(jobsResult.error.message, 500);
  if (assignmentsResult.error) return jsonError(assignmentsResult.error.message, 500);

  return NextResponse.json({
    employees: employeesResult.data ?? [],
    jobs: jobsResult.data ?? [],
    assignments: assignmentsResult.data ?? [],
  });
}

export async function POST(request: NextRequest) {
  let body: AssignmentBody;
  try {
    body = (await request.json()) as AssignmentBody;
  } catch {
    return jsonError("Invalid assignment request.", 400);
  }

  if (!body.workspaceId || !body.action) return jsonError("Workspace and action are required.", 400);

  const actor = await getActor(body.workspaceId);
  if (!actor.ok) return jsonError(actor.error, actor.status);
  const serviceClient = actor.serviceClient;

  if (body.action === "assign") {
    if (!body.jobId || !body.employeeUserId) return jsonError("Job and employee are required.", 400);

    const [{ data: employee }, { data: job }] = await Promise.all([
      serviceClient
        .from("workspace_members")
        .select("id")
        .eq("workspace_id", body.workspaceId)
        .eq("user_id", body.employeeUserId)
        .eq("role", "Employee")
        .eq("status", "Active")
        .maybeSingle(),
      serviceClient
        .from("jobs")
        .select("id")
        .eq("workspace_id", body.workspaceId)
        .eq("id", body.jobId)
        .maybeSingle(),
    ]);

    if (!employee) return jsonError("Active employee not found.", 400);
    if (!job) return jsonError("Job not found.", 404);

    const { data: existing, error: existingError } = await serviceClient
      .from("employee_job_assignments")
      .select("id")
      .eq("workspace_id", body.workspaceId)
      .eq("job_id", body.jobId)
      .eq("employee_user_id", body.employeeUserId)
      .neq("status", "Removed")
      .maybeSingle();

    if (existingError) return jsonError(existingError.message, 500);

    const write = existing
      ? await serviceClient
          .from("employee_job_assignments")
          .update({ status: "Assigned", notes: body.notes?.trim() || null })
          .eq("id", existing.id)
          .select("id, workspace_id, job_id, employee_user_id, status, notes, created_at, updated_at")
          .single()
      : await serviceClient
          .from("employee_job_assignments")
          .insert({
            workspace_id: body.workspaceId,
            job_id: body.jobId,
            employee_user_id: body.employeeUserId,
            assigned_by: actor.userId,
            status: "Assigned",
            notes: body.notes?.trim() || null,
          })
          .select("id, workspace_id, job_id, employee_user_id, status, notes, created_at, updated_at")
          .single();

    if (write.error) return jsonError(write.error.message || "Unable to save assignment.", 500);
    return NextResponse.json({ assignment: write.data });
  }

  if (!body.assignmentId) return jsonError("Assignment is required.", 400);
  const status = body.action === "remove" ? "Removed" : body.status;
  if (!status) return jsonError("Assignment status is required.", 400);

  const { data, error } = await serviceClient
    .from("employee_job_assignments")
    .update({ status, notes: body.notes?.trim() || null })
    .eq("id", body.assignmentId)
    .eq("workspace_id", body.workspaceId)
    .select("id, workspace_id, job_id, employee_user_id, status, notes, created_at, updated_at")
    .single();

  if (error) return jsonError(error.message || "Unable to update assignment.", 500);
  return NextResponse.json({ assignment: data });
}
