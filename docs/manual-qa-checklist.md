# Manual QA Checklist

Use a fresh workspace and record every issue in the bug, polish, or future-ideas templates.

## Auth and Account
- Sign up with the required acknowledgement.
- Log in, log out, reset password.
- Confirm the welcome prompt appears once and the "do not show again" option works.

## Workspace
- Create workspace with a listed business type.
- Create workspace with Other business type.
- Verify custom Other value does not appear globally until platform admin approval.
- Switch workspaces.
- Delete only a temporary workspace.

## Core Operations
- Clients: create, edit, view detail, delete.
- Jobs: create, link client, edit, status change, materials, delete.
- Estimates: create, approve/reject in client portal, convert to invoice.
- Invoices: create, edit, duplicate, mark paid/sent/overdue, payment history.
- Payments: Stripe test checkout, success receipt, duplicate payment prevention.
- Calendar: job visibility, day/month navigation.
- Inventory: create, edit, material allocation visibility.

## Documents and AI Intake
- Upload PDF, run OCR, review extracted text, generate review draft.
- Upload audio or use transcript, create review draft.
- Upload image, analyze, review draft.
- Confirm unpaid/free workspaces cannot access costly services unless upgraded.
- Confirm safety blocks obvious malicious prompts and logs review events.

## Review Queue
- Filter, search, sort drafts.
- Edit draft, approve, reject, archive.
- Execute only approved drafts.
- Confirm pending/rejected/archived drafts do not execute.

## Messaging, Notifications, Activity
- Workspace message center loads.
- Client portal messages load.
- Employee portal messages load.
- Reply, unread, archive/reopen where available.
- Notification inbox, mark read, archive.
- Activity timelines for client/job/invoice/estimate/employee.

## Portals
- Client portal access invite, accept, revoke.
- Client sees only linked jobs/invoices/estimates/documents.
- Employee assignment visibility.
- Employee sees only assigned jobs/materials/photos/routes.
- Admin/owner preview paths where intended.

## Logistics
- Route page loads.
- Select multiple stops.
- Cached client coordinates are reused.
- Nearest-neighbor fallback works.
- Provider-missing fallback is readable.
- Saved route load/delete where available.
- Google Maps export link works.

## Settings and Billing
- Business settings persist.
- Billing status loads without exposing secrets.
- Checkout and portal buttons require Owner/Manager.
- Free tier restrictions are clear.

## Mobile and Dark Mode
- Dashboard, clients, jobs, invoices, documents, review queue, portals.
- Buttons do not overflow.
- Text remains readable in dark mode.
