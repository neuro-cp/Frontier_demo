# Frontier Business Platform Checkpoint

Current checkpoint after commit `2b8997d` and migration `0026_invoice_payment_stripe_metadata.sql`.

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

## Frozen Systems

The following systems are intentionally not part of this business-platform sprint:

- OCR
- AI interpretation
- Speech worker
- Image analysis
- Logistics optimization and routing engine
- Messaging
- Upload expansion
- Time tracking
- Public company search

## Current Security Boundary

- Client portal data resolves workspace/client scope from active `client_portal_access`.
- Employee portal data resolves employee workspace access from active Employee workspace membership.
- Employee job visibility is restricted to `employee_job_assignments`.
- Payment state remains server-authoritative through Stripe webhook processing.
- Browser actions do not mark invoices paid.

## Recommended Next Phase

1. Runtime QA for the new internal estimate list, invoice filters, and employee assignment settings.
2. Messaging foundation for client portal and employee portal.
3. Time tracking foundation for employee portal.
4. Portal document/photo upload expansion.
5. Final OCR/speech/image/logistics validation pass.
6. Production launch hardening: secret rotation, Stripe live-mode checklist, billing enforcement, support playbooks.
