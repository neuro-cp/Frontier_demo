import { NextRequest, NextResponse } from "next/server";

import {
  duplicateReviewDraft,
  getReviewDraftAuditEvents,
  getReviewDraftById,
  getReviewDraftRevisions,
  getReviewDrafts,
  updateReviewDraftContent,
  updateReviewDraftStatus,
  type AiReviewDraftStatus,
  type AiReviewDraft,
} from "@/lib/db/aiReviewDrafts";
import type { SuggestedAction } from "@/lib/ai/types";
import { validateSuggestedAction } from "@/lib/ai/validators";
import { isUuid } from "@/lib/db/ids";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const allowedStatuses: AiReviewDraftStatus[] = [
  "Pending",
  "Approved",
  "Rejected",
  "Needs Changes",
  "Archived",
];

type UpdateReviewDraftRequest = {
  id?: string;
  workspaceId?: string;
  status?: AiReviewDraftStatus;
  mode?: "status" | "content" | "duplicate";
  sourceLabel?: string;
  summary?: string;
  actions?: SuggestedAction[];
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

async function attachOcrSourcePreviews(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  workspaceId: string,
  drafts: AiReviewDraft[]
) {
  const documentIds = Array.from(
    new Set(
      drafts
        .filter((draft) => draft.sourceType === "ocr" && isUuid(draft.sourceId ?? ""))
        .map((draft) => draft.sourceId as string)
    )
  );
  if (documentIds.length === 0) return drafts;

  const { data, error } = await supabase
    .from("documents")
    .select("id, name, file_name, extracted_text, extracted_json, processing_status, ocr_provider, confidence, ocr_completed_at")
    .eq("workspace_id", workspaceId)
    .in("id", documentIds);
  if (error) throw new Error(error.message || "Unable to load OCR source previews.");

  const documentsById = new Map((data ?? []).map((document) => [document.id, document]));
  return drafts.map((draft) => {
    const document = draft.sourceId ? documentsById.get(draft.sourceId) : undefined;
    if (!document) return draft;
    return {
      ...draft,
      sourcePreview: {
        label: document.file_name ?? document.name ?? null,
        text: document.extracted_text ?? null,
        extractedJson: (document.extracted_json ?? null) as Record<string, unknown> | null,
        processingStatus: document.processing_status ?? null,
        provider: document.ocr_provider ?? null,
        confidence: document.confidence ?? null,
        completedAt: document.ocr_completed_at ?? null,
      },
    };
  });
}

export async function GET(request: NextRequest) {
  const workspaceId = request.nextUrl.searchParams.get("workspaceId");
  if (!workspaceId || !isUuid(workspaceId)) {
    return jsonError("Workspace is required.", 400);
  }

  const auth = await requireUserAndWorkspace(workspaceId);
  if (!auth.ok) return auth.response;

  try {
    const draftId = request.nextUrl.searchParams.get("draftId");
    if (draftId) {
      if (!isUuid(draftId)) return jsonError("Review draft is invalid.", 400);
      const [reviewDraft, revisions, auditEvents] = await Promise.all([
        getReviewDraftById(auth.supabase, workspaceId, draftId),
        getReviewDraftRevisions(auth.supabase, workspaceId, draftId),
        getReviewDraftAuditEvents(auth.supabase, workspaceId, draftId),
      ]);
      if (!reviewDraft) return jsonError("Review draft not found.", 404);
      const [reviewDraftWithPreview] = await attachOcrSourcePreviews(
        auth.supabase,
        workspaceId,
        [reviewDraft]
      );
      return NextResponse.json({ reviewDraft: reviewDraftWithPreview, revisions, auditEvents });
    }
    const reviewDrafts = await attachOcrSourcePreviews(
      auth.supabase,
      workspaceId,
      await getReviewDrafts(auth.supabase, workspaceId)
    );
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

  const workspaceId = body.workspaceId;
  const draftId = body.id;

  if (!workspaceId || !draftId || !isUuid(workspaceId) || !isUuid(draftId)) {
    return jsonError("Workspace and review draft are required.", 400);
  }

  const auth = await requireUserAndWorkspace(workspaceId);
  if (!auth.ok) return auth.response;

  if (auth.role !== "Owner" && auth.role !== "Manager") {
    return jsonError("Only Owners and Managers can update review drafts.", 403);
  }

  try {
    if (body.mode === "duplicate") {
      const reviewDraft = await duplicateReviewDraft(auth.supabase, {
        id: draftId,
        workspaceId,
        createdBy: auth.user.id,
      });
      return NextResponse.json({ reviewDraft });
    }

    if (body.mode === "content") {
      if (!Array.isArray(body.actions) || body.actions.length === 0) {
        return jsonError("At least one action draft is required.", 400);
      }
      const invalidAction = body.actions.find(
        (action) => !validateSuggestedAction(action).ok
      );
      if (invalidAction) {
        return jsonError(`Action ${invalidAction.type} has invalid fields.`, 400);
      }
      const reviewDraft = await updateReviewDraftContent(auth.supabase, {
        id: draftId,
        workspaceId,
        sourceLabel: body.sourceLabel ?? "",
        summary: body.summary ?? "",
        actions: body.actions,
      });
      return NextResponse.json({ reviewDraft });
    }

    if (!body.status || !allowedStatuses.includes(body.status)) {
      return jsonError("Review draft status is invalid.", 400);
    }
    const reviewDraft = await updateReviewDraftStatus(auth.supabase, {
      id: draftId,
      workspaceId,
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
