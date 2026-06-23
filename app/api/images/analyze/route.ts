import { NextRequest, NextResponse } from "next/server";

import { interpretImageWithAI } from "@/lib/ai/providers/providerFactory";
import { createReviewDraft } from "@/lib/db/aiReviewDrafts";
import { canUseAiDrafts } from "@/lib/plans/capabilities";
import { checkUserAndWorkspaceDailyLimits } from "@/lib/rateLimit/dailyCounters";
import { RateLimitError } from "@/lib/rateLimit/policy";
import { jsonError, planUpgradeError, requireWorkspaceAccess } from "@/lib/services/routeProtection";
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

  if (typeof workspaceId !== "string") {
    return jsonError("Workspace is required.", 400);
  }

  const access = await requireWorkspaceAccess(workspaceId);
  if (!access.ok) return access.response;
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

  if (file instanceof File) {
    mimeType = file.type || "";
    if (!isSupportedImageType(mimeType)) {
      return jsonError("Only JPG, PNG, and WebP images are supported.", 400);
    }
    if (file.size > maxImageBytes) {
      return jsonError("Image must be 10 MB or smaller.", 413);
    }
    imageBytes = await file.arrayBuffer();
    label = sourceLabel?.toString().trim() || file.name || label;
  } else if (typeof documentId === "string" && documentId.trim()) {
    const { data: document, error } = await access.serviceClient
      .from("documents")
      .select("id, workspace_id, name, file_name, mime_type, storage_bucket, storage_path")
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
    label = document.file_name ?? document.name ?? label;
  } else {
    return jsonError("Image file or document id is required.", 400);
  }

  try {
    const interpretation = await interpretImageWithAI({
      workspaceId,
      sourceId,
      imageDataUrl: toDataUrl(mimeType, imageBytes),
      mimeType,
      sourceLabel: label,
    });
    const reviewDraft = await createReviewDraft(access.serviceClient, {
      reviewDraft: interpretation.reviewDraft,
      sourceLabel: label,
      rawInput: `Image analysis: ${label}`,
      modelProvider: interpretation.provider,
      modelName: interpretation.model,
      createdBy: access.userId,
    });

    return NextResponse.json({
      reviewDraft,
      analysis: {
        provider: interpretation.provider,
        model: interpretation.model,
        usedFallback: interpretation.usedFallback,
        confidence: interpretation.result.confidence,
        warnings: interpretation.result.warnings,
        actions: interpretation.result.actions,
      },
    });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to analyze image.",
      500
    );
  }
}

