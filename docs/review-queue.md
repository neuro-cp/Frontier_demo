# Review Queue

The Review Queue is the human review layer between AI interpretation and Frontier business actions.

## Current Scope

- Lists `ai_review_drafts` for the active workspace.
- Shows status, source type, confidence, warnings, action payloads, execution state, source attribution, and validation categories.
- Provides dashboard metrics for pending, approved, rejected, archived, executed, average confidence, source counts, and recent review activity.
- Supports filtering, search, and sorting.
- Supports `Pending`, `Approved`, `Rejected`, `Needs Changes`, and `Archived`.
- Allows Owners and Managers to approve, reject, mark needs changes, edit, duplicate, archive, and explicitly execute approved drafts.
- Displays revision history and audit events when editing a draft.

## Safety Boundary

No draft executes automatically.

Execution requires:

1. Draft status is `Approved`.
2. User clicks `Execute Approved Draft`.
3. Server validates workspace membership, permissions, draft status, action type, and payload.
4. Server executes allowed non-destructive actions through the shared action layer.

Rejected, pending, needs-changes, archived, already-executed, and unsupported drafts do not execute.

## Audit Boundary

`ai_review_draft_audit_events` records lifecycle events:

- `created`
- `edited`
- `approved`
- `rejected`
- `needs_changes`
- `archived`
- `executed`
- `execution_failed`
- `duplicated`

Revision rows preserve prior title, summary, warnings, and action payloads when draft content changes.

## Intake Boundary

- OCR is activated for PDF documents through the document workflow.
- OCR source text is hydrated into the Review Queue when a draft is linked to a document.
- Speech is activated for uploaded audio and microphone recordings through the Review Queue audio intake.
- Transcript source text is hydrated into the Review Queue when a draft is linked to a persisted transcript.
- Image analysis is activated for stored image documents and Review Queue image intake.
- Image source summaries and provider metadata are hydrated into the Review Queue when a draft is linked to a document.
- Logistics remains frozen.
- The Review Queue still does not process files or call workers directly.
- Secure image preview, upload timestamp, uploader, and richer attachment preview hydration remain placeholders.

## Next Step

Complete final OCR/speech/image quality validation, then move to logistics activation and security hardening.
