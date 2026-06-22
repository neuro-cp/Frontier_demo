import { NextRequest, NextResponse } from "next/server";

import { executeReviewDraft } from "@/lib/ai/executeReviewDraft";
import {
  getReviewDraftById,
  updateReviewDraftExecution,
} from "@/lib/db/aiReviewDrafts";
import { isUuid } from "@/lib/db/ids";
import { createServiceRoleClient } from "@/lib/platformAdmin/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type ExecuteReviewDraftRequest = {
  id?: string;
  workspaceId?: string;
  confirmExecution?: boolean;
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function requireExecutableWorkspace(workspaceId: string) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      ok: false as const,
      response: jsonError("Sign in required to execute review drafts.", 401),
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

  const role = membership.role as string;
  if (role !== "Owner" && role !== "Manager") {
    return {
      ok: false as const,
      response: jsonError("Only Owners and Managers can execute approved drafts.", 403),
    };
  }

  return {
    ok: true as const,
    user,
    serviceClient: createServiceRoleClient(),
  };
}

export async function POST(request: NextRequest) {
  let body: ExecuteReviewDraftRequest;
  try {
    body = (await request.json()) as ExecuteReviewDraftRequest;
  } catch {
    return jsonError("Invalid review draft execution request.", 400);
  }

  const workspaceId = body.workspaceId;
  const draftId = body.id;

  if (!workspaceId || !draftId || !isUuid(workspaceId) || !isUuid(draftId)) {
    return jsonError("Workspace and review draft are required.", 400);
  }

  if (body.confirmExecution !== true) {
    return jsonError("Final execution confirmation is required.", 400);
  }

  const auth = await requireExecutableWorkspace(workspaceId);
  if (!auth.ok) return auth.response;

  const draft = await getReviewDraftById(
    auth.serviceClient,
    workspaceId,
    draftId
  );

  if (!draft) return jsonError("Review draft not found.", 404);
  if (draft.status !== "Approved") {
    return jsonError("Only approved review drafts can be executed.", 400);
  }
  if (draft.executionStatus === "Executed") {
    return jsonError("Review draft has already been executed.", 400);
  }

  try {
    const executionResult = await executeReviewDraft({
      draft,
      serviceClient: auth.serviceClient,
    });
    const reviewDraft = await updateReviewDraftExecution(auth.serviceClient, {
      id: draft.id,
      workspaceId,
      executionStatus: "Executed",
      executedBy: auth.user.id,
      executionResult,
      executionError: null,
    });
    return NextResponse.json({ reviewDraft, executionResult });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to execute review draft.";
    const reviewDraft = await updateReviewDraftExecution(auth.serviceClient, {
      id: draft.id,
      workspaceId,
      executionStatus: "Failed",
      executedBy: auth.user.id,
      executionResult: {},
      executionError: message,
    });
    return NextResponse.json({ error: message, reviewDraft }, { status: 400 });
  }
}
