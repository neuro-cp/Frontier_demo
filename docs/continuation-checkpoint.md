# Continuation Checkpoint

Latest baseline before this launch-prep pass:

- Latest pushed commit before this work: `282140d Complete unified AI ingestion layer`
- Supabase migrations applied through `0031_document_image_lifecycle.sql`
- Production deployment was ready before this pass.

Current completed subsystems:

- Core business platform: clients, jobs, estimates, invoices, inventory, calendar, dashboard, financials.
- Billing and payments: Stripe subscriptions, invoice checkout, webhook synchronization, receipts, payment history.
- Client portal: invite/linking, scoped jobs/invoices/estimates/documents, estimate approval/rejection, invoice payment.
- Employee portal: assignment foundation, scoped jobs/materials/photos/routes placeholders/updates.
- Collaboration: conversations, messages, notifications, activity feeds.
- AI review: unified Review Queue, draft editing, archive/audit, explicit approve and execute.
- AI ingestion: OCR, speech, and image intake feed Review Queue; no autonomous execution.
- Logistics: nearest-neighbor route optimization, provider fallback structure, route save/load foundation, Google Maps export.

Launch-prep hardening completed in this pass:

- Generic app mutation routes now require Owner or Manager role before service-role writes.
- Generic app mutation routes now apply server-side payload allowlists before database writes.
- Document storage upload/download/delete now requires Owner or Manager role.
- OCR, speech, image analysis, enhanced image analysis, document AI interpretation, transcript AI interpretation, voice draft creation, geocoding, route optimization, and matrix lookups now require Owner or Manager role.
- Stripe invoice checkout redirect origin now uses configured `APP_URL` or `NEXT_PUBLIC_APP_URL` instead of the request `Origin` header.
- `.env.example` now includes `APP_URL`.

Validation performed:

- `npm.cmd run lint` passed.
- `npm.cmd run build` passed.

## Pre-QA Finalization Update

Added in this pass:

- Moderated business type suggestions:
  - custom "Other" workspace types are normalized and stored as pending suggestions;
  - platform admins can approve or reject suggestions;
  - approved suggestions populate the workspace creation list for all users.
- Free-plan launch posture:
  - default signed-in plan is now `free`;
  - workspace plan resolution checks `workspace_billing` first;
  - costly features remain capability-gated.
- Operational controls:
  - config-backed kill switches exist for AI, OCR, speech, image analysis, and routing.
- Abuse protection:
  - server-side AI abuse guard blocks obvious destructive, credential-seeking, or prompt-injection requests;
  - events are logged with severity, workspace, user, source, prompt excerpt, prompt hash, and timestamp;
  - severe events restrict future AI use until manual review.
- Signup/onboarding:
  - signup requires acknowledgement;
  - draft Terms, Privacy, and AI Usage pages exist;
  - first-login welcome dialog points users toward workspace creation and can be dismissed permanently in local storage.
- Manual QA preparation:
  - manual QA checklist, bug template, polish template, future ideas template, marketing docs, pricing docs, and test-account workflow docs were added.

Next recommended milestone:

1. Apply migration `0032_business_type_moderation_abuse.sql`.
2. Run manual QA from `docs/manual-qa-checklist.md`.
3. Log bugs separately from polish and future ideas.
4. Fix high-priority bugs before adding new product areas.
- Authenticated app-route smoke passed for:
  - create/delete client
  - create/delete job with materials
  - create/delete invoice with line item
  - create/delete expense
  - create/delete inventory item
  - create/delete calendar event
  - create/delete route plan
  - nearest-neighbor route optimization
  - workspace messaging list/reply/archive/reopen
- Negative permission smoke passed:
  - Employee-role workspace member receives 403 from generic create route.

Known remaining launch items:

- Rotate every temporary key, password, API token, worker secret, Stripe key, Vercel token, Supabase key, AI provider key, Google key, and Cloudflare/R2 key before public launch.
- Complete manual QA on desktop and mobile.
- Perform full portal two-user validation again after any permission changes.
- Run a focused RLS audit after manual QA findings are patched.
- Add worker/provider outage drills.
- Add moderated global business-type suggestions for "Other" workspace creation values.

Recommended next phase:

1. Manual QA workflow pass using a fresh workspace.
2. Capture findings into `bugs.md`, `polish.md`, and `future.md`.
3. Patch high-priority manual QA blockers.
4. Run final security/resilience sweep.
5. Beta readiness checklist and private beta.
