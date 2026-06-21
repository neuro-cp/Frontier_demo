export type SpeechWorkerStatus = "transcribed";

export type SpeechWorkerSegment = {
  start: number;
  end: number;
  text: string;
};

export type SpeechWorkerSuccess = {
  ok: true;
  data: {
    provider: "faster-whisper";
    status: SpeechWorkerStatus;
    language: string;
    durationSeconds: number;
    text: string;
    segments: SpeechWorkerSegment[];
  };
};

export type SpeechWorkerErrorCode =
  | "missing_config"
  | "missing_secret"
  | "invalid_secret"
  | "file_too_large"
  | "timeout"
  | "transcription_failed"
  | "invalid_file_type"
  | "empty_result"
  | "request_failed";

export type SpeechWorkerFailure = {
  ok: false;
  error: {
    code: SpeechWorkerErrorCode;
    message: string;
  };
};

export type SpeechWorkerResult = SpeechWorkerSuccess | SpeechWorkerFailure;
