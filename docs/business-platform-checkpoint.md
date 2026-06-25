# Frontier Business Platform Checkpoint

Current checkpoint after the Speech activation sprint. Latest prior pushed commit before this sprint was `1031d4d`; current database migration work adds `0030_speech_transcript_lifecycle.sql`.

## Completed Platform Areas

- Supabase auth, workspaces, RLS, platform admin, audit logs, and server-side action routes are established.
- Core records are Supabase-first for signed-in users with local fallback preserved.
- Client portal invite/linking, scoped jobs, scoped invoices, scoped estimates, scoped documents, revocation, and query-boundary validation are complete.
- Client estimate approval/rejection is complete.
- Estimate-to-invoice conversion is complete and duplicate conversion is guarded.
- Stripe test subscriptions are operational.
- Stripe invoice checkout, webhook payment sync, invoice paid status, receipts, and payment history are complete.
- Employee portal assignment foundation is complete.
- Employee portal read-only assigned jobs, materials, photos, profile, and assignment history are available.

## Current Sprint Additions

- Internal estimate list at `/estimates` with search, status filtering, summary metrics, conversion visibility, and estimate detail navigation.
- Contractor invoice list now includes search, status filtering, paid revenue, outstanding balance, overdue count, and paid/unpaid indicators.
- Client portal estimate links stay inside the client portal.
- Client portal profile placeholder added.
- Employee assignment management added under Settings > Employees.
- Employee profile and assignment history page added.
- Dashboard summaries now surface active jobs, paid revenue, unpaid invoices, overdue invoices, scheduled jobs, inventory alerts, and expense totals.
- Operations messaging foundation added:
  - `workspace_conversations`
  - `workspace_messages`
  - client portal message UI
  - client message notifications
- Notification foundation added:
  - `workspace_notifications`
  - unread/archive-ready API
  - notification event placeholders for client messages and employee updates
- Employee productivity foundation added:
  - `employee_job_updates`
  - progress updates
  - completion notes
  - completion percentage
  - material usage fields
  - assigned-job update submission from the employee portal
- Dashboard operations activity added:
  - recent customer messages
  - recent employee updates
  - recent payment activity
  - estimate pipeline summary
  - invoice aging summary
- Owner/Manager preview access added for client and employee portal pages without changing external client scoping.
- Collaboration completion additions:
  - workspace-side message center at `/messages`
  - workspace replies to client portal conversations
  - conversation search
  - archive/reopen conversations
  - unread conversation indicators
  - notification bell and inbox at `/notifications`
  - mark read, mark all read, and archive notifications
  - workspace activity page at `/activity`
  - client portal activity page
  - employee portal messages and activity pages
- AI Review substrate completion:
  - Review Queue dashboard metrics
  - review draft filters, search, and sorting
  - status, source, confidence, and execution badges
  - source attribution placeholders for OCR, transcript, and image sources
  - validation warning summaries
  - review history timestamps
  - duplicate draft action
  - archive draft status
  - audit-event table and lifecycle trigger
  - edit modal audit trail
  - OCR Activation Checklist handoff document
- OCR activation:
  - document OCR route records queued, processing, needs review, reviewed, failed, retry count, timestamps, and error text
  - OCR worker output persists extracted text and structured metadata on the source document
  - successful OCR creates a linked review draft when document interpretation succeeds
  - source document stores the linked review draft ID
  - Review Queue hydrates OCR source text and source OCR metadata from the document record
- Speech activation:
  - speech transcriptions persist to `speech_transcripts`
  - transcription lifecycle records queued, processing, completed, failed, retry count, timestamps, and error text
  - uploaded audio and microphone recordings can create linked transcript review drafts
  - voice assistant transcription persists source text without creating duplicate automatic review drafts
  - Review Queue hydrates transcript source text and source speech metadata

## Frozen Systems

The following systems are intentionally not part of this business-platform sprint:

- Image analysis
- Logistics optimization and routing engine
- Upload expansion
- Time tracking
- Public company search

## Current Security Boundary

- Client portal data resolves workspace/client scope from active `client_portal_access`.
- Owner/Manager client portal preview is workspace-scoped and read-only for portal data inspection.
- Employee portal data resolves employee workspace access from active Employee workspace membership.
- Owner/Manager employee portal preview is workspace-scoped for operations review.
- Employee job visibility is restricted to `employee_job_assignments`.
- Employee update writes verify active Employee role and assigned job before accepting a field update.
- Workspace message replies require Owner or Manager role.
- Notification inbox requires active workspace membership.
- Payment state remains server-authoritative through Stripe webhook processing.
- Browser actions do not mark invoices paid.
- Review draft execution remains explicit and server-authoritative.
- Archived, rejected, pending, needs-changes, and already-executed AI drafts cannot execute through the normal execution route.
- AI review audit events are workspace-scoped through RLS.
- OCR draft creation does not execute actions.
- OCR source previews are workspace-scoped through the review draft and document workspace relationship.
- Speech draft creation does not execute actions.
- Speech source previews are workspace-scoped through the review draft and transcript workspace relationship.

## Recommended Next Phase

1. Runtime validate speech with one short audio sample in a signed-in workspace.
2. Image activation against the completed Review Queue.
5. Add richer per-record activity timelines on client/job/invoice/estimate detail pages.
6. Add time tracking foundation for employee portal.
7. Portal document/photo upload expansion.
8. Final logistics validation pass.
9. Production launch hardening: secret rotation, Stripe live-mode checklist, billing enforcement, support playbooks.
