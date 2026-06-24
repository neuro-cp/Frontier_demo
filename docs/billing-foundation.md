# Billing Foundation

Frontier now has a minimal billing substrate without changing current feature access.

## Current Behavior

- Existing plan gates still use `FRONTIER_DEFAULT_PLAN`.
- Existing OCR, speech, AI, logistics, and storage checks are unchanged.
- The app continues to work when Stripe variables are missing.
- Billing writes are reserved for server-side routes and future Stripe webhooks.

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

## Deferred

- Checkout session creation
- Customer portal session creation
- Stripe webhooks
- Durable quota accounting
- Enforcing billing status against feature access
