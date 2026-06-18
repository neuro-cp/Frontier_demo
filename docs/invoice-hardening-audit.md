# Invoice Hardening Audit

## Completed

- Existing invoices can be opened from the detail page and edited in the current builder.
- Edited invoices save back to the same invoice id instead of creating a duplicate.
- Duplicate invoice flow creates a new invoice id, invoice number, and line item ids.
- Invoice detail supports Estimate, Draft, Sent, Overdue, and Paid status updates.
- Print output now includes invoice/estimate label, status, subtotal, discount, tax, and total.

## Deferred Payment Rule

Automatically changing a linked job to `Paid` when an invoice is marked `Paid` is intentionally deferred.

Reason: a job can have multiple invoices, partial billing, deposits, change orders, or an invoice that does not represent the full job value. The safe rule needs to be explicit:

- mark job paid only when all linked invoices are paid, or
- mark job paid when one final invoice is paid, or
- ask the user each time.

Recommended next step: add a confirmation prompt or workspace setting before automating job status changes.

## Transaction Risks

Invoice writes are still multi-step:

1. save invoice row
2. delete existing line items
3. insert replacement line items

If step 3 fails, the invoice header may be saved while line items are incomplete. This should become a Postgres RPC or server action transaction before production launch.

## Permission Notes

Invoice RLS is workspace-member scoped. This preserves workspace isolation, but role-level permissions are still broad. Owner/Manager/Employee distinctions should be tightened in a future permission sprint.

## Schema Snapshot Blocker

`supabase db dump --schema public` is still blocked on this Windows machine because the Supabase CLI requires Docker access and Docker Desktop is not available/running for the current shell. The failed dump attempt was reverted, so `supabase/schema-current.sql` was not intentionally refreshed in this sprint.
