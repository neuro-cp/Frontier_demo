# AI Data Retention

Frontier stores uploaded binaries in R2 and stores durable business metadata in Supabase. OCR, image analysis, speech transcription, and AI review drafts can create bulky intermediate payloads, so those payloads should not live in Postgres forever.

## Retention Goals

- Keep original uploaded files in R2 until the user deletes them.
- Keep document metadata, business records, approval status, execution status, and compact audit data in Supabase.
- Purge or compact bulky intermediate OCR/AI data after an approved review draft executes.
- Preserve enough traceability to answer what source created a record, who approved it, what action executed, and what records were created.

## Supabase Long-Term Data

Keep these fields durable and queryable:

- document id, workspace id, source relationships, file name, MIME type, storage provider, bucket, object key, status, and timestamps
- review draft id, source label, source type, source id, status, confidence, warnings, approved actions, execution status, executed user, execution result, and timestamps
- final created records such as clients, jobs, invoices, expenses, inventory records, and material allocations
- compact audit events and revision history
- short error messages needed to troubleshoot failed processing

## Short-Lived Bulky Data

These fields are allowed during processing and review, but should be purged or moved to R2 staging after execution:

- `documents.extracted_text`
- `documents.extracted_json`
- `ai_review_drafts.raw_input`
- `ai_jobs.input_json`
- `ai_jobs.output_json`
- `speech_transcripts.transcript_text`
- `speech_transcripts.segments`
- raw OCR worker output
- raw image model output
- long speech transcript payloads

## Current Purge-After-Execution Behavior

When an approved review draft executes successfully, Frontier now calls `purgeExecutedReviewDraftPayload()` after the business command completes.

The purge keeps:

- review draft id
- source label and source relationship
- approved actions
- warnings
- execution result and created record ids
- executed timestamps and user ids
- original uploaded document metadata and R2 object
- final business records

The purge clears or compacts:

- `ai_review_drafts.raw_input`
- OCR document `extracted_text`
- OCR document `extracted_json`
- related `ai_jobs.input_json`
- related `ai_jobs.output_json`
- transcript `transcript_text`
- transcript `segments`

Image analysis currently keeps the compact `image_analysis_summary` because Frontier does not yet persist a separate bulky raw image-analysis payload. If raw image model output is added later, store it in R2 staging and purge it after execution.

## Default Retention Windows

- Executed draft bulky payloads: purge immediately after successful execution.
- Failed processing payloads: keep 30 days, then purge.
- Unresolved pending review payloads: keep 30-90 days depending on workspace plan.
- Original uploaded files: keep until user deletion or workspace retention policy deletion.
- Compact audit records: keep long-term.

## R2 Staging TODO

Future work should move bulky processing payloads out of Supabase before execution:

- store OCR raw text and structured JSON at `workspaceId/staging/ocr/documentId.json`
- store AI raw prompts/responses at `workspaceId/staging/ai-review-drafts/draftId.json`
- store long transcript text/segments at `workspaceId/staging/transcripts/transcriptId.json`
- store raw image-analysis output at `workspaceId/staging/image-analysis/documentId.json`
- store only staging object keys in Supabase
- add a scheduled cleanup route for expired staging objects

This keeps Supabase focused on metadata, review state, audit, and business records while R2 handles bulky temporary payloads.
