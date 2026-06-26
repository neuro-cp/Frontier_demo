# Security Hardening Checklist

Use this before beta and again before public launch.

## Authentication

- Review session expiration behavior.
- Confirm password reset and email confirmation behavior in production.
- Verify cookie settings on Vercel.
- Decide whether MFA is required for platform admins.

## Authorization

- Re-run RLS audit for all workspace-scoped tables.
- Verify every server route checks authenticated user and workspace access.
- Verify client portal routes resolve scope from active `client_portal_access`.
- Verify employee portal routes resolve scope from active Employee membership and assignments.
- Verify platform admin routes never grant normal workspace authority.
- Verify AI execution routes reject pending, rejected, needs-changes, archived, and already executed drafts.

## Secrets

- Rotate temporary keys before launch.
- Confirm no `.env.local` values were committed.
- Verify Vercel environment variables by name only.
- Verify Supabase, Stripe, worker, OpenRouter/OpenAI, Google, and Cloudflare credentials are separate per environment.

## Payments

- Verify Stripe webhook signature validation.
- Confirm browser requests cannot mark invoices paid.
- Confirm duplicate payment attempts are blocked server-side.
- Confirm test mode is not confused with live mode.

## AI, OCR, Speech, Image

- Enforce server-only provider calls.
- Enforce quota and entitlement checks.
- Confirm worker shared secrets are not exposed to the browser.
- Add timeout and retry limits where missing.
- Confirm no AI draft executes automatically.
- Run provider outage and worker outage drills.

## Data Integrity

- Review foreign keys and delete behavior.
- Confirm workspace deletion behavior is explicit and guarded.
- Confirm converted estimates cannot generate duplicate invoices.
- Confirm revoked portal access takes effect immediately.
- Confirm archived conversations/notifications remain recoverable where intended.

## Observability

- Add production-safe logging for failed payments, failed worker calls, failed AI provider calls, and denied authorization attempts.
- Avoid logging secrets, raw tokens, or sensitive customer content.
- Add operational checks for queue failures and stuck processing states.

## Beta Exit Criteria

- Full workflow QA passes on desktop and mobile.
- Portal access boundaries pass with two real users.
- Stripe test-to-live checklist is complete.
- Worker/provider failure tests degrade gracefully.
- All known temporary secrets are rotated.
