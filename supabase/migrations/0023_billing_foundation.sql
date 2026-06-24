create table if not exists public.workspace_billing (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  plan text not null default 'professional'
    check (plan in ('visitor', 'free', 'basic', 'professional', 'business')),
  billing_status text not null default 'Not Configured'
    check (billing_status in ('Not Configured', 'Trialing', 'Active', 'Past Due', 'Canceled', 'Incomplete')),
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_price_id text,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists workspace_billing_set_updated_at
  on public.workspace_billing;
create trigger workspace_billing_set_updated_at
  before update on public.workspace_billing
  for each row execute function public.set_updated_at();

create index if not exists workspace_billing_customer_idx
  on public.workspace_billing (stripe_customer_id);
create index if not exists workspace_billing_subscription_idx
  on public.workspace_billing (stripe_subscription_id);
create index if not exists workspace_billing_status_idx
  on public.workspace_billing (billing_status);

alter table public.workspace_billing enable row level security;

drop policy if exists "Workspace members can read billing status"
  on public.workspace_billing;
create policy "Workspace members can read billing status"
  on public.workspace_billing for select
  using (public.is_workspace_member(workspace_id));

-- Billing writes are intentionally server-side only for now.
-- Future Stripe checkout/webhooks should write through service-role routes.
