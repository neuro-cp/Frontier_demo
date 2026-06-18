# Permissions Hardening

## Current State

Workspace isolation is based on active `workspace_members` rows through `public.is_workspace_member(workspace_id)`.

Platform admin access is separate through `public.platform_admins` and server-only admin routes.

## Implemented Role Helpers

- `public.has_workspace_role(workspace_id, roles)`
- `public.is_workspace_owner(workspace_id)`
- `public.is_workspace_manager(workspace_id)`

`is_workspace_manager` currently means Owner or Manager.

## Safe Today

- Normal users cannot access admin data unless `public.is_platform_admin()` passes.
- Business records are workspace-scoped.
- Storage objects are scoped by workspace path prefix.
- Workspace deletion is owner-only.
- Business object deletion is limited to Owner/Manager.
- Employee/member users retain non-destructive workspace access.

## Broad Permissions Remaining

Most workspace tables still allow any active workspace member to create and update records.

Tables needing role-specific create/update refinement include clients, jobs, invoices, inventory, documents, route plans, and workspace settings.

## Recommended Role Rules

- Owner: full workspace control.
- Manager: operations control, invites, most CRUD.
- Member/Employee: assigned work, uploads, limited status changes.
- Customer: own records only, no workspace-wide access.
- Platform Admin: support inspection only through audited server routes.

## Future Customer Requirements

- Customers must never receive workspace-wide membership.
- Customer access should be scoped through customer/client relationship tables.
- Customers should only read their own invoices, jobs, documents, and messages.
- Customer uploads should be quarantined or marked as customer-submitted until reviewed.

## Future Employee Requirements

- Employees should read assigned jobs, assigned routes, relevant documents, and their own schedule.
- Employees may upload photos/documents and add notes.
- Employees should not delete business records.
- Employee status updates should be constrained to safe workflow transitions.
