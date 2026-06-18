# Transaction Integrity Audit

## Fixed This Sprint

### Job create/update

- File: `lib/db/jobs.ts`
- Function: `createJob`, `updateJob`
- Previous risk: job header could save, then material replacement could fail.
- Fix: signed-in job saves now use `public.upsert_job_with_materials(job_payload, materials_payload)` from migration `0011_ai_ocr_logistics_readiness.sql`.
- Result: job row and material replacement run inside one Postgres transaction.

### Route plan create/update

- File: `lib/db/routes.ts`
- Function: `createRoute`, `updateRoute`
- Previous risk: route plan could save without all stops.
- Fix: signed-in route saves now use `public.upsert_route_with_stops(route_payload, stops_payload)`.
- Result: route plan and stop replacement run inside one Postgres transaction.

### Invoice create/update

- File: `lib/db/invoices.ts`
- Function: `createInvoice`, `updateInvoice`
- Previous risk: invoice header could save, then line item replacement could partially fail.
- Fix: signed-in invoice saves now use `public.upsert_invoice_with_lines(invoice_payload, line_items_payload)` from migration `0010_transaction_hardening.sql`.
- Result: invoice row and line item replacement run inside one Postgres transaction.

### Workspace creation

- File: `components/WorkspaceContext.tsx`
- Function: `addWorkspace`
- Previous risk: workspace could be created without owner membership or settings.
- Fix: signed-in workspace creation now uses `public.create_workspace_with_owner(...)`.
- Result: workspace, owner membership, and workspace settings are created atomically.

### Document upload

- File: `app/documents/page.tsx`
- Function: `saveUploadPlaceholder`
- Previous risk: storage object could upload, then metadata insert could fail.
- Fix: failed metadata saves now attempt to remove the uploaded storage object.
- Remaining limitation: browser cleanup can still fail due to network interruption after upload.

## Remaining Transaction Risks

### Document delete

- File: `app/documents/page.tsx`, `app/documents/DocumentAttachments.tsx`
- Function: `deleteDocument`
- Risk: object deletion can succeed, then metadata deletion can fail.
- Severity: Medium.
- Recommended fix: server route or RPC-backed metadata deletion with clear retry state.

## Permission Findings

- Workspace isolation is enforced broadly through `public.is_workspace_member(workspace_id)`.
- Platform admin remains separate through `public.platform_admins`.
- Most workspace business tables still allow broad CRUD for any active workspace member.
- Future hardening should distinguish Owner, Manager, Employee, and portal roles.

## Schema Snapshot

`supabase db dump --schema public` remains blocked unless Docker Desktop is running and reachable by the Supabase CLI on Windows.
