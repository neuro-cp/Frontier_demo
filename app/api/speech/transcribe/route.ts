import { NextRequest, NextResponse } from "next/server";

import { isUuid } from "@/lib/db/ids";
import { canUseSpeech } from "@/lib/plans/capabilities";
import { resolveWorkspacePlan } from "@/lib/plans/server";
import { checkUserAndWorkspaceDailyLimits } from "@/lib/rateLimit/dailyCounters";
import { RateLimitError } from "@/lib/rateLimit/policy";
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
  const file = formData.get("file");

  if (typeof workspaceId !== "string" || !isUuid(workspaceId)) {
    return jsonError("Workspace is required.", 400);
  }

  if (!(file instanceof File) || file.size === 0) {
    return jsonError("An audio file is required.", 400);
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!AUDIO_EXTENSIONS.has(extension)) {
    return jsonError("Supported audio types are WAV, MP3, M4A, OGG, FLAC, WebM, and MP4.", 400, "invalid_file_type");
  }

  const { data: membership, error: membershipError } = await supabase
    .from("workspace_members")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .eq("status", "Active")
    .maybeSingle();

  if (membershipError || !membership) {
    return jsonError("You do not have access to this workspace.", 403);
  }
  if (!canUseSpeech(resolveWorkspacePlan())) return planUpgradeError();
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
  console.info("[speech] transcribe request", {
    fileName: file.name,
    contentType: normalizedContentType,
    fileSize: file.size,
    workerUrlConfigured: Boolean(process.env.SPEECH_WORKER_URL?.trim()),
  });

  const result = await runSpeechWorker({
    file,
    fileName: file.name,
    // MediaRecorder commonly adds codec parameters (for example,
    // audio/webm;codecs=opus), while the worker validates the base MIME type.
    contentType: normalizedContentType,
  });

  if (!result.ok) {
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

  return NextResponse.json({ transcription: result.data });
}
