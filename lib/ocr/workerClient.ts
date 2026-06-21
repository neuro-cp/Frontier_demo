import "server-only";

import type { OcrWorkerResult } from "@/lib/ocr/types";

type OcrUpload = {
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

function failure(code: string, message: string): OcrWorkerResult {
  return {
    ok: false,
    error: {
      code:
        code === "missing_secret" ||
        code === "invalid_secret" ||
        code === "file_too_large" ||
        code === "timeout" ||
        code === "ocr_failed" ||
        code === "invalid_file_type" ||
        code === "empty_result"
          ? code
          : code === "missing_config"
            ? "missing_config"
            : "request_failed",
      message,
    },
  };
}

function toBlob(file: OcrUpload["file"], contentType: string) {
  if (file instanceof Blob) return file;
  if (file instanceof Uint8Array) {
    const copy = new Uint8Array(file);
    return new Blob([copy.buffer], { type: contentType });
  }
  return new Blob([file], { type: contentType });
}

export async function runOcrWorker(upload: OcrUpload): Promise<OcrWorkerResult> {
  const workerUrl = process.env.OCR_WORKER_URL?.trim();
  if (!workerUrl) {
    return failure("missing_config", "OCR worker is not configured.");
  }

  const secret = process.env.OCR_SHARED_SECRET ?? "";
  const secretHeader = process.env.OCR_SECRET_HEADER || "x-worker-secret";
  const contentType = upload.contentType || "application/pdf";

  const formData = new FormData();
  formData.append(
    "file",
    toBlob(upload.file, contentType),
    upload.fileName || "document.pdf"
  );

  const headers = new Headers();
  if (secret) headers.set(secretHeader, secret);

  try {
    const response = await fetch(new URL("/ocr", workerUrl), {
      method: "POST",
      headers,
      body: formData,
    });
    const payload = (await response.json()) as WorkerErrorPayload & {
      provider?: "ocrmypdf-tesseract";
      status?: "needs_review";
      text?: string;
    };

    if (!response.ok) {
      return failure(
        payload.error?.code || "request_failed",
        payload.error?.message || "OCR worker request failed."
      );
    }

    if (
      payload.provider !== "ocrmypdf-tesseract" ||
      payload.status !== "needs_review" ||
      typeof payload.text !== "string"
    ) {
      return failure("request_failed", "OCR worker returned an invalid response.");
    }

    return {
      ok: true,
      data: {
        provider: payload.provider,
        status: payload.status,
        text: payload.text,
      },
    };
  } catch {
    return failure("request_failed", "OCR worker is unavailable.");
  }
}
