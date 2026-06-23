import "server-only";

import type { SpeechWorkerResult, SpeechWorkerSegment } from "@/lib/speech/types";

type SpeechUpload = {
  file: Blob | ArrayBuffer | Uint8Array;
  fileName?: string;
  contentType?: string;
};

type WorkerErrorPayload = {
  error?: {
    code?: string;
    message?: string;
  };
};

function failure(code: string, message: string): SpeechWorkerResult {
  return {
    ok: false,
    error: {
      code:
        code === "missing_secret" ||
        code === "invalid_secret" ||
        code === "file_too_large" ||
        code === "timeout" ||
        code === "transcription_failed" ||
        code === "invalid_file_type" ||
        code === "empty_result" ||
        code === "missing_config"
          ? code
          : "request_failed",
      message,
    },
  };
}

function toBlob(file: SpeechUpload["file"], contentType: string) {
  if (file instanceof Blob) return file.type === contentType ? file : file.slice(0, file.size, contentType);
  if (file instanceof Uint8Array) {
    const copy = new Uint8Array(file);
    return new Blob([copy.buffer], { type: contentType });
  }
  return new Blob([file], { type: contentType });
}

function responsePreview(text: string) {
  return text.replace(/\s+/g, " ").slice(0, 240);
}

export async function runSpeechWorker(
  upload: SpeechUpload
): Promise<SpeechWorkerResult> {
  const workerUrl = process.env.SPEECH_WORKER_URL?.trim();
  if (!workerUrl) {
    return failure("missing_config", "Speech worker is not configured.");
  }

  const secret = process.env.SPEECH_SHARED_SECRET ?? "";
  const secretHeader = process.env.SPEECH_SECRET_HEADER || "x-worker-secret";
  const contentType = upload.contentType || "audio/wav";
  const fileSize =
    upload.file instanceof Blob
      ? upload.file.size
      : upload.file instanceof Uint8Array
        ? upload.file.byteLength
        : upload.file.byteLength;

  const formData = new FormData();
  formData.append(
    "file",
    toBlob(upload.file, contentType),
    upload.fileName || "audio.wav"
  );

  const headers = new Headers();
  if (secret) headers.set(secretHeader, secret);

  try {
    console.info("[speech] worker request", {
      fileName: upload.fileName || "audio.wav",
      contentType,
      fileSize,
      workerUrlConfigured: Boolean(workerUrl),
    });

    const response = await fetch(new URL("/transcribe", workerUrl), {
      method: "POST",
      headers,
      body: formData,
    });
    const responseText = await response.text();
    console.info("[speech] worker response", {
      status: response.status,
      ok: response.ok,
      preview: responsePreview(responseText),
    });

    let payload: WorkerErrorPayload & {
      provider?: "faster-whisper";
      status?: "transcribed";
      language?: string;
      durationSeconds?: number;
      text?: string;
      segments?: SpeechWorkerSegment[];
    };
    try {
      payload = JSON.parse(responseText) as typeof payload;
    } catch {
      return failure("request_failed", "Speech worker returned an unreadable response.");
    }

    if (!response.ok) {
      return failure(
        payload.error?.code || "request_failed",
        payload.error?.message || "Speech worker request failed."
      );
    }

    if (
      payload.provider !== "faster-whisper" ||
      payload.status !== "transcribed" ||
      typeof payload.language !== "string" ||
      typeof payload.durationSeconds !== "number" ||
      typeof payload.text !== "string" ||
      !Array.isArray(payload.segments)
    ) {
      return failure(
        "request_failed",
        "Speech worker returned an invalid response."
      );
    }

    return {
      ok: true,
      data: {
        provider: payload.provider,
        status: payload.status,
        language: payload.language,
        durationSeconds: payload.durationSeconds,
        text: payload.text,
        segments: payload.segments,
      },
    };
  } catch (error) {
    console.warn("[speech] worker request failed", {
      message: error instanceof Error ? error.message : "Unknown speech worker error.",
    });
    return failure("request_failed", "Speech worker is unavailable.");
  }
}
