# AI Review Draft Persistence

Frontier stores AI-generated suggestions as review drafts before a human approves anything.

## Flow

```text
OCR extracted text
  -> interpretDocumentWithAI()
  -> ReviewDraft
  -> ai_review_drafts

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

## Server Routes

- `POST /api/ai/interpret-document`
- `POST /api/ai/interpret-transcript`

Both routes require a signed-in user and active workspace membership.

## Future UI

The Review Queue UI should show pending drafts, warnings, confidence, source text, and proposed actions. Approval should remain explicit.

## Future Approval Mapping

Approved drafts should be mapped into the shared Frontier action layer only after user confirmation. This sprint intentionally does not implement that execution path.
