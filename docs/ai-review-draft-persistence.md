# AI Review Draft Persistence

Frontier stores AI-generated suggestions as review drafts before a human approves anything.

## Flow

```text
OCR extracted text
  -> interpretDocumentWithAI()
  -> ReviewDraft
  -> ai_review_drafts
  -> source document link

Transcript text
  -> interpretTranscriptWithAI()
  -> ReviewDraft
  -> ai_review_drafts
```

## Safety Boundaries

- Review draft creation does not execute actions.
- Review draft creation does not create clients, jobs, invoices, expenses, inventory, or calendar records.
- Delete/destructive action types are excluded by the AI schema and guarded by a database check.
- Review drafts are scoped to a workspace.
- Workspace members can read and create drafts for their workspace.
- Owners and Managers can update draft status for future approval/rejection flows.
- OCR review drafts preserve the originating document ID.
- OCR text preview is hydrated from the source document instead of duplicated into the review draft row.

## Server Routes

- `POST /api/ai/interpret-document`
- `POST /api/ai/interpret-transcript`
- `POST /api/documents/ocr`

All routes require a signed-in user and active workspace membership.

## Current UI

The Review Queue shows pending drafts, warnings, confidence, source OCR text, and proposed actions. Approval and execution remain explicit.

## Approval Mapping

Approved drafts map into the shared Frontier action layer only after user confirmation. No OCR draft executes automatically.
