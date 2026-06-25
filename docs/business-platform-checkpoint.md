# Frontier Business Platform Checkpoint

Current checkpoint after the operations platform sprint. Latest prior pushed commit before this sprint was `4549a93`; current database migration work adds `0027_operations_messaging_notifications.sql`.

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

## Frozen Systems

The following systems are intentionally not part of this business-platform sprint:

- OCR
- AI interpretation
- Speech worker
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
- Payment state remains server-authoritative through Stripe webhook processing.
- Browser actions do not mark invoices paid.

## Recommended Next Phase

1. Apply migration `0027_operations_messaging_notifications.sql`.
2. Runtime QA for client messages, notifications, employee updates, and dashboard activity.
3. Add workspace-side conversation reply UI.
4. Add time tracking foundation for employee portal.
5. Portal document/photo upload expansion.
6. Final OCR/speech/image/logistics validation pass.
7. Production launch hardening: secret rotation, Stripe live-mode checklist, billing enforcement, support playbooks.
