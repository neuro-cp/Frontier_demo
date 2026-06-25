# OCR Activation Checklist

Use this checklist when Frontier is ready to reconnect OCR, speech, and image intake to the completed review substrate.

## Current Ready Components

- Review Queue dashboard, filters, search, sorting, status badges, source badges, confidence display, and draft summaries.
- Draft detail cards with source attribution placeholders, action previews, affected-record form links, confidence indicators, and validation warnings.
- Manual review workflow: edit, duplicate, approve, reject, mark needs changes, archive, and explicit execute.
- Audit trail for created, edited, approved, rejected, needs changes, archived, duplicated, executed, and failed execution events.
- Revision history for edited draft payloads.
- Server-authoritative execution through the shared action layer.

## OCR Activation Steps

1. Confirm document upload still stores file metadata and workspace ownership.
2. Confirm OCR worker health and configured worker URL without exposing secrets.
3. Run OCR on one small PDF.
4. Persist extracted text on the document record.
5. Generate an AI review draft from the extracted text.
6. Confirm source attribution links the review draft back to the document.
7. Confirm extracted text preview is hydrated in the Review Queue.
8. Confirm no draft executes until explicit approval and execute.
9. Confirm rejected, archived, needs-changes, and already-executed drafts cannot execute.
10. Confirm workspace isolation blocks cross-workspace source access.

## Speech Activation Steps

1. Confirm speech worker health and configured worker URL without exposing secrets.
2. Confirm microphone recording and file upload still post only to server routes.
3. Persist transcript source metadata.
4. Generate a review draft from a short transcript.
5. Hydrate transcript preview in the Review Queue.
6. Confirm the same approval and execution boundaries as OCR.

## Image Activation Steps

1. Confirm image normalization still stores original and normalized metadata.
2. Confirm vision analysis route is server-only and quota guarded.
3. Generate a review draft from one high-quality business image.
4. Preserve source image attribution.
5. Hydrate image preview through a safe signed or proxied source path.
6. Confirm enhanced analysis remains explicit and one-time only.

## Do Not Activate Until Verified

- Automatic execution.
- Destructive actions.
- Cross-workspace source previews.
- Client or employee portal access to raw AI source data.
- External email, SMS, or push notifications for AI review events.

## Recommended First Activation Sprint

Start with PDF OCR because the file flow, OCR worker, document metadata, AI draft persistence, review queue, and action execution boundaries already exist. Speech and image should follow after OCR source hydration is proven.
