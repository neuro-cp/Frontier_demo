# Unified AI Ingestion Architecture

Frontier uses a single review-first ingestion model for OCR, speech, and image analysis.

## Shared Flow

```text
Source upload or input
  -> server-side worker/provider route
  -> lifecycle persistence
  -> extracted text/summary/metadata persistence
  -> AI review draft
  -> human review
  -> explicit approval
  -> explicit execution through action layer
```

## Active Intake Modes

### OCR

- Source: PDF document.
- Lifecycle: `documents.processing_status` plus OCR timestamp/error/retry fields.
- Output: extracted text, extracted JSON, OCR metadata, linked review draft.

### Speech

- Source: uploaded audio or browser microphone recording.
- Lifecycle: `speech_transcripts.status` plus timestamp/error/retry fields.
- Output: transcript text, speech metadata, linked review draft.

### Image

- Source: JPG, PNG, or WebP document/image upload.
- Lifecycle: `documents.image_analysis_status` plus image timestamp/error/retry fields.
- Output: image analysis summary, provider metadata, linked review draft.

## Review Queue Integration

The Review Queue hydrates source previews from:

- `documents` for OCR and image drafts.
- `speech_transcripts` for transcript drafts.
- `ai_review_drafts` for draft status, warnings, actions, audit, revisions, and execution state.

## Non-Negotiable Execution Boundary

No OCR, speech, or image result mutates clients, jobs, invoices, expenses, inventory, calendar records, or materials directly.

Execution requires:

1. Draft exists.
2. User reviews it.
3. User approves it.
4. User clicks execute.
5. Server validates workspace, permissions, status, action type, and payload.
6. Server executes through the shared action layer.

## Remaining Activation Work

- Final extraction quality validation.
- Provider outage handling drills.
- Secure source preview/download affordances in review detail.
- Logistics activation and dispatch validation.
- Production security hardening and beta QA.
