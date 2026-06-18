# Permissions Hardening

## Current State

Workspace isolation is based on active `workspace_members` rows through `public.is_workspace_member(workspace_id)`.

Platform admin access is separate through `public.platform_admins` and server-only admin routes.

## Safe Today

- Normal users cannot access admin data unless `public.is_platform_admin()` passes.
- Business records are workspace-scoped.
- Storage objects are scoped by workspace path prefix.

## Broad Permissions Remaining

Most workspace tables still allow any active workspace member to create, update, and delete records.

Tables needing role-specific policy refinement include clients, jobs, invoices, inventory, documents, route plans, and workspace settings.

## Recommended Role Rules

- Owner: full workspace control.
- Manager: operations control, invites, most CRUD.
- Member/Employee: assigned work, uploads, limited status changes.
- Customer: own records only, no workspace-wide access.
- Platform Admin: support inspection only through audited server routes.
