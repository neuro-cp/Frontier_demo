import { NextRequest, NextResponse } from "next/server";

import { interpretImageWithAI } from "@/lib/ai/providers/providerFactory";
import { createReviewDraft, getReviewDraftById, getReviewDrafts } from "@/lib/db/aiReviewDrafts";
import { isUuid } from "@/lib/db/ids";
import { canUseAiDrafts } from "@/lib/plans/capabilities";
import { checkUserAndWorkspaceDailyLimits } from "@/lib/rateLimit/dailyCounters";
import { RateLimitError } from "@/lib/rateLimit/policy";
import {
  canManageWorkspaceData,
  jsonError,
  managerRequiredError,
  planUpgradeError,
  requireWorkspaceAccess,
} from "@/lib/services/routeProtection";
import { serviceLimits } from "@/lib/services/serviceLimits";
import { DOCUMENT_STORAGE_BUCKET } from "@/lib/storage/documents";

type EnhancedAnalyzeRequest = {
  workspaceId?: string;
  draftId?: string;
};

const supportedImageTypes = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

function isSupportedImageType(value: string) {
  return supportedImageTypes.has(value.toLowerCase());
}

function toDataUrl(mimeType: string, bytes: ArrayBuffer) {
  return `data:${mimeType};base64,${Buffer.from(bytes).toString("base64")}`;
}

function imageSummaryFromWarnings(warnings: unknown[]) {
  const firstWarning = warnings.find(
    (warning) =>
      typeof warning === "object" &&
      warning !== null &&
      "message" in warning &&
      typeof (warning as { message?: unknown }).message === "string"
  ) as { message?: string } | undefined;
  return firstWarning?.message ?? "Enhanced image analysis completed.";
}

function hasOnlyHumanReviewWarnings(draft: Awaited<ReturnType<typeof getReviewDraftById>>) {
  return Boolean(
    draft?.warnings.length &&
      draft.warnings.every((warning) => warning.code === "needs_human_review")
  );
}

function isEnhancedEligible(draft: NonNullable<Awaited<ReturnType<typeof getReviewDraftById>>>) {
  return (
    draft.sourceType === "image" &&
    ((draft.confidence ?? 0) < 0.4 ||
      draft.actions.length === 0 ||
      draft.warnings.some((warning) =>
        warning.message.includes("Image provider returned unstructured output")
      ) ||
      hasOnlyHumanReviewWarnings(draft))
  );
}

function rawInputHasEnhancedRetry(rawInput: string | null, draftId: string) {
  if (!rawInput) return false;
  return rawInput.includes('"enhancedAnalysisUsed":true') && rawInput.includes(`"originalDraftId":"${draftId}"`);
}

export async function POST(request: NextRequest) {
  let body: EnhancedAnalyzeRequest;
  try {
    body = (await request.json()) as EnhancedAnalyzeRequest;
  } catch {
    return jsonError("Invalid enhanced image analysis request.", 400);
  }

  const workspaceId = body.workspaceId;
  const draftId = body.draftId;
  if (!workspaceId || !draftId || !isUuid(workspaceId) || !isUuid(draftId)) {
    return jsonError("Workspace and review draft are required.", 400);
  }

  const access = await requireWorkspaceAccess(workspaceId);
  if (!access.ok) return access.response;
  if (!canManageWorkspaceData(access.role)) return managerRequiredError("run enhanced image analysis");
  if (!canUseAiDrafts(access.plan)) return planUpgradeError();

  try {
    checkUserAndWorkspaceDailyLimits({
      service: "ai-image",
      userId: access.userId,
      workspaceId,
      userLimit: serviceLimits.aiDrafts.maxRequestsPerUserPerDay(),
      workspaceLimit: serviceLimits.aiDrafts.maxRequestsPerWorkspacePerDay(),
    });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "AI image quota exceeded.",
      error instanceof RateLimitError ? error.status : 429
    );
  }

  try {
    const originalDraft = await getReviewDraftById(access.serviceClient, workspaceId, draftId);
    if (!originalDraft) return jsonError("Review draft not found.", 404);
    if (!originalDraft.sourceId) return jsonError("Review draft is not linked to an image.", 400);
    if (!isEnhancedEligible(originalDraft)) {
      return jsonError("Enhanced analysis is only available for low-quality image drafts.", 400);
    }

    const existingDrafts = await getReviewDrafts(access.serviceClient, workspaceId);
    if (existingDrafts.some((draft) => rawInputHasEnhancedRetry(draft.rawInput, draftId))) {
      return jsonError("Enhanced analysis was already used for this draft.", 400);
    }

    const { data: document, error } = await access.serviceClient
      .from("documents")
      .select("*")
      .eq("id", originalDraft.sourceId)
      .eq("workspace_id", workspaceId)
      .maybeSingle();

    if (error) return jsonError(error.message || "Unable to load image document.", 500);
    if (!document) return jsonError("Image document not found.", 404);
    const mimeType = document.mime_type ?? "";
    if (!isSupportedImageType(mimeType)) {
      return jsonError("Stored document is not a supported image.", 400);
    }
    if (!document.storage_path) {
      return jsonError("Stored image does not have a file path.", 400);
    }

    const { data: storageObject, error: downloadError } = await access.serviceClient.storage
      .from(document.storage_bucket || DOCUMENT_STORAGE_BUCKET)
      .download(document.storage_path);
    if (downloadError || !storageObject) {
      return jsonError(downloadError?.message || "Unable to load stored image.", 500);
    }

    const imageBytes = await storageObject.arrayBuffer();
    await access.serviceClient
      .from("documents")
      .update({
        image_analysis_status: "processing",
        image_analysis_started_at: new Date().toISOString(),
        image_analysis_completed_at: null,
        image_analysis_failed_at: null,
        image_analysis_error: null,
        image_analysis_retry_count:
          typeof document.image_analysis_retry_count === "number"
            ? document.image_analysis_retry_count + 1
            : 1,
      })
      .eq("id", document.id)
      .eq("workspace_id", workspaceId);

    const interpretation = await interpretImageWithAI(
      {
        workspaceId,
        sourceId: document.id,
        imageDataUrl: toDataUrl(mimeType, imageBytes),
        mimeType,
        sourceLabel: `${document.file_name ?? document.name ?? "Image"} enhanced analysis`,
      },
      { forceProvider: "openai" }
    );

    const metadata = {
      enhancedAnalysisUsed: true,
      originalDraftId: originalDraft.id,
      originalProvider: originalDraft.modelProvider ?? "unknown",
      fallbackProvider: "openai",
      originalConfidence: originalDraft.confidence,
      finalConfidence: interpretation.result.confidence,
    };

    const reviewDraft = await createReviewDraft(access.serviceClient, {
      reviewDraft: interpretation.reviewDraft,
      sourceLabel: `${document.file_name ?? originalDraft.sourceLabel ?? "Image"} enhanced analysis`,
      rawInput: JSON.stringify(metadata),
      modelProvider: interpretation.provider,
      modelName: interpretation.model,
      createdBy: access.userId,
    });

    const { data: updatedDocument, error: updateError } = await access.serviceClient
      .from("documents")
      .update({
        image_analysis_status: "completed",
        image_analysis_completed_at: new Date().toISOString(),
        image_analysis_failed_at: null,
        image_analysis_error: null,
        image_analysis_provider: interpretation.provider,
        image_analysis_model: interpretation.model,
        image_analysis_confidence: interpretation.result.confidence,
        image_analysis_summary: interpretation.result.actions.length
          ? `${interpretation.result.actions.length} enhanced image action draft(s) created.`
          : imageSummaryFromWarnings(interpretation.result.warnings),
        image_review_draft_id: reviewDraft.id,
      })
      .eq("id", document.id)
      .eq("workspace_id", workspaceId)
      .select("*")
      .maybeSingle();
    if (updateError) {
      console.warn("Enhanced image lifecycle update failed.", {
        message: updateError.message,
        documentId: document.id,
      });
    }

    return NextResponse.json({ reviewDraft, metadata, document: updatedDocument ?? null });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to run enhanced image analysis.",
      500
    );
  }
}
