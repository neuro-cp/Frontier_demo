import { NextRequest, NextResponse } from "next/server";

import { getOcrProviderMode, runOcrExtraction } from "@/lib/ocr/provider";
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

  const { data: membership, error: membershipError } = await supabase
    .from("workspace_members")
    .select("id")
    .eq("workspace_id", body.workspaceId)
    .eq("user_id", user.id)
    .eq("status", "Active")
    .maybeSingle();

  if (membershipError || !membership) {
    return jsonError("You do not have access to this workspace.", 403);
  }

  const { data: document, error: documentError } = await supabase
    .from("documents")
    .select("id, workspace_id, name, file_name, mime_type, storage_bucket, storage_path, notes, document_type, detected_type")
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

  const failJob = async (message: string) => {
    await Promise.all([
      supabase
        .from("ai_jobs")
        .update({
          status: "Failed",
          error_message: message,
          completed_at: new Date().toISOString(),
        })
        .eq("id", aiJob.id),
      supabase
        .from("documents")
        .update({
          processing_status: "failed",
          extraction_status: "OCR failed",
          ai_job_id: aiJob.id,
        })
        .eq("id", body.documentId)
        .eq("workspace_id", body.workspaceId),
    ]);
  };

  try {
    await supabase
      .from("documents")
      .update({
        processing_status: "processing",
        extraction_status: "Processing OCR",
        ai_job_id: aiJob.id,
      })
      .eq("id", body.documentId)
      .eq("workspace_id", body.workspaceId);

    await supabase
      .from("ai_jobs")
      .update({
        status: "Processing",
        started_at: new Date().toISOString(),
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

    const { data: updatedDocument, error: updateError } = await supabase
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
      })
      .eq("id", body.documentId)
      .eq("workspace_id", body.workspaceId)
      .select("*")
      .single();

    if (updateError) throw updateError;

    await supabase
      .from("ai_jobs")
      .update({
        status: "Needs Review",
        result_json: extractedJson,
        output_json: extractedJson,
        confidence: extraction.confidence,
        completed_at: new Date().toISOString(),
      })
      .eq("id", aiJob.id);

    return NextResponse.json({ document: updatedDocument });
  } catch (error) {
    const message = error instanceof Error ? error.message : "OCR failed.";
    await failJob(message);
    return jsonError(message, 500);
  }
}
