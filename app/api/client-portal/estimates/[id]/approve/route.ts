import { NextRequest, NextResponse } from "next/server";

import { getSignedInClientPortalContext } from "@/lib/clientPortal/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type ApprovalRequest = {
  notes?: string;
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const portal = await getSignedInClientPortalContext();
  if (!portal.ok) return jsonError(portal.error, portal.status);

  let body: ApprovalRequest = {};
  try {
    body = (await request.json()) as ApprovalRequest;
  } catch {
    body = {};
  }

  const { data: estimate, error: estimateError } = await portal.serviceClient
    .from("estimates")
    .select("id, workspace_id, client_id, status, rejected_at")
    .eq("id", id)
    .eq("workspace_id", portal.access.workspace_id)
    .eq("client_id", portal.access.client_id)
    .maybeSingle();

  if (estimateError) return jsonError(estimateError.message, 500);
  if (!estimate) return jsonError("Estimate not found.", 403);
  if (estimate.status === "Declined" || estimate.rejected_at) {
    return jsonError("Declined estimates cannot be approved.", 409);
  }

  const now = new Date().toISOString();
  const { data, error } = await portal.serviceClient
    .from("estimates")
    .update({
      status: "Accepted",
      approved_at: now,
      approved_by_user_id: portal.userId,
      approval_notes: body.notes?.trim() || null,
      rejected_at: null,
      rejected_by_user_id: null,
      rejection_notes: null,
    })
    .eq("id", id)
    .eq("workspace_id", portal.access.workspace_id)
    .eq("client_id", portal.access.client_id)
    .select("id, status, approved_at, approved_by_user_id, approval_notes")
    .single();

  if (error) return jsonError(error.message || "Unable to approve estimate.", 500);
  return NextResponse.json({ estimate: data });
}
