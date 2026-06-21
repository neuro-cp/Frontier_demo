# Review Queue

The Review Queue lists persisted AI review drafts for the active workspace.

## Current Scope

- Lists `ai_review_drafts`.
- Shows source type, status, confidence, warnings, and proposed action payloads.
- Allows Owners and Managers to update status.
- Supported statuses: `Pending`, `Approved`, `Rejected`, `Needs Changes`.

## Safety Boundary

Approving a draft does not execute it yet. The UI only updates review draft status. It does not create clients, jobs, invoices, expenses, inventory records, or calendar events.

## Next Step

The approval-to-action sprint should map approved drafts into the shared Frontier action layer behind an explicit final confirmation.
