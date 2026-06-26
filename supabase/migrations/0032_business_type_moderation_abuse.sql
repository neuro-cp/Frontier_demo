create table if not exists public.business_type_suggestions (
  id uuid primary key default gen_random_uuid(),
  normalized_name text not null,
  display_name text not null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  submitted_by uuid references auth.users(id) on delete set null,
  submitted_at timestamptz not null default now(),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint business_type_suggestions_normalized_check check (
    normalized_name = lower(trim(normalized_name)) and length(normalized_name) between 2 and 80
  ),
  constraint business_type_suggestions_display_check check (
    length(trim(display_name)) between 2 and 80
  )
);

create unique index if not exists business_type_suggestions_normalized_idx
  on public.business_type_suggestions (normalized_name);

create index if not exists business_type_suggestions_status_idx
  on public.business_type_suggestions (status, submitted_at desc);

drop trigger if exists business_type_suggestions_set_updated_at on public.business_type_suggestions;
create trigger business_type_suggestions_set_updated_at
  before update on public.business_type_suggestions
  for each row execute function public.set_updated_at();

alter table public.business_type_suggestions enable row level security;

drop policy if exists business_type_suggestions_approved_read on public.business_type_suggestions;
create policy business_type_suggestions_approved_read
  on public.business_type_suggestions for select
  using (status = 'approved' or public.is_platform_admin());

drop policy if exists business_type_suggestions_user_insert on public.business_type_suggestions;
create policy business_type_suggestions_user_insert
  on public.business_type_suggestions for insert
  with check (auth.uid() = submitted_by);

drop policy if exists business_type_suggestions_admin_update on public.business_type_suggestions;
create policy business_type_suggestions_admin_update
  on public.business_type_suggestions for update
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create table if not exists public.ai_abuse_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  source text not null,
  severity integer not null check (severity >= 0 and severity <= 100),
  reason text not null,
  prompt_excerpt text,
  prompt_hash text,
  status text not null default 'flagged'
    check (status in ('flagged', 'reviewed', 'dismissed', 'restricted')),
  created_at timestamptz not null default now(),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz
);

create index if not exists ai_abuse_events_workspace_idx
  on public.ai_abuse_events (workspace_id, created_at desc);

create index if not exists ai_abuse_events_user_idx
  on public.ai_abuse_events (user_id, created_at desc);

alter table public.ai_abuse_events enable row level security;

drop policy if exists ai_abuse_events_platform_admin_read on public.ai_abuse_events;
create policy ai_abuse_events_platform_admin_read
  on public.ai_abuse_events for select
  using (public.is_platform_admin());

drop policy if exists ai_abuse_events_platform_admin_update on public.ai_abuse_events;
create policy ai_abuse_events_platform_admin_update
  on public.ai_abuse_events for update
  using (public.is_platform_admin())
  with check (public.is_platform_admin());
