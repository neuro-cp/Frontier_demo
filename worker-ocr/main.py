import os
import re
import subprocess
import tempfile
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, Request, UploadFile
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pypdf import PdfReader


app = FastAPI(title="Frontier OCR Worker")

PROVIDER = "ocrmypdf-tesseract"
SAFE_LANGUAGE_PATTERN = re.compile(r"^[A-Za-z0-9_+-]+$")


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
    return os.getenv("OCR_SECRET_HEADER", "x-worker-secret").lower()


async def require_shared_secret(request: Request) -> None:
    expected = os.getenv("OCR_SHARED_SECRET", "")
    if not expected:
        return
    provided = request.headers.get(get_secret_header_name())
    if provided is None:
        raise WorkerError("missing_secret", "Missing shared secret.", 401)
    if provided != expected:
        raise WorkerError("invalid_secret", "Invalid shared secret.", 401)


def get_ocr_language() -> str:
    language = os.getenv("OCR_LANGUAGE", "eng").strip() or "eng"
    if not SAFE_LANGUAGE_PATTERN.fullmatch(language):
        raise WorkerError("ocr_failed", "OCR language configuration is invalid.", 500)
    return language


def extract_text(pdf_path: Path) -> str:
    reader = PdfReader(str(pdf_path))
    pages = []
    for page in reader.pages:
        pages.append(page.extract_text() or "")
    return "\n\n".join(part.strip() for part in pages if part.strip())


def run_ocr(input_path: Path, output_path: Path) -> None:
    language = get_ocr_language()
    timeout = get_int_env("OCR_TIMEOUT_SECONDS", 180)
    command = [
        "ocrmypdf",
        "--force-ocr",
        "--skip-big",
        "50",
        "--language",
        language,
        str(input_path),
        str(output_path),
    ]

    try:
        subprocess.run(
            command,
            check=True,
            capture_output=True,
            text=True,
            timeout=timeout,
        )
    except subprocess.TimeoutExpired as exc:
        raise WorkerError("timeout", "OCR timed out.", 504) from exc
    except subprocess.CalledProcessError as exc:
        raise WorkerError("ocr_failed", "OCR processing failed.", 422) from exc


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
                "message": "Invalid OCR request.",
            }
        },
    )


@app.exception_handler(Exception)
async def unhandled_error_handler(_request: Request, _exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": "ocr_failed",
                "message": "OCR request failed.",
            }
        },
    )


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/ocr")
async def ocr(
    request: Request,
    file: UploadFile = File(...),
) -> dict[str, str]:
    await require_shared_secret(request)

    if file.content_type not in {"application/pdf", "application/x-pdf"}:
        raise WorkerError(
            "invalid_file_type",
            "Only PDF uploads are supported.",
            400,
        )

    max_upload_bytes = get_int_env("OCR_MAX_UPLOAD_MB", 25) * 1024 * 1024
    contents = await file.read()
    if not contents:
        raise WorkerError("invalid_file_type", "Uploaded PDF is empty.", 400)
    if not contents.startswith(b"%PDF"):
        raise WorkerError(
            "invalid_file_type",
            "Only PDF uploads are supported.",
            400,
        )
    if len(contents) > max_upload_bytes:
        raise WorkerError("file_too_large", "Uploaded PDF is too large.", 413)

    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        input_path = temp_path / "input.pdf"
        output_path = temp_path / "output.pdf"
        input_path.write_bytes(contents)

        run_ocr(input_path, output_path)
        text = extract_text(output_path)

    if not text.strip():
        raise WorkerError("empty_result", "OCR completed without extracted text.", 422)

    return {
        "provider": PROVIDER,
        "status": "needs_review",
        "text": text,
    }
