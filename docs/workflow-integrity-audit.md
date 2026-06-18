# Workflow Integrity Audit

## Security Review

Workspace-owned application tables use RLS through `public.is_workspace_member(workspace_id)`. This gives basic tenant isolation for clients, jobs, invoices, inventory, documents, route plans, and calendar events.

Platform admin access is separate from workspace ownership through `public.platform_admins` and `public.is_platform_admin()`. Admin APIs use server-only service-role access and verify platform admin status before returning cross-tenant data.

Storage hardening added in `0009_document_storage_policies.sql` keeps `workspace-documents` private and scopes object access by the first path segment.

## Remaining Security Concerns

- Most workspace tables still grant broad workspace-member CRUD. Owner/Manager/Employee role enforcement should be tightened in RLS or server actions.
- Document file preview/download routes are not implemented yet.
- Settings are still partly localStorage-backed.
- Admin inspection should eventually include explicit support reason/consent metadata.

## Multi-Step Write Risks

- Invoice save: creates/updates invoice, then replaces line items. A line item failure can leave invoice header changes committed.
- Job save: creates/updates job, then replaces job materials. A material failure can leave job header changes committed.
- Workspace creation: creates workspace, membership, then settings from the browser. A later failure can leave partial workspace setup.
- Route creation: creates route plan, then route stops. A stop failure can leave an incomplete route plan.

## Recommended Fix

Move multi-step writes into Postgres RPC functions or server actions that perform the full operation transactionally. The current repository layer should remain as the UI adapter, but the actual grouped writes should become atomic before production launch.
