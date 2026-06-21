import { NextRequest, NextResponse } from "next/server";

import { createServiceRoleClient } from "@/lib/platformAdmin/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const allowedRoles = new Set(["Owner", "Manager", "Employee"]);
const allowedStatuses = new Set(["Active", "Invited", "Removed"]);

type MemberMutationBody = {
  workspaceId?: string;
  memberId?: string;
  role?: string;
  status?: string;
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

  let body: MemberMutationBody;
  try {
    body = (await request.json()) as MemberMutationBody;
  } catch {
    return jsonError("Invalid member mutation request.", 400);
  }

  if (!body.workspaceId || !body.memberId) {
    return jsonError("Workspace and member are required.", 400);
  }

  if (body.role && !allowedRoles.has(body.role)) {
    return jsonError("Unsupported role.", 400);
  }

  if (body.status && !allowedStatuses.has(body.status)) {
    return jsonError("Unsupported status.", 400);
  }

  if (!body.role && !body.status) {
    return jsonError("Role or status is required.", 400);
  }

  const serviceClient = createServiceRoleClient();

  const { data: actor, error: actorError } = await serviceClient
    .from("workspace_members")
    .select("id, role, status")
    .eq("workspace_id", body.workspaceId)
    .eq("user_id", user.id)
    .eq("status", "Active")
    .maybeSingle();

  if (actorError || !actor) {
    return jsonError("You do not have access to this workspace.", 403);
  }

  if (actor.role !== "Owner" && actor.role !== "Manager") {
    return jsonError("Only Owners and Managers can manage members.", 403);
  }

  const { data: target, error: targetError } = await serviceClient
    .from("workspace_members")
    .select("id, workspace_id, user_id, role, status, invited_email, created_at")
    .eq("id", body.memberId)
    .eq("workspace_id", body.workspaceId)
    .maybeSingle();

  if (targetError || !target) return jsonError("Member not found.", 404);

  const demotesOwner = target.role === "Owner" && body.role && body.role !== "Owner";
  const removesOwner = target.role === "Owner" && body.status === "Removed";

  if (demotesOwner || removesOwner) {
    const { count, error: countError } = await serviceClient
      .from("workspace_members")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", body.workspaceId)
      .eq("role", "Owner")
      .neq("status", "Removed");

    if (countError) return jsonError("Unable to verify workspace owners.", 500);
    if ((count ?? 0) <= 1) return jsonError("Cannot change the last Owner.", 400);
  }

  const updates: Record<string, string> = {};
  if (body.role) updates.role = body.role;
  if (body.status) updates.status = body.status;

  const { data, error } = await serviceClient
    .from("workspace_members")
    .update(updates)
    .eq("id", body.memberId)
    .eq("workspace_id", body.workspaceId)
    .select("id, user_id, role, status, invited_email, created_at")
    .single();

  if (error) return jsonError(error.message || "Unable to update member.", 500);

  return NextResponse.json({ member: data });
}
