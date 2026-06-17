# Frontier Database Plan

This plan prepares Frontier for Supabase/Postgres without changing the current localStorage UI. The migration is intentionally relational, workspace-scoped, and boring: UUID IDs, cents for money, `date` for business dates, `timestamptz` for audit timestamps, and RLS through `workspace_members`.

## Table Purpose

- `profiles`: one row per Supabase auth user.
- `workspaces`: contractor/business workspaces.
- `workspace_members`: user access, roles, invitations, and active membership checks.
- `workspace_settings`: company profile, invoice defaults, tax settings, and workspace notes.
- `clients`: client records, contact info, balance, and geocoded address fields.
- `client_notes`: editable client note history.
- `client_activity`: client timeline events.
- `jobs`: job records linked to clients by ID with a client name snapshot.
- `job_materials`: materials used or estimated for a job.
- `job_activity`: job timeline/history.
- `inventory_items`: workspace inventory levels.
- `estimates` and `estimate_line_items`: estimates that can later convert into invoices.
- `invoices` and `invoice_line_items`: invoice source of truth with company and bill-to snapshots.
- `invoice_payments`: full or partial payment records.
- `expenses`: workspace expense records.
- `documents`: document metadata and attachment links to clients, jobs, invoices, estimates, and expenses.
- `document_tags` and `document_tag_links`: document tagging.
- `client_calendar_events`: client-linked calendar items.
- `route_plans` and `route_plan_stops`: saved logistics routes, ordered stops, distance, duration, and export URL.
- `ai_jobs`: database tracking for AI workflows while workflow logic stays visible in TypeScript.

## Relationship Map

```text
Workspace
  -> Members
  -> Settings
  -> Clients
      -> Client Notes
      -> Client Activity
      -> Jobs
      -> Invoices
      -> Estimates
      -> Documents
      -> Calendar Events
  -> Jobs
      -> Job Materials
      -> Job Activity
      -> Invoices
      -> Estimates
      -> Documents
  -> Estimates
      -> Estimate Line Items
      -> Converted Invoice
  -> Invoices
      -> Invoice Line Items
      -> Invoice Payments
      -> Documents
  -> Expenses
      -> Documents
  -> Documents
      -> Tags
      -> AI Jobs
  -> Route Plans
      -> Route Stops
```

Every business table has `workspace_id`. Relationships use IDs, while invoices and estimates keep snapshots so historical billing records do not mutate when clients or settings change.

## RLS Strategy

RLS is enabled on every app table. Access flows through `workspace_members` using `is_workspace_member(workspace_id)`, which checks for an active membership for `auth.uid()`.

First-pass policies allow active workspace members to select, insert, update, and delete workspace records. Role-specific restrictions for Owner, Manager, and Employee should come later after the app’s permission model is fully designed.

Profiles are owner-scoped. Workspaces can be created by authenticated users, then an initial Owner membership can be inserted for the creating user.

## LocalStorage To Database Migration Order

1. Create authenticated user profile.
2. Create workspace rows from `frontier-workspaces`; create an Owner membership for the current user.
3. Insert workspace settings from `frontier-settings`.
4. Insert clients from `frontier-clients`, converting balances to cents.
5. Insert jobs from `frontier-jobs`, preserving `clientId` and `client` as `client_name_snapshot`.
6. Insert job materials.
7. Insert inventory from `frontier-inventory`.
8. Insert invoices from `frontier-invoices`, preserving company and bill-to snapshots, then insert line items.
9. Insert expenses from `frontier-expenses`.
10. Insert documents from `frontier-documents`; later move file bytes into Supabase Storage and save `storage_bucket` and `storage_path`.
11. Insert client calendar events from `frontier-client-calendar-events`.
12. Start adding new UI against Supabase module by module, leaving localStorage fallback until each module is migrated.

AI workflow code should live in visible TypeScript files under a future `lib/ai/` folder. The `ai_jobs` table should only track workflow status, inputs, outputs, approvals, and errors.
