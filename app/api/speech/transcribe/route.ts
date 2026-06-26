import { NextRequest, NextResponse } from "next/server";

import {
  aiRestrictionMessage,
  checkAiInputForAbuse,
  getActiveAiRestriction,
  logAiAbuseEvent,
} from "@/lib/ai/abuseGuard";
import { interpretTranscriptWithAI } from "@/lib/ai/providers/providerFactory";
import { createReviewDraft } from "@/lib/db/aiReviewDrafts";
import { isUuid } from "@/lib/db/ids";
import { createServiceRoleClient } from "@/lib/platformAdmin/server";
import { canUseSpeech } from "@/lib/plans/capabilities";
import { resolveWorkspacePlanForServiceClient } from "@/lib/plans/server";
import { checkUserAndWorkspaceDailyLimits } from "@/lib/rateLimit/dailyCounters";
import { RateLimitError } from "@/lib/rateLimit/policy";
import { featureDisabledMessage, featureFlags } from "@/lib/services/featureFlags";
import { planUpgradeError } from "@/lib/services/routeProtection";
import { serviceLimits } from "@/lib/services/serviceLimits";
import { runSpeechWorker } from "@/lib/speech/workerClient";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const AUDIO_EXTENSIONS = new Set([
  "wav",
  "mp3",
  "m4a",
  "ogg",
  "flac",
  "webm",
  "mp4",
]);

function jsonError(message: string, status: number, code = "request_failed") {
  return NextResponse.json({ error: message, errorCode: code }, { status });
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return jsonError("Sign in required to transcribe audio.", 401);
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError("Invalid transcription request.", 400);
  }

  const workspaceId = formData.get("workspaceId");
  const sourceLabel = formData.get("sourceLabel");
  const createDraftValue = formData.get("createReviewDraft");
  const file = formData.get("file");

  if (typeof workspaceId !== "string" || !isUuid(workspaceId)) {
    return jsonError("Workspace is required.", 400);
  }

  if (!(file instanceof File) || file.size === 0) {
    return jsonError("An audio file is required.", 400);
  }
  if (!featureFlags.speech()) return jsonError(featureDisabledMessage("Speech transcription"), 503);

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!AUDIO_EXTENSIONS.has(extension)) {
    return jsonError("Supported audio types are WAV, MP3, M4A, OGG, FLAC, WebM, and MP4.", 400, "invalid_file_type");
  }

  const { data: membership, error: membershipError } = await supabase
    .from("workspace_members")
    .select("id, role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .eq("status", "Active")
    .maybeSingle();

  if (membershipError || !membership) {
    return jsonError("You do not have access to this workspace.", 403);
  }
  if (membership.role !== "Owner" && membership.role !== "Manager") {
    return jsonError("Only Owners and Managers can transcribe audio.", 403);
  }
  const serviceClient = createServiceRoleClient();
  const plan = await resolveWorkspacePlanForServiceClient(serviceClient, workspaceId);
  if (!canUseSpeech(plan)) return planUpgradeError();
  try {
    checkUserAndWorkspaceDailyLimits({
      service: "speech",
      userId: user.id,
      workspaceId,
      userLimit: serviceLimits.speech.maxRequestsPerUserPerDay(),
      workspaceLimit: serviceLimits.speech.maxRequestsPerWorkspacePerDay(),
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Speech quota exceeded.", error instanceof RateLimitError ? error.status : 429);
  }

  const normalizedContentType = file.type.split(";", 1)[0].trim() || "application/octet-stream";
  const shouldCreateReviewDraft = createDraftValue !== "false";
  const queuedAt = new Date().toISOString();
  const { data: transcriptRecord, error: transcriptError } = await supabase
    .from("speech_transcripts")
    .insert({
      workspace_id: workspaceId,
      created_by: user.id,
      source_label:
        typeof sourceLabel === "string" && sourceLabel.trim()
          ? sourceLabel.trim()
          : file.name,
      file_name: file.name,
      mime_type: normalizedContentType,
      size_bytes: file.size,
      status: "queued",
      retry_count: 1,
      queued_at: queuedAt,
    })
    .select("id")
    .single();

  if (transcriptError || !transcriptRecord) {
    return jsonError(transcriptError?.message || "Unable to create transcript job.", 500);
  }

  console.info("[speech] transcribe request", {
    fileName: file.name,
    contentType: normalizedContentType,
    fileSize: file.size,
    workerUrlConfigured: Boolean(process.env.SPEECH_WORKER_URL?.trim()),
  });

  await supabase
    .from("speech_transcripts")
    .update({
      status: "processing",
      started_at: new Date().toISOString(),
      error_text: null,
    })
    .eq("id", transcriptRecord.id)
    .eq("workspace_id", workspaceId);

  const result = await runSpeechWorker({
    file,
    fileName: file.name,
    // MediaRecorder commonly adds codec parameters (for example,
    // audio/webm;codecs=opus), while the worker validates the base MIME type.
    contentType: normalizedContentType,
  });

  if (!result.ok) {
    const failedAt = new Date().toISOString();
    await supabase
      .from("speech_transcripts")
      .update({
        status: "failed",
        failed_at: failedAt,
        error_text: result.error.message,
      })
      .eq("id", transcriptRecord.id)
      .eq("workspace_id", workspaceId);
    const status =
      result.error.code === "file_too_large"
        ? 413
        : result.error.code === "invalid_file_type"
          ? 415
          : result.error.code === "missing_config"
            ? 503
            : 502;
    return jsonError(result.error.message, status, result.error.code);
  }

  const completedAt = new Date().toISOString();
  let reviewDraftId: string | null = null;
  let draftError: string | null = null;

  const { data: completedTranscript } = await supabase
    .from("speech_transcripts")
    .update({
      status: "completed",
      transcript_text: result.data.text,
      provider: result.data.provider,
      model_name: "faster-whisper",
      language: result.data.language,
      duration_seconds: result.data.durationSeconds,
      segments: result.data.segments,
      completed_at: completedAt,
      failed_at: null,
      error_text: null,
    })
    .eq("id", transcriptRecord.id)
    .eq("workspace_id", workspaceId)
    .select("*")
    .single();

  if (shouldCreateReviewDraft) {
    try {
      if (!featureFlags.ai()) {
        throw new Error("Speech transcription completed, but AI review draft generation is temporarily disabled.");
      }
      const restriction = await getActiveAiRestriction(serviceClient, user.id);
      if (restriction) {
        throw new Error(aiRestrictionMessage);
      }
      const abuseCheck = checkAiInputForAbuse(result.data.text);
      if (!abuseCheck.ok) {
        await logAiAbuseEvent({
          serviceClient,
          workspaceId,
          userId: user.id,
          source: "speech_transcription",
          text: result.data.text,
          reason: abuseCheck.reason,
          severity: abuseCheck.severity,
        });
        throw new Error(
          "This transcript was blocked for safety review. You can request reinstatement from account support."
        );
      }
      const interpretation = await interpretTranscriptWithAI({
        workspaceId,
        sourceId: transcriptRecord.id,
        text: result.data.text,
      });
      const reviewDraft = await createReviewDraft(supabase, {
        reviewDraft: interpretation.reviewDraft,
        sourceLabel:
          typeof sourceLabel === "string" && sourceLabel.trim()
            ? sourceLabel.trim()
            : file.name,
        rawInput: JSON.stringify({
          transcript: result.data.text,
          speech: {
            provider: result.data.provider,
            language: result.data.language,
            durationSeconds: result.data.durationSeconds,
            transcriptId: transcriptRecord.id,
            completedAt,
          },
        }),
        modelProvider: interpretation.provider,
        modelName: interpretation.model,
        createdBy: user.id,
      });
      reviewDraftId = reviewDraft.id;
      await supabase
        .from("speech_transcripts")
        .update({ review_draft_id: reviewDraftId })
        .eq("id", transcriptRecord.id)
        .eq("workspace_id", workspaceId);
    } catch (error) {
      draftError =
        error instanceof Error
          ? error.message
          : "Speech transcription completed, but review draft creation failed.";
    }
  }

  return NextResponse.json({
    transcription: result.data,
    speechTranscript: completedTranscript
      ? {
          id: completedTranscript.id,
          status: completedTranscript.status,
          sourceLabel: completedTranscript.source_label,
          provider: completedTranscript.provider,
          language: completedTranscript.language,
          durationSeconds: completedTranscript.duration_seconds,
          retryCount: completedTranscript.retry_count,
          queuedAt: completedTranscript.queued_at,
          startedAt: completedTranscript.started_at,
          completedAt: completedTranscript.completed_at,
          failedAt: completedTranscript.failed_at,
          errorText: completedTranscript.error_text,
          reviewDraftId,
        }
      : null,
    transcriptId: transcriptRecord.id,
    reviewDraftId,
    draftError,
  });
}
