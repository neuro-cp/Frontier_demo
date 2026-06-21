# Frontier OCR Worker

Standalone OCR service for Frontier. This worker is intentionally isolated from the main Frontier app.

## Features

- FastAPI HTTP service.
- `GET /health`.
- `POST /ocr` PDF upload.
- OCRmyPDF + Tesseract searchable PDF generation.
- Text extraction from OCR output.
- Optional shared-secret request header.
- Clean JSON error responses.
- Cloud Run compatible.
- CPU only.
- No Supabase, database, or Frontier app access.

## Environment Variables

| Name | Required | Default | Description |
| --- | --- | --- | --- |
| `PORT` | No | `8080` | HTTP port used by Cloud Run/local Docker. |
| `OCR_SHARED_SECRET` | No | empty | If set, requests to `POST /ocr` must include the matching secret. |
| `OCR_SECRET_HEADER` | No | `x-worker-secret` | Header name used for the shared secret. |
| `OCR_LANGUAGE` | No | `eng` | Tesseract language passed to OCRmyPDF. |
| `OCR_TIMEOUT_SECONDS` | No | `180` | Max OCRmyPDF runtime per request. |
| `OCR_MAX_UPLOAD_MB` | No | `25` | Max accepted PDF upload size. |

## Local Python Run

Install system dependencies first:

```bash
sudo apt-get update
sudo apt-get install -y ghostscript qpdf tesseract-ocr tesseract-ocr-eng
```

Then run:

```bash
cd worker-ocr
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8080
```

Health check:

```bash
curl http://localhost:8080/health
```

OCR request:

```bash
curl -X POST http://localhost:8080/ocr \
  -H "x-worker-secret: your-secret" \
  -F "file=@sample.pdf"
```

If `OCR_SHARED_SECRET` is not set, the secret header is not required.

## Docker Build

```bash
cd worker-ocr
docker build -t frontier-ocr-worker .
```

## Docker Run

```bash
docker run --rm -p 8080:8080 \
  -e OCR_SHARED_SECRET=your-secret \
  frontier-ocr-worker
```

## API

### `GET /health`

Returns:

```json
{
  "status": "ok"
}
```

Errors use this shape:

```json
{
  "error": {
    "code": "invalid_file_type",
    "message": "Only PDF uploads are supported."
  }
}
```

Current error codes:

- `missing_secret`
- `invalid_secret`
- `file_too_large`
- `timeout`
- `ocr_failed`
- `invalid_file_type`
- `empty_result`
- `invalid_request`
- `request_failed`

### `POST /ocr`

Accepts multipart form upload field:

- `file`: PDF document.

Returns:

```json
{
  "provider": "ocrmypdf-tesseract",
  "status": "needs_review",
  "text": "..."
}
```

## Notes

- This worker does not deploy itself.
- This worker does not call Supabase.
- This worker does not create Frontier records.
- This worker does not include OCR review UI.
- See `SMOKE_TEST.md` for lightweight manual checks.
