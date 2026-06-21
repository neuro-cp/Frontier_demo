# Frontier Action Layer

## Purpose

The action layer is the shared business mutation boundary for Frontier. GUI screens, future voice commands, OCR review flows, AI review flows, customer portals, employee portals, server routes, and automation should call these actions instead of duplicating create/update/delete logic in page components.

Actions are intentionally thin. They validate required business fields, call the existing repository method, normalize readable errors, and preserve the current signed-in/signed-out split.

## Flow

Signed-out mode:

1. UI or workflow calls an action.
2. The action validates required fields.
3. The repository writes to localStorage through the existing local fallback.

Signed-in mode:

1. UI or workflow calls an action.
2. The action validates required fields.
3. The repository uses the existing Supabase/server-route path.
4. RLS remains enforced for browser-safe reads and updates; signed-in creates that require elevated validation continue through server routes.

## Available Actions

Clients:

- `createClientAction`
- `updateClientAction`
- `deleteClientAction`

Jobs:

- `createJobAction`
- `updateJobAction`
- `deleteJobAction`

Invoices:

- `createInvoiceAction`
- `updateInvoiceAction`
- `deleteInvoiceAction`
- `markInvoicePaid`

Inventory:

- `createInventoryItemAction`
- `updateInventoryItemAction`
- `deleteInventoryItemAction`

Expenses:

- `createExpenseAction`
- `updateExpenseAction`
- `deleteExpenseAction`

Documents:

- `createDocumentAction`
- `updateDocumentAction`
- `deleteDocumentAction`

Calendar:

- `createCalendarEventAction`
- `updateCalendarEventAction`
- `deleteCalendarEventAction`

Routes:

- `createRoutePlanAction`
- `updateRoutePlanAction`
- `deleteRoutePlanAction`

Workspaces:

- `createWorkspaceAction`
- `updateWorkspaceAction`
- `deleteWorkspaceAction`

Compatibility aliases without the `Action` suffix remain exported for older imports.

## Current Consumers

The main UI mutation surfaces now route through shared actions for clients, jobs, invoices, inventory, documents, calendar events, route plans, and workspace create/delete.

The repository layer remains responsible for choosing localStorage fallback vs Supabase-backed persistence.

## Mutation Inventory

| Area | UI entry point | Shared action | Repository | Signed-in path | Signed-out path |
| --- | --- | --- | --- | --- | --- |
| Clients | `app/clients/page.tsx`, invoice builder client upsert | `createClientAction`, `updateClientAction`, `deleteClientAction` | `lib/db/clients.ts` | Create/update/delete through server routes | localStorage client helpers |
| Jobs | `app/jobs/page.tsx`, `app/jobs/[id]/page.tsx` | `createJobAction`, `updateJobAction`, `deleteJobAction` | `lib/db/jobs.ts` | Create/update/delete through server routes; material replacement uses the same server mutation path | localStorage jobs |
| Invoices | `app/invoices/page.tsx`, `app/invoices/[id]/page.tsx`, `app/invoices/new/build/page.tsx`, `app/financials/page.tsx` | `createInvoiceAction`, `updateInvoiceAction`, `deleteInvoiceAction` | `lib/db/invoices.ts` | Create/update/delete through server routes | localStorage invoices |
| Inventory | `app/inventory/page.tsx` | `createInventoryItemAction`, `updateInventoryItemAction`, `deleteInventoryItemAction` | `lib/db/inventory.ts` | Create/update/delete through server routes | localStorage inventory |
| Expenses | `app/financials/page.tsx` | `createExpenseAction`, `updateExpenseAction`, `deleteExpenseAction` | `lib/db/expenses.ts` | Create/update/delete through server routes | localStorage expenses |
| Documents | `app/documents/page.tsx`, `app/documents/DocumentAttachments.tsx` | `createDocumentAction`, `updateDocumentAction`, `deleteDocumentAction` | `lib/db/documents.ts` | Metadata create/update/delete through server routes; file storage remains separate | localStorage document metadata |
| Calendar | `app/calendar/page.tsx` | `createCalendarEventAction` | `lib/db/calendarEvents.ts` | Create/update/delete through server routes; update/delete available in repository/action but not exposed broadly in UI | localStorage calendar events |
| Routes | `app/logistics/page.tsx` | `createRoutePlanAction` | `lib/db/routes.ts` | Create/update/delete through server routes; update/delete available in repository/action but not exposed broadly in UI | route persistence is signed-in focused today |
| Workspaces | `components/AppShell.tsx`, `app/settings/page.tsx` | `createWorkspaceAction`, `deleteWorkspaceAction` | `components/WorkspaceContext.tsx` | Create/delete through workspace context server routes | local workspace state |
| Settings | `app/settings/page.tsx`, settings subpanels | Not fully centralized | local settings state and targeted Supabase settings where implemented | Mixed | localStorage settings |

## Human Review Rule

AI and OCR workflows must remain human-review-first. They may prepare draft document extraction data, suggested records, or command payloads, but they must not directly create clients, jobs, invoices, expenses, calendar events, route plans, or documents without explicit user approval.

## Remaining Hotspots

- Document upload/delete is still a two-resource operation: storage object plus metadata row. Metadata writes are server-routed, but browser storage upload/delete still needs real workflow QA.
- Settings persistence is still mixed local-only and DB-backed depending on setting type.

## Next Sprint

Document Workflow QA:

- Verify upload/download/delete in a real browser environment that supports file upload.
- Validate storage object cleanup when metadata creation fails.
- Validate metadata cleanup when storage deletion fails.
- Verify OCR review persistence after real uploaded files exist.
