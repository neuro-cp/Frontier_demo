import { NextRequest, NextResponse } from "next/server";

import {
  aiRestrictionMessage,
  checkAiInputForAbuse,
  getActiveAiRestriction,
  logAiAbuseEvent,
} from "@/lib/ai/abuseGuard";
import { interpretImageWithAI } from "@/lib/ai/providers/providerFactory";
import { createReviewDraft } from "@/lib/db/aiReviewDrafts";
import { canUseAiDrafts } from "@/lib/plans/capabilities";
import { checkUserAndWorkspaceDailyLimits } from "@/lib/rateLimit/dailyCounters";
import { RateLimitError } from "@/lib/rateLimit/policy";
import { featureDisabledMessage, featureFlags } from "@/lib/services/featureFlags";
import {
  canManageWorkspaceData,
  jsonError,
  managerRequiredError,
  planUpgradeError,
  requireWorkspaceAccess,
} from "@/lib/services/routeProtection";
import { serviceLimits } from "@/lib/services/serviceLimits";
import { DOCUMENT_STORAGE_BUCKET } from "@/lib/storage/documents";

const supportedImageTypes = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const maxImageBytes = 10 * 1024 * 1024;

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
  return firstWarning?.message ?? "Image analyzed for review.";
}

async function readImageFile(file: File) {
  const mimeType = file.type || "";
  if (!isSupportedImageType(mimeType)) {
    throw new Error("Only JPG, PNG, and WebP images are supported.");
  }
  if (file.size > maxImageBytes) {
    throw new Error("Image must be 10 MB or smaller.");
  }
  return {
    bytes: await file.arrayBuffer(),
    mimeType,
    label: file.name || "Image upload",
  };
}

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError("Invalid image analysis request.", 400);
  }

  const workspaceId = formData.get("workspaceId");
  const documentId = formData.get("documentId");
  const sourceLabel = formData.get("sourceLabel");
  const file = formData.get("file");
  const fallbackFile = formData.get("fallbackFile");

  if (typeof workspaceId !== "string") {
    return jsonError("Workspace is required.", 400);
  }
  if (!featureFlags.imageAnalysis()) {
    return jsonError(featureDisabledMessage("Image analysis"), 503);
  }
  if (!featureFlags.ai()) {
    return jsonError(featureDisabledMessage("AI draft generation"), 503);
  }

  const access = await requireWorkspaceAccess(workspaceId);
  if (!access.ok) return access.response;
  const restriction = await getActiveAiRestriction(access.serviceClient, access.userId);
  if (restriction) return jsonError(aiRestrictionMessage, 403);
  if (!canManageWorkspaceData(access.role)) return managerRequiredError("analyze images");
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

  let imageBytes: ArrayBuffer;
  let mimeType = "";
  let label =
    typeof sourceLabel === "string" && sourceLabel.trim()
      ? sourceLabel.trim()
      : "Image upload";
  let sourceId: string | undefined;
  let documentRow: Record<string, unknown> | null = null;
  let fallbackImage:
    | { bytes: ArrayBuffer; mimeType: string; label: string }
    | null = null;

  const labelAbuseCheck = checkAiInputForAbuse(
    typeof sourceLabel === "string" ? sourceLabel : ""
  );
  if (!labelAbuseCheck.ok) {
    await logAiAbuseEvent({
      serviceClient: access.serviceClient,
      workspaceId,
      userId: access.userId,
      source: "image_analysis",
      text: String(sourceLabel ?? ""),
      reason: labelAbuseCheck.reason,
      severity: labelAbuseCheck.severity,
    });
    return jsonError(
      "This image analysis request was blocked for safety review. You can request reinstatement from account support.",
      403
    );
  }

  if (file instanceof File) {
    let primaryImage: Awaited<ReturnType<typeof readImageFile>>;
    try {
      primaryImage = await readImageFile(file);
      if (fallbackFile instanceof File) {
        fallbackImage = await readImageFile(fallbackFile);
      }
    } catch (error) {
      return jsonError(
        error instanceof Error ? error.message : "Invalid image upload.",
        400
      );
    }
    mimeType = primaryImage.mimeType;
    imageBytes = primaryImage.bytes;
    label = sourceLabel?.toString().trim() || file.name || label;
  } else if (typeof documentId === "string" && documentId.trim()) {
    const { data: document, error } = await access.serviceClient
      .from("documents")
      .select("*")
      .eq("id", documentId)
      .eq("workspace_id", workspaceId)
      .maybeSingle();

    if (error) return jsonError(error.message || "Unable to load image document.", 500);
    if (!document) return jsonError("Image document not found.", 404);

    mimeType = document.mime_type ?? "";
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
    if (storageObject.size > maxImageBytes) {
      return jsonError("Image must be 10 MB or smaller.", 413);
    }
    imageBytes = await storageObject.arrayBuffer();
    sourceId = document.id;
    documentRow = document;
    label = document.file_name ?? document.name ?? label;
  } else {
    return jsonError("Image file or document id is required.", 400);
  }

  if (sourceId) {
    const now = new Date().toISOString();
    const retryCount =
      typeof documentRow?.image_analysis_retry_count === "number"
        ? documentRow.image_analysis_retry_count + 1
        : 1;
    await access.serviceClient
      .from("documents")
      .update({
        image_analysis_status: "processing",
        image_analysis_queued_at: now,
        image_analysis_started_at: now,
        image_analysis_completed_at: null,
        image_analysis_failed_at: null,
        image_analysis_error: null,
        image_analysis_retry_count: retryCount,
      })
      .eq("id", sourceId)
      .eq("workspace_id", workspaceId);
  }

  try {
    let usedFullResolutionRetry = false;
    let interpretation;

    try {
      interpretation = await interpretImageWithAI({
        workspaceId,
        sourceId,
        imageDataUrl: toDataUrl(mimeType, imageBytes),
        mimeType,
        sourceLabel: label,
      });
    } catch (primaryError) {
      if (!fallbackImage || fallbackImage.bytes.byteLength === imageBytes.byteLength) {
        throw primaryError;
      }
      interpretation = await interpretImageWithAI({
        workspaceId,
        sourceId,
        imageDataUrl: toDataUrl(fallbackImage.mimeType, fallbackImage.bytes),
        mimeType: fallbackImage.mimeType,
        sourceLabel: `${fallbackImage.label} full resolution retry`,
      });
      usedFullResolutionRetry = true;
    }

    if (
      fallbackImage &&
      fallbackImage.bytes.byteLength !== imageBytes.byteLength &&
      !usedFullResolutionRetry
    ) {
      try {
        if (!interpretation.result.actions.length) {
          interpretation = await interpretImageWithAI({
            workspaceId,
            sourceId,
            imageDataUrl: toDataUrl(fallbackImage.mimeType, fallbackImage.bytes),
            mimeType: fallbackImage.mimeType,
            sourceLabel: `${fallbackImage.label} full resolution retry`,
          });
          usedFullResolutionRetry = true;
        }
      } catch (retryError) {
        console.warn("Full resolution image retry failed.", {
          message: retryError instanceof Error ? retryError.message : "Unknown retry failure",
        });
      }
    }
    const reviewDraft = await createReviewDraft(access.serviceClient, {
      reviewDraft: interpretation.reviewDraft,
      sourceLabel: label,
      rawInput: `Image analysis: ${label}`,
      modelProvider: interpretation.provider,
      modelName: interpretation.model,
      createdBy: access.userId,
    });

    let updatedDocument: Record<string, unknown> | null = null;
    if (sourceId) {
      const { data: documentUpdate, error: documentUpdateError } = await access.serviceClient
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
            ? `${interpretation.result.actions.length} image action draft(s) created.`
            : imageSummaryFromWarnings(interpretation.result.warnings),
          image_review_draft_id: reviewDraft.id,
        })
        .eq("id", sourceId)
        .eq("workspace_id", workspaceId)
        .select("*")
        .maybeSingle();
      if (documentUpdateError) {
        console.warn("Image analysis document lifecycle update failed.", {
          message: documentUpdateError.message,
          documentId: sourceId,
        });
      }
      updatedDocument = documentUpdate ?? null;
    }

    console.info("Saved image review draft. " + JSON.stringify({
      draftId: reviewDraft.id,
      sourceId: reviewDraft.sourceId,
      provider: interpretation.provider,
      model: interpretation.model,
      confidence: reviewDraft.confidence,
      actionCount: reviewDraft.actions.length,
      actionTypes: reviewDraft.actions.map((action) => action.type),
      warnings: reviewDraft.warnings,
      usedFullResolutionRetry,
    }));

    return NextResponse.json({
      reviewDraft,
      document: updatedDocument,
      analysis: {
        provider: interpretation.provider,
        model: interpretation.model,
        usedFallback: interpretation.usedFallback,
        usedFullResolutionRetry,
        confidence: interpretation.result.confidence,
        warnings: interpretation.result.warnings,
        actions: interpretation.result.actions,
      },
    });
  } catch (error) {
    if (sourceId) {
      await access.serviceClient
        .from("documents")
        .update({
          image_analysis_status: "failed",
          image_analysis_failed_at: new Date().toISOString(),
          image_analysis_error:
            error instanceof Error ? error.message : "Unable to analyze image.",
        })
        .eq("id", sourceId)
        .eq("workspace_id", workspaceId);
    }
    return jsonError(
      error instanceof Error ? error.message : "Unable to analyze image.",
      500
    );
  }
}
