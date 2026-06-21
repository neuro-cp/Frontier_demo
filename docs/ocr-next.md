# OCR MVP Next

## Goal

Turn the existing OCR foundation into a practical document extraction workflow without adding external providers in this sprint.

## Current Status

- Standalone `worker-ocr/` service exists.
- Worker QA hardening is in place.
- Worker returns clean JSON success and error payloads.
- Frontier app integration has not started.
- OCR review screen has not started.
- Deployment has not started.

## Intended Flow

Upload Document
-> Create Metadata
-> Queue OCR Job
-> Run Tesseract/OCRmyPDF
-> Store Extracted Text
-> Score Confidence
-> Human Review
-> Mark Reviewed

## Implementation Notes

- Start with Tesseract/OCRmyPDF for local or server-side OCR.
- Store confidence scores per document and, if practical, per extracted field.
- Keep OCR output as a draft until a human approves it.
- Use `ai_jobs` or equivalent job records for status, errors, attempts, and timing.
- Add an optional AI rescue path only after deterministic OCR and review flow are stable.
- Do not create clients, jobs, invoices, or expenses automatically from OCR output.

## Review Requirements

- Human approval is required before extracted data affects business records.
- Low-confidence fields should be visibly flagged in the review screen.
- Failed OCR jobs should remain inspectable and retryable.

## Next Phases

1. App-side OCR API route.
2. Document upload -> OCR worker call.
3. OCR review screen.
4. Approve extracted result.
5. Action layer integration.
