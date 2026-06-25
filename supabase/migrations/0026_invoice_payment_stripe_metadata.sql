alter table public.invoice_payments
  add column if not exists status text not null default 'Succeeded'
    check (status in ('Pending', 'Succeeded', 'Failed', 'Refunded')),
  add column if not exists stripe_checkout_session_id text,
  add column if not exists stripe_payment_intent_id text,
  add column if not exists stripe_customer_id text,
  add column if not exists paid_by_user_id uuid references auth.users(id) on delete set null;

create unique index if not exists invoice_payments_stripe_session_uidx
  on public.invoice_payments (stripe_checkout_session_id)
  where stripe_checkout_session_id is not null;

create unique index if not exists invoice_payments_stripe_payment_intent_uidx
  on public.invoice_payments (stripe_payment_intent_id)
  where stripe_payment_intent_id is not null;

create index if not exists invoice_payments_status_idx
  on public.invoice_payments (status);
