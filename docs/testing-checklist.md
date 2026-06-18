# Frontier Testing Checklist

## Auth

- Create account from `/signup`.
- Confirm the submit button says `Creating account...`.
- Sign in from `/login`.
- Confirm the submit button says `Signing in...`.
- Request reset from `/reset-password`.
- Confirm the submit button says `Sending reset email...`.
- Confirm errors appear as readable text, never raw `{}`.

## Local Fallback

- Sign out.
- Confirm Local Workspace is available.
- Confirm local clients/jobs/invoices still render from localStorage.

## Platform Admin

- Sign in as a user in `public.platform_admins`.
- Open `/frontier-admin`.
- Confirm aggregate cards load.
- Search by email.
- Search by auth user id.
- Search by workspace name or business name.
- Select a user and inspect workspaces.
- Inspect a workspace.
- Confirm read-only sections appear:
  - members
  - clients
  - jobs
  - invoices
  - inventory
  - documents metadata
  - route plans
- Load audit logs.
- Confirm non-admin users receive Access Denied or 403.

## Admin View Mode

- From `/frontier-admin`, click `View As` for a workspace.
- Confirm the app navigates to `/dashboard`.
- Confirm AppShell shows `Admin View Mode`.
- Click `Back to Admin`.
- Click `Exit Admin View`.
- Confirm normal workspace switching still works.

## Documents

- Open Documents.
- Create a metadata-only document.
- Confirm status text shows metadata/storage status.
- Confirm admin console shows document metadata only.
- Confirm no private file contents are exposed.

## Logistics

- Open Logistics with no clients.
- Confirm the map still renders.
- Add/select client locations where available.
- Confirm Google Maps route export is only enabled with at least two stops.

## Known Limits

- Admin console is read-only.
- No destructive support tools yet.
- No full document file upload/download/preview yet.
- OCR and AI extraction are not implemented yet.
- Voice/intake parser is intentionally deferred.
