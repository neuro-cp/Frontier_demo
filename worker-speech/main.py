import asyncio
import os
import tempfile
from pathlib import Path
from typing import Any

from fastapi import FastAPI, File, HTTPException, Request, UploadFile
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from faster_whisper import WhisperModel


app = FastAPI(title="Frontier Speech Worker")

PROVIDER = "faster-whisper"
SERVICE = "frontier-speech-worker"
ALLOWED_EXTENSIONS = {".wav", ".mp3", ".m4a", ".mp4", ".ogg", ".flac", ".webm"}
ALLOWED_CONTENT_TYPES = {
    "audio/wav",
    "audio/wave",
    "audio/x-wav",
    "audio/mpeg",
    "audio/mp3",
    "audio/mp4",
    "audio/x-m4a",
    "audio/ogg",
    "audio/flac",
    "audio/webm",
    "video/mp4",
    "application/octet-stream",
}

_model: WhisperModel | None = None
_model_lock = asyncio.Lock()


class WorkerError(Exception):
    def __init__(self, code: str, message: str, status_code: int = 400):
        self.code = code
        self.message = message
        self.status_code = status_code
        super().__init__(message)


def get_int_env(name: str, default: int) -> int:
    try:
        value = int(os.getenv(name, str(default)))
    except ValueError:
        return default
    return value if value > 0 else default


def get_secret_header_name() -> str:
    return os.getenv("SPEECH_SECRET_HEADER", "x-worker-secret").lower()


async def require_shared_secret(request: Request) -> None:
    expected = os.getenv("SPEECH_SHARED_SECRET", "")
    if not expected:
        return
    provided = request.headers.get(get_secret_header_name())
    if provided is None:
        raise WorkerError("missing_secret", "Missing shared secret.", 401)
    if provided != expected:
        raise WorkerError("invalid_secret", "Invalid shared secret.", 401)


def looks_like_audio(contents: bytes) -> bool:
    if contents.startswith(b"RIFF") and b"WAVE" in contents[:16]:
        return True
    if contents.startswith(b"ID3") or contents[:2] in {b"\xff\xfb", b"\xff\xf3", b"\xff\xf2"}:
        return True
    if contents.startswith(b"OggS") or contents.startswith(b"fLaC"):
        return True
    if contents.startswith(b"\x1a\x45\xdf\xa3"):
        return True
    if b"ftyp" in contents[:16]:
        return True
    return False


def validate_upload(file: UploadFile, contents: bytes) -> None:
    extension = Path(file.filename or "").suffix.lower()
    content_type = (file.content_type or "").lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise WorkerError(
            "invalid_file_type",
            "Only common audio uploads are supported.",
            400,
        )
    if content_type and content_type not in ALLOWED_CONTENT_TYPES:
        raise WorkerError(
            "invalid_file_type",
            "Only common audio uploads are supported.",
            400,
        )
    if not contents or not looks_like_audio(contents):
        raise WorkerError(
            "invalid_file_type",
            "Only common audio uploads are supported.",
            400,
        )


def get_model_config() -> tuple[str, str, str]:
    model_size = os.getenv("WHISPER_MODEL_SIZE", "tiny").strip() or "tiny"
    device = os.getenv("WHISPER_DEVICE", "cpu").strip() or "cpu"
    compute_type = os.getenv("WHISPER_COMPUTE_TYPE", "int8").strip() or "int8"
    return model_size, device, compute_type


async def get_model() -> WhisperModel:
    global _model
    if _model is not None:
        return _model
    async with _model_lock:
        if _model is None:
            model_size, device, compute_type = get_model_config()
            _model = await asyncio.to_thread(
                WhisperModel,
                model_size,
                device=device,
                compute_type=compute_type,
            )
    return _model


def transcribe_file(model: WhisperModel, input_path: Path) -> dict[str, Any]:
    segments_iter, info = model.transcribe(
        str(input_path),
        beam_size=1,
        vad_filter=True,
    )
    segments = [
        {
            "start": round(segment.start, 3),
            "end": round(segment.end, 3),
            "text": segment.text.strip(),
        }
        for segment in segments_iter
        if segment.text.strip()
    ]
    text = " ".join(segment["text"] for segment in segments).strip()
    if not text:
        raise WorkerError(
            "empty_result",
            "Transcription completed without extracted text.",
            422,
        )
    return {
        "provider": PROVIDER,
        "status": "transcribed",
        "language": info.language or "unknown",
        "durationSeconds": round(float(info.duration or 0), 3),
        "text": text,
        "segments": segments,
    }


@app.exception_handler(WorkerError)
async def worker_error_handler(_request: Request, exc: WorkerError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": exc.code, "message": exc.message}},
    )


@app.exception_handler(HTTPException)
async def http_error_handler(_request: Request, exc: HTTPException) -> JSONResponse:
    message = exc.detail if isinstance(exc.detail, str) else "Request failed."
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": "request_failed", "message": message}},
    )


@app.exception_handler(RequestValidationError)
async def validation_error_handler(
    _request: Request, _exc: RequestValidationError
) -> JSONResponse:
    return JSONResponse(
        status_code=400,
        content={
            "error": {
                "code": "invalid_request",
                "message": "Invalid transcription request.",
            }
        },
    )


@app.exception_handler(Exception)
async def unhandled_error_handler(_request: Request, _exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": "transcription_failed",
                "message": "Transcription request failed.",
            }
        },
    )


@app.get("/health")
def health() -> dict[str, str | bool]:
    return {"ok": True, "service": SERVICE, "provider": PROVIDER}


@app.post("/transcribe")
async def transcribe(
    request: Request,
    file: UploadFile = File(...),
) -> dict[str, Any]:
    await require_shared_secret(request)

    max_upload_bytes = get_int_env("SPEECH_MAX_UPLOAD_MB", 25) * 1024 * 1024
    timeout = get_int_env("SPEECH_TIMEOUT_SECONDS", 180)
    contents = await file.read()

    if len(contents) > max_upload_bytes:
        raise WorkerError("file_too_large", "Uploaded audio is too large.", 413)
    validate_upload(file, contents)

    with tempfile.TemporaryDirectory() as temp_dir:
        input_path = Path(temp_dir) / f"input{Path(file.filename or '.wav').suffix}"
        input_path.write_bytes(contents)
        model = await get_model()
        try:
            return await asyncio.wait_for(
                asyncio.to_thread(transcribe_file, model, input_path),
                timeout=timeout,
            )
        except asyncio.TimeoutError as exc:
            raise WorkerError("timeout", "Transcription timed out.", 504) from exc
        except WorkerError:
            raise
        except Exception as exc:
            raise WorkerError(
                "transcription_failed",
                "Transcription processing failed.",
                422,
            ) from exc
