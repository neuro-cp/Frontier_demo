export type OcrWorkerStatus = "needs_review";

export type OcrWorkerSuccess = {
  ok: true;
  data: {
    provider: "ocrmypdf-tesseract";
    status: OcrWorkerStatus;
    text: string;
  };
};

export type OcrWorkerErrorCode =
  | "missing_config"
  | "missing_secret"
  | "invalid_secret"
  | "file_too_large"
  | "timeout"
  | "ocr_failed"
  | "invalid_file_type"
  | "empty_result"
  | "request_failed";

export type OcrWorkerFailure = {
  ok: false;
  error: {
    code: OcrWorkerErrorCode;
    message: string;
  };
};

export type OcrWorkerResult = OcrWorkerSuccess | OcrWorkerFailure;
