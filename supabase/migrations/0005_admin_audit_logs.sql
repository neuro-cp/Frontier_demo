create table public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references auth.users(id) on delete cascade,
  target_user_id uuid references auth.users(id) on delete set null,
  target_workspace_id uuid references public.workspaces(id) on delete set null,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index admin_audit_logs_admin_user_idx
  on public.admin_audit_logs (admin_user_id);
create index admin_audit_logs_target_user_idx
  on public.admin_audit_logs (target_user_id);
create index admin_audit_logs_target_workspace_idx
  on public.admin_audit_logs (target_workspace_id);
create index admin_audit_logs_action_created_idx
  on public.admin_audit_logs (action, created_at desc);

alter table public.admin_audit_logs enable row level security;

create policy "Platform admins can read admin audit logs"
  on public.admin_audit_logs for select
  using (public.is_platform_admin());
