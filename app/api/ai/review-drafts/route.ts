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

type ProcessingRow = {
  status?: string | null;
  processing_status?: string | null;
  image_analysis_status?: string | null;
  retry_count?: number | null;
  ocr_retry_count?: number | null;
  image_analysis_retry_count?: number | null;
  started_at?: string | null;
  completed_at?: string | null;
  ocr_started_at?: string | null;
  ocr_completed_at?: string | null;
  image_analysis_started_at?: string | null;
  image_analysis_completed_at?: string | null;
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

async function attachSourcePreviews(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  workspaceId: string,
  drafts: AiReviewDraft[]
) {
  const documentIds = Array.from(
    new Set(
      drafts
        .filter(
          (draft) =>
            (draft.sourceType === "ocr" || draft.sourceType === "image") &&
            isUuid(draft.sourceId ?? "")
        )
        .map((draft) => draft.sourceId as string)
    )
  );
  const transcriptIds = Array.from(
    new Set(
      drafts
        .filter((draft) => draft.sourceType === "transcript" && isUuid(draft.sourceId ?? ""))
        .map((draft) => draft.sourceId as string)
    )
  );

  if (documentIds.length === 0 && transcriptIds.length === 0) return drafts;

  const [documentsResult, transcriptsResult] = await Promise.all([
    documentIds.length
      ? supabase
          .from("documents")
          .select("id, name, file_name, extracted_text, extracted_json, processing_status, ocr_provider, confidence, ocr_completed_at, image_analysis_status, image_analysis_provider, image_analysis_confidence, image_analysis_completed_at, image_analysis_summary")
          .eq("workspace_id", workspaceId)
          .in("id", documentIds)
      : Promise.resolve({ data: [], error: null }),
    transcriptIds.length
      ? supabase
          .from("speech_transcripts")
          .select("id, source_label, transcript_text, status, provider, confidence, completed_at")
          .eq("workspace_id", workspaceId)
          .in("id", transcriptIds)
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (documentsResult.error) throw new Error(documentsResult.error.message || "Unable to load OCR source previews.");
  if (transcriptsResult.error) throw new Error(transcriptsResult.error.message || "Unable to load transcript source previews.");

  const documentsById = new Map((documentsResult.data ?? []).map((document) => [document.id, document]));
  const transcriptsById = new Map((transcriptsResult.data ?? []).map((transcript) => [transcript.id, transcript]));
  return drafts.map((draft) => {
    const document = draft.sourceId ? documentsById.get(draft.sourceId) : undefined;
    if (document) {
      const isImage = draft.sourceType === "image";
      return {
        ...draft,
        sourcePreview: {
          label: document.file_name ?? document.name ?? null,
          text: isImage ? document.image_analysis_summary ?? null : document.extracted_text ?? null,
          extractedJson: isImage ? null : (document.extracted_json ?? null) as Record<string, unknown> | null,
          processingStatus: isImage
            ? document.image_analysis_status ?? null
            : document.processing_status ?? null,
          provider: isImage ? document.image_analysis_provider ?? null : document.ocr_provider ?? null,
          confidence: isImage ? document.image_analysis_confidence ?? null : document.confidence ?? null,
          completedAt: isImage
            ? document.image_analysis_completed_at ?? null
            : document.ocr_completed_at ?? null,
        },
      };
    }
    const transcript = draft.sourceId ? transcriptsById.get(draft.sourceId) : undefined;
    if (!transcript) return draft;
    return {
      ...draft,
      sourcePreview: {
        label: transcript.source_label ?? null,
        text: transcript.transcript_text ?? null,
        extractedJson: null,
        processingStatus: transcript.status ?? null,
        provider: transcript.provider ?? null,
        confidence: transcript.confidence ?? null,
        completedAt: transcript.completed_at ?? null,
      },
    };
  });
}

function averageProcessingSeconds(rows: ProcessingRow[], startedKey: keyof ProcessingRow, completedKey: keyof ProcessingRow) {
  const durations = rows
    .map((row) => {
      const started = row[startedKey];
      const completed = row[completedKey];
      if (typeof started !== "string" || typeof completed !== "string") return null;
      const seconds = (new Date(completed).getTime() - new Date(started).getTime()) / 1000;
      return Number.isFinite(seconds) && seconds >= 0 ? seconds : null;
    })
    .filter((value): value is number => typeof value === "number");
  if (!durations.length) return null;
  return durations.reduce((total, value) => total + value, 0) / durations.length;
}

function queueSummary(
  rows: ProcessingRow[],
  statusKey: keyof ProcessingRow,
  retryKey: keyof ProcessingRow,
  startedKey: keyof ProcessingRow,
  completedKey: keyof ProcessingRow
) {
  return {
    queued: rows.filter((row) => row[statusKey] === "queued").length,
    processing: rows.filter((row) => row[statusKey] === "processing").length,
    failed: rows.filter((row) => row[statusKey] === "failed").length,
    retries: rows.reduce((total, row) => {
      const retries = row[retryKey];
      return total + (typeof retries === "number" ? retries : 0);
    }, 0),
    averageProcessingSeconds: averageProcessingSeconds(rows, startedKey, completedKey),
  };
}

async function getOperationsSummary(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  workspaceId: string,
  reviewDrafts: AiReviewDraft[]
) {
  const [documentsResult, transcriptsResult] = await Promise.all([
    supabase
      .from("documents")
      .select("processing_status, ocr_retry_count, ocr_started_at, ocr_completed_at, image_analysis_status, image_analysis_retry_count, image_analysis_started_at, image_analysis_completed_at")
      .eq("workspace_id", workspaceId),
    supabase
      .from("speech_transcripts")
      .select("status, retry_count, started_at, completed_at")
      .eq("workspace_id", workspaceId),
  ]);
  if (documentsResult.error) throw new Error(documentsResult.error.message || "Unable to load document operation summary.");
  if (transcriptsResult.error) throw new Error(transcriptsResult.error.message || "Unable to load speech operation summary.");
  const documentRows = (documentsResult.data ?? []) as ProcessingRow[];
  const transcriptRows = (transcriptsResult.data ?? []) as ProcessingRow[];
  return {
    ocr: queueSummary(documentRows, "processing_status", "ocr_retry_count", "ocr_started_at", "ocr_completed_at"),
    speech: queueSummary(transcriptRows, "status", "retry_count", "started_at", "completed_at"),
    image: queueSummary(documentRows, "image_analysis_status", "image_analysis_retry_count", "image_analysis_started_at", "image_analysis_completed_at"),
    reviewBacklog: reviewDrafts.filter((draft) => draft.status === "Pending" || draft.status === "Needs Changes").length,
    approvalStats: {
      pending: reviewDrafts.filter((draft) => draft.status === "Pending").length,
      approved: reviewDrafts.filter((draft) => draft.status === "Approved").length,
      rejected: reviewDrafts.filter((draft) => draft.status === "Rejected").length,
      archived: reviewDrafts.filter((draft) => draft.status === "Archived").length,
      executed: reviewDrafts.filter((draft) => draft.executionStatus === "Executed").length,
    },
  };
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
      const [reviewDraftWithPreview] = await attachSourcePreviews(
        auth.supabase,
        workspaceId,
        [reviewDraft]
      );
      return NextResponse.json({ reviewDraft: reviewDraftWithPreview, revisions, auditEvents });
    }
    const reviewDrafts = await attachSourcePreviews(
      auth.supabase,
      workspaceId,
      await getReviewDrafts(auth.supabase, workspaceId)
    );
    const operationsSummary = await getOperationsSummary(auth.supabase, workspaceId, reviewDrafts);
    return NextResponse.json({ reviewDrafts, operationsSummary });
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
