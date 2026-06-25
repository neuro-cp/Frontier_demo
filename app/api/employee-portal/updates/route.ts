import { NextRequest, NextResponse } from "next/server";

import { createServiceRoleClient } from "@/lib/platformAdmin/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type UpdateBody = {
  workspaceId?: string;
  jobId?: string;
  updateType?: "Progress" | "Completion" | "Material Usage" | "Note";
  body?: string;
  completionPercent?: number | null;
  materialName?: string;
  materialQuantity?: number | null;
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) return jsonError("Sign in required.", 401);

  let body: UpdateBody;
  try {
    body = (await request.json()) as UpdateBody;
  } catch {
    return jsonError("Invalid employee update request.", 400);
  }

  const workspaceId = body.workspaceId;
  const jobId = body.jobId;
  const updateBody = body.body?.trim();
  if (!workspaceId || !jobId || !updateBody) {
    return jsonError("Workspace, job, and update body are required.", 400);
  }

  const serviceClient = createServiceRoleClient();
  const { data: access, error: accessError } = await serviceClient
    .from("workspace_members")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .eq("role", "Employee")
    .eq("status", "Active")
    .maybeSingle();

  if (accessError) return jsonError(accessError.message, 500);
  if (!access) return jsonError("Active employee portal access required.", 403);

  const { data: assignment, error: assignmentError } = await serviceClient
    .from("employee_job_assignments")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("job_id", jobId)
    .eq("employee_user_id", user.id)
    .neq("status", "Removed")
    .maybeSingle();

  if (assignmentError) return jsonError(assignmentError.message, 500);
  if (!assignment) return jsonError("Job is not assigned to this employee.", 403);

  const completionPercent =
    typeof body.completionPercent === "number"
      ? Math.max(0, Math.min(100, Math.round(body.completionPercent)))
      : null;

  const { data: update, error: updateError } = await serviceClient
    .from("employee_job_updates")
    .insert({
      workspace_id: workspaceId,
      job_id: jobId,
      employee_user_id: user.id,
      update_type: body.updateType || "Progress",
      body: updateBody,
      completion_percent: completionPercent,
      material_name: body.materialName?.trim() || null,
      material_quantity:
        typeof body.materialQuantity === "number" ? body.materialQuantity : null,
    })
    .select("id, workspace_id, job_id, employee_user_id, update_type, body, completion_percent, material_name, material_quantity, status, created_at")
    .single();

  if (updateError || !update) return jsonError(updateError?.message || "Unable to submit update.", 500);

  await serviceClient.from("workspace_notifications").insert({
    workspace_id: workspaceId,
    type: "employee_update",
    title: "Employee job update",
    body: updateBody.slice(0, 200),
    entity_type: "job",
    entity_id: jobId,
    metadata: { updateId: update.id, employeeUserId: user.id },
  });

  if (body.updateType === "Completion" && completionPercent === 100) {
    await serviceClient
      .from("jobs")
      .update({ status: "Completed" })
      .eq("id", jobId)
      .eq("workspace_id", workspaceId);
  }

  return NextResponse.json({ update });
}
