# Schema Drift Report

Generated: 2026-06-17

## Scope

This audit compares the live Supabase public application schema against:

- `supabase/migrations/0001_frontier_foundation.sql`
- `supabase/migrations/0002_workspace_member_invites.sql`

The generated snapshot is stored at `supabase/schema-current.sql`.

## Summary

App schema drift: No

Platform extension drift: Yes

Risk level: Low

## Tables Found

- `ai_jobs`
- `client_activity`
- `client_calendar_events`
- `client_notes`
- `clients`
- `document_tag_links`
- `document_tags`
- `documents`
- `estimate_line_items`
- `estimates`
- `expenses`
- `inventory_items`
- `invoice_line_items`
- `invoice_payments`
- `invoices`
- `job_activity`
- `job_materials`
- `jobs`
- `profiles`
- `route_plan_stops`
- `route_plans`
- `workspace_members`
- `workspace_settings`
- `workspaces`

## Drift Findings

Tables missing from migrations: None

Schema drift: None found in the public application tables, columns, defaults, primary keys, foreign keys, unique constraints, check constraints, functions, triggers, or standalone indexes.

Policy drift: None found. The live invite insert policy from Task 39 is represented by `0002_workspace_member_invites.sql`.

Trigger drift: None found.

Index drift: None found for standalone app indexes. Primary key and unique-constraint backing indexes are represented through constraints in the schema snapshot.

Extension drift: The live Supabase database includes platform/default extensions that are not all declared in app migrations:

- `pg_stat_statements`
- `plpgsql`
- `supabase_vault`
- `uuid-ossp`

`pgcrypto` is declared by app migration history and exists live under Supabase's `extensions` schema.

## Recommended Corrective Action

No corrective app migration is recommended.

The extension differences are Supabase platform-managed state, not Frontier application schema drift. Keep `schema-current.sql` as an audit snapshot. If Frontier ever needs a standalone non-Supabase Postgres rebuild, add a separate platform bootstrap script or document the required extensions explicitly for that environment.

## Rebuild Confidence

High for rebuilding the Frontier public application schema on Supabase from the existing migrations.

Not fully standalone outside Supabase without platform setup, because the app schema references Supabase-managed objects such as `auth.users` and relies on Supabase-managed extension/schema conventions.
