import { NextRequest, NextResponse } from "next/server";

import {
  getReviewDrafts,
  updateReviewDraftStatus,
  type AiReviewDraftStatus,
} from "@/lib/db/aiReviewDrafts";
import { isUuid } from "@/lib/db/ids";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const allowedStatuses: AiReviewDraftStatus[] = [
  "Pending",
  "Approved",
  "Rejected",
  "Needs Changes",
];

type UpdateReviewDraftRequest = {
  id?: string;
  workspaceId?: string;
  status?: AiReviewDraftStatus;
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function requireUserAndWorkspace(workspaceId: string) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      ok: false as const,
      response: jsonError("Sign in required to access review drafts.", 401),
    };
  }

  const { data: membership, error: membershipError } = await supabase
    .from("workspace_members")
    .select("id, role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .eq("status", "Active")
    .maybeSingle();

  if (membershipError || !membership) {
    return {
      ok: false as const,
      response: jsonError("You do not have access to this workspace.", 403),
    };
  }

  return {
    ok: true as const,
    supabase,
    user,
    role: membership.role as string,
  };
}

export async function GET(request: NextRequest) {
  const workspaceId = request.nextUrl.searchParams.get("workspaceId");
  if (!isUuid(workspaceId)) {
    return jsonError("Workspace is required.", 400);
  }

  const auth = await requireUserAndWorkspace(workspaceId);
  if (!auth.ok) return auth.response;

  try {
    const reviewDrafts = await getReviewDrafts(auth.supabase, workspaceId);
    return NextResponse.json({ reviewDrafts });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to load review drafts.",
      500
    );
  }
}

export async function PATCH(request: NextRequest) {
  let body: UpdateReviewDraftRequest;
  try {
    body = (await request.json()) as UpdateReviewDraftRequest;
  } catch {
    return jsonError("Invalid review draft request.", 400);
  }

  if (!isUuid(body.workspaceId) || !isUuid(body.id)) {
    return jsonError("Workspace and review draft are required.", 400);
  }

  if (!body.status || !allowedStatuses.includes(body.status)) {
    return jsonError("Review draft status is invalid.", 400);
  }

  const auth = await requireUserAndWorkspace(body.workspaceId);
  if (!auth.ok) return auth.response;

  if (auth.role !== "Owner" && auth.role !== "Manager") {
    return jsonError("Only Owners and Managers can update review drafts.", 403);
  }

  try {
    const reviewDraft = await updateReviewDraftStatus(auth.supabase, {
      id: body.id,
      workspaceId: body.workspaceId,
      status: body.status,
      reviewedBy: auth.user.id,
    });
    return NextResponse.json({ reviewDraft });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to update review draft.",
      500
    );
  }
}
