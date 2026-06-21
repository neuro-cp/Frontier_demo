# OCR Worker Smoke Tests

These checks are documentation-first and do not require adding a test framework.

Assume the worker is running locally:

```bash
cd worker-ocr
uvicorn main:app --port 8080
```

Or with Docker:

```bash
docker run --rm -p 8080:8080 \
  -e OCR_SHARED_SECRET=test-secret \
  frontier-ocr-worker
```

## Health Check

```bash
curl http://localhost:8080/health
```

Expected:

```json
{"status":"ok"}
```

## OCR With Secret Header

```bash
curl -X POST http://localhost:8080/ocr \
  -H "x-worker-secret: test-secret" \
  -F "file=@../1.pdf"
```

Expected:

```json
{
  "provider": "ocrmypdf-tesseract",
  "status": "needs_review",
  "text": "..."
}
```

## OCR Without Secret Header

Run the worker with `OCR_SHARED_SECRET=test-secret`, then:

```bash
curl -X POST http://localhost:8080/ocr \
  -F "file=@../1.pdf"
```

Expected:

```json
{
  "error": {
    "code": "missing_secret",
    "message": "Missing shared secret."
  }
}
```

## Non-PDF Failure

```bash
curl -X POST http://localhost:8080/ocr \
  -H "x-worker-secret: test-secret" \
  -F "file=@README.md;type=text/plain"
```

Expected:

```json
{
  "error": {
    "code": "invalid_file_type",
    "message": "Only PDF uploads are supported."
  }
}
```

## Oversized Upload Failure

Start the worker with a tiny upload limit:

```bash
OCR_MAX_UPLOAD_MB=1 OCR_SHARED_SECRET=test-secret uvicorn main:app --port 8080
```

Upload a PDF larger than 1 MB.

Expected:

```json
{
  "error": {
    "code": "file_too_large",
    "message": "Uploaded PDF is too large."
  }
}
```

## Timeout Failure

Start the worker with a tiny timeout:

```bash
OCR_TIMEOUT_SECONDS=1 OCR_SHARED_SECRET=test-secret uvicorn main:app --port 8080
```

Upload a PDF that takes longer than 1 second to process.

Expected:

```json
{
  "error": {
    "code": "timeout",
    "message": "OCR timed out."
  }
}
```

## Notes

- Do not run heavy OCR tests in CI until system dependencies are available.
- A successful smoke test requires OCRmyPDF, Tesseract, Ghostscript, and QPDF.
