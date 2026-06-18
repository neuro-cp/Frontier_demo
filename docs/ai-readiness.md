# AI Readiness

Frontier is structurally ready for AI orchestration, but no external AI calls are wired yet.

## Current Foundation

- `public.ai_jobs` tracks future document, voice, logistics, invoice, and client parsing work.
- Future job types include `document_ocr`, `document_extraction`, `voice_command`, `logistics_plan`, `invoice_parse`, and `client_parse`.
- Action wrappers exist for clients, jobs, invoices, inventory, documents, routes, and calendar events.
- Workspace RLS applies to AI job rows.

## Required Next Step

Add a server-side job runner that claims queued jobs, calls the selected provider, writes results, and sends extracted data to human review.

AI should not write business records directly without review.
