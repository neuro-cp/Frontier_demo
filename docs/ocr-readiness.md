# OCR Readiness

Documents now have the metadata needed for OCR and visual document understanding.

## Document Fields

- `processing_status`
- `extracted_text`
- `extracted_json`
- `ocr_provider`
- `ai_job_id`
- `reviewed_at`
- `reviewed_by`
- `confidence`
- `document_type`

## Status Flow

```text
uploaded -> queued -> processing -> needs_review -> reviewed
                                      -> failed
```

## Still Missing

- OCR queue button or automatic enqueue.
- Worker/job runner.
- Review extracted document data screen.
- Provider-specific parser adapters.
