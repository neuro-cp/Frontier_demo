# Frontier Admin Console

The platform admin console lives at `/frontier-admin`.

Platform admin is separate from workspace roles. A workspace `Owner` is not a Frontier platform admin unless that auth user is also present in `public.platform_admins`.

## Access

Admin access is checked through `public.is_platform_admin()`.

Cross-tenant inspection uses server-only API routes under `/api/frontier-admin/*`. These routes verify the signed-in user first, then use `SUPABASE_SERVICE_ROLE_KEY` on the server only.

## Features

- Aggregate system summary cards
- User search by email, auth user id, workspace name, or business name
- User workspace inspection
- Workspace read-only inspection:
  - members
  - clients
  - jobs
  - invoices
  - inventory
  - documents metadata
  - route plans
- Admin view mode
- Recent audit log list

## Audit Logs

The `public.admin_audit_logs` table records:

- `user_search`
- `view_user`
- `view_workspace`
- `enter_admin_view_mode`
- `exit_admin_view_mode`

Only platform admins can read audit logs.

## Admin View Mode

Admin view mode does not replace or fake the auth session. It stores separate local browser state:

- `frontier-admin-view-admin-user-id`
- `frontier-admin-view-user-id`
- `frontier-admin-view-workspace-id`
- `frontier-admin-view-workspace-name`
- `frontier-admin-view-workspace-type`

The AppShell shows an `Admin View Mode` banner with `Back to Admin` and `Exit Admin View`.

## Current Limits

- Read-only only.
- No destructive admin actions.
- No private file preview/download in admin yet.
- No billing or customer portal controls yet.
