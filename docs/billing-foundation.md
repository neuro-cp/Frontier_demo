# Billing Foundation

Frontier now has a minimal billing substrate without changing current feature access.

## Current Behavior

- Existing plan gates still use `FRONTIER_DEFAULT_PLAN`.
- Existing OCR, speech, AI, logistics, and storage checks are unchanged.
- The app continues to work when Stripe variables are missing.
- Billing writes run through server-side routes and Stripe webhooks.

## Database

`workspace_billing` stores one billing row per workspace:

- plan
- billing status
- Stripe customer, subscription, and price identifiers
- subscription period metadata
- cancel-at-period-end state

Workspace members can read their workspace billing status through RLS. Browser-side writes are intentionally not exposed.

## Stripe Environment

Required later:

- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_BASIC`
- `STRIPE_PRICE_PROFESSIONAL`
- `STRIPE_PRICE_BUSINESS`

Price IDs are optional in local test mode. If they are absent, the checkout route creates or reuses flat monthly test prices by stable Stripe lookup key:

- Starter: `frontier_starter_monthly`
- Pro: `frontier_pro_monthly`
- Business: `frontier_business_monthly`

The browser sends only the plan key. It never sends Stripe price IDs.

## Routes

- `GET /api/billing/status`: returns workspace billing state and Stripe readiness.
- `POST /api/billing/checkout`: Owner/Manager only; creates a Stripe Checkout subscription session.
- `POST /api/billing/portal`: Owner/Manager only; creates a Stripe billing portal session for an existing customer.
- `POST /api/billing/webhook`: syncs checkout/subscription events into `workspace_billing` when `STRIPE_WEBHOOK_SECRET` is configured.

## Deferred

- Durable quota accounting
- Enforcing billing status against feature access
