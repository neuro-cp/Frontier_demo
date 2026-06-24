import { NextRequest, NextResponse } from "next/server";

import { getSignedInClientPortalContext } from "@/lib/clientPortal/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type RejectionRequest = {
  notes?: string;
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const portal = await getSignedInClientPortalContext();
  if (!portal.ok) return jsonError(portal.error, portal.status);

  let body: RejectionRequest = {};
  try {
    body = (await request.json()) as RejectionRequest;
  } catch {
    body = {};
  }

  const { data: estimate, error: estimateError } = await portal.serviceClient
    .from("estimates")
    .select("id, workspace_id, client_id, status, approved_at")
    .eq("id", id)
    .eq("workspace_id", portal.access.workspace_id)
    .eq("client_id", portal.access.client_id)
    .maybeSingle();

  if (estimateError) return jsonError(estimateError.message, 500);
  if (!estimate) return jsonError("Estimate not found.", 403);
  if (estimate.status === "Accepted" || estimate.approved_at) {
    return jsonError("Accepted estimates cannot be rejected.", 409);
  }

  const now = new Date().toISOString();
  const { data, error } = await portal.serviceClient
    .from("estimates")
    .update({
      status: "Declined",
      rejected_at: now,
      rejected_by_user_id: portal.userId,
      rejection_notes: body.notes?.trim() || null,
      approved_at: null,
      approved_by_user_id: null,
      approval_notes: null,
    })
    .eq("id", id)
    .eq("workspace_id", portal.access.workspace_id)
    .eq("client_id", portal.access.client_id)
    .select("id, status, rejected_at, rejected_by_user_id, rejection_notes")
    .single();

  if (error) return jsonError(error.message || "Unable to reject estimate.", 500);
  return NextResponse.json({ estimate: data });
}
