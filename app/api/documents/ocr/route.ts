import { NextRequest, NextResponse } from "next/server";

import {
  aiRestrictionMessage,
  checkAiInputForAbuse,
  getActiveAiRestriction,
  logAiAbuseEvent,
} from "@/lib/ai/abuseGuard";
import { interpretDocumentWithAI } from "@/lib/ai/providers/providerFactory";
import { createReviewDraft } from "@/lib/db/aiReviewDrafts";
import { getOcrProviderMode, runOcrExtraction } from "@/lib/ocr/provider";
import { createServiceRoleClient } from "@/lib/platformAdmin/server";
import { canUseOcr } from "@/lib/plans/capabilities";
import { resolveWorkspacePlanForServiceClient } from "@/lib/plans/server";
import { checkUserAndWorkspaceDailyLimits } from "@/lib/rateLimit/dailyCounters";
import { RateLimitError } from "@/lib/rateLimit/policy";
import { featureDisabledMessage, featureFlags } from "@/lib/services/featureFlags";
import { planUpgradeError } from "@/lib/services/routeProtection";
import { serviceLimits } from "@/lib/services/serviceLimits";
import { DOCUMENT_STORAGE_BUCKET } from "@/lib/storage";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type OcrRequestBody = {
  documentId?: string;
  workspaceId?: string;
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return jsonError("Sign in required to run OCR.", 401);
  }

  let body: OcrRequestBody;
  try {
    body = (await request.json()) as OcrRequestBody;
  } catch {
    return jsonError("Invalid OCR request.", 400);
  }

  if (!body.documentId || !body.workspaceId) {
    return jsonError("Document and workspace are required.", 400);
  }
  if (!featureFlags.ocr()) return jsonError(featureDisabledMessage("OCR"), 503);

  const { data: membership, error: membershipError } = await supabase
    .from("workspace_members")
    .select("id, role")
    .eq("workspace_id", body.workspaceId)
    .eq("user_id", user.id)
    .eq("status", "Active")
    .maybeSingle();

  if (membershipError || !membership) {
    return jsonError("You do not have access to this workspace.", 403);
  }
  if (membership.role !== "Owner" && membership.role !== "Manager") {
    return jsonError("Only Owners and Managers can run OCR.", 403);
  }
  const serviceClient = createServiceRoleClient();
  const plan = await resolveWorkspacePlanForServiceClient(serviceClient, body.workspaceId);
  if (!canUseOcr(plan)) return planUpgradeError();
  try {
    checkUserAndWorkspaceDailyLimits({
      service: "ocr",
      userId: user.id,
      workspaceId: body.workspaceId,
      userLimit: serviceLimits.ocr.maxRequestsPerUserPerDay(),
      workspaceLimit: serviceLimits.ocr.maxRequestsPerWorkspacePerDay(),
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "OCR quota exceeded.", error instanceof RateLimitError ? error.status : 429);
  }

  const { data: document, error: documentError } = await supabase
    .from("documents")
    .select("id, workspace_id, name, file_name, mime_type, storage_bucket, storage_path, notes, document_type, detected_type, ocr_retry_count")
    .eq("id", body.documentId)
    .eq("workspace_id", body.workspaceId)
    .maybeSingle();

  if (documentError) {
    return jsonError(documentError.message || "Unable to load document.", 500);
  }

  if (!document) {
    return jsonError("Document not found.", 404);
  }

  const providerMode = getOcrProviderMode();

  const { data: aiJob, error: jobError } = await supabase
    .from("ai_jobs")
    .insert({
      workspace_id: body.workspaceId,
      document_id: body.documentId,
      workflow_name: "document_ocr",
      job_type: "document_ocr",
      status: "Queued",
      model_provider: "frontier",
      model_name: providerMode === "worker" ? "ocrmypdf-tesseract" : `${providerMode}-ocr`,
      prompt_version: "ocr-foundation-v1",
      created_by: user.id,
      input_ref: document.storage_path,
      input_json: {
        fileName: document.file_name,
        mimeType: document.mime_type,
        storagePath: document.storage_path,
      },
    })
    .select("id")
    .single();

  if (jobError || !aiJob) {
    return jsonError(jobError?.message || "Unable to create OCR job.", 500);
  }

  const queuedAt = new Date().toISOString();

  await supabase
    .from("documents")
    .update({
      processing_status: "queued",
      extraction_status: "Queued for OCR",
      ai_job_id: aiJob.id,
      ocr_queued_at: queuedAt,
      ocr_error: null,
      ocr_retry_count: Number(document.ocr_retry_count ?? 0) + 1,
    })
    .eq("id", body.documentId)
    .eq("workspace_id", body.workspaceId);

  const failJob = async (message: string) => {
    const failedAt = new Date().toISOString();
    await Promise.all([
      supabase
        .from("ai_jobs")
        .update({
          status: "Failed",
          error_message: message,
          completed_at: failedAt,
        })
        .eq("id", aiJob.id),
      supabase
        .from("documents")
        .update({
          processing_status: "failed",
          extraction_status: "OCR failed",
          ai_job_id: aiJob.id,
          ocr_failed_at: failedAt,
          ocr_error: message,
        })
        .eq("id", body.documentId)
        .eq("workspace_id", body.workspaceId),
    ]);
  };

  try {
    const startedAt = new Date().toISOString();
    await supabase
      .from("documents")
      .update({
        processing_status: "processing",
        extraction_status: "Processing OCR",
        ai_job_id: aiJob.id,
        ocr_started_at: startedAt,
        ocr_error: null,
      })
      .eq("id", body.documentId)
      .eq("workspace_id", body.workspaceId);

    await supabase
      .from("ai_jobs")
      .update({
        status: "Processing",
        started_at: startedAt,
      })
      .eq("id", aiJob.id);

    let storedFile: Blob | undefined;
    if (providerMode === "worker") {
      if (!document.storage_path) {
        throw new Error("This document does not have a stored file to process.");
      }

      const { data, error } = await supabase.storage
        .from(document.storage_bucket || DOCUMENT_STORAGE_BUCKET)
        .download(document.storage_path);

      if (error || !data) {
        throw new Error(error?.message || "Unable to load the stored document for OCR.");
      }
      storedFile = data;
    }

    const extraction = await runOcrExtraction({
      documentId: document.id,
      workspaceId: document.workspace_id,
      fileName: document.file_name ?? document.name,
      mimeType: document.mime_type,
      storagePath: document.storage_path,
      notes: document.notes,
      documentType: document.document_type ?? document.detected_type,
      file: storedFile,
    });

    const extractedJson = {
      ...extraction.structuredData,
      safety: "Review extracted information before using it.",
    };

    const completedAt = new Date().toISOString();
    const { data: extractedDocument, error: updateError } = await supabase
      .from("documents")
      .update({
        processing_status: "needs_review",
        extraction_status: "Needs Review",
        extracted_text: extraction.text,
        extracted_json: extractedJson,
        ocr_provider: extraction.provider,
        confidence: extraction.confidence,
        document_type: extraction.structuredData.documentType,
        ai_job_id: aiJob.id,
        ocr_completed_at: completedAt,
        ocr_failed_at: null,
        ocr_error: null,
      })
      .eq("id", body.documentId)
      .eq("workspace_id", body.workspaceId)
      .select("*")
      .single();

    if (updateError) throw updateError;

    let reviewDraftId: string | null = null;
    let draftError: string | null = null;
    try {
      if (!featureFlags.ai()) {
        throw new Error("OCR completed, but AI review draft generation is temporarily disabled.");
      }
      const restriction = await getActiveAiRestriction(serviceClient, user.id);
      if (restriction) {
        throw new Error(aiRestrictionMessage);
      }
      const abuseCheck = checkAiInputForAbuse(extraction.text);
      if (!abuseCheck.ok) {
        await logAiAbuseEvent({
          serviceClient,
          workspaceId: body.workspaceId,
          userId: user.id,
          source: "ocr_extraction",
          text: extraction.text,
          reason: abuseCheck.reason,
          severity: abuseCheck.severity,
        });
        throw new Error(
          "OCR completed, but AI review draft creation was blocked for safety review."
        );
      }
      const interpretation = await interpretDocumentWithAI({
        workspaceId: body.workspaceId,
        sourceId: body.documentId,
        text: extraction.text,
      });
      const reviewDraft = await createReviewDraft(supabase, {
        reviewDraft: interpretation.reviewDraft,
        sourceLabel: document.file_name ?? document.name ?? "Document",
        rawInput: JSON.stringify({
          text: extraction.text,
          ocr: {
            provider: extraction.provider,
            confidence: extraction.confidence,
            aiJobId: aiJob.id,
            completedAt,
          },
        }),
        modelProvider: interpretation.provider,
        modelName: interpretation.model,
        createdBy: user.id,
      });
      reviewDraftId = reviewDraft.id;
    } catch (error) {
      draftError =
        error instanceof Error
          ? error.message
          : "OCR completed, but review draft creation failed.";
    }

    let updatedDocument = extractedDocument;
    if (reviewDraftId) {
      const { data: documentWithDraft } = await supabase
        .from("documents")
        .update({ ocr_review_draft_id: reviewDraftId })
        .eq("id", body.documentId)
        .eq("workspace_id", body.workspaceId)
        .select("*")
        .single();
      updatedDocument = documentWithDraft ?? extractedDocument;
    }

    await supabase
      .from("ai_jobs")
      .update({
        status: "Needs Review",
        result_json: {
          ...extractedJson,
          reviewDraftId,
          draftError,
        },
        output_json: {
          ...extractedJson,
          reviewDraftId,
          draftError,
        },
        confidence: extraction.confidence,
        completed_at: completedAt,
      })
      .eq("id", aiJob.id);

    return NextResponse.json({ document: updatedDocument, reviewDraftId, draftError });
  } catch (error) {
    const message = error instanceof Error ? error.message : "OCR failed.";
    await failJob(message);
    return jsonError(message, 500);
  }
}
