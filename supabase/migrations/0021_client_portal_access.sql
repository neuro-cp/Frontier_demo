create table if not exists public.client_portal_access (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  status text not null default 'Invited',
  invite_token_hash text,
  invite_expires_at timestamptz,
  accepted_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint client_portal_access_status_check
    check (status in ('Invited', 'Active', 'Revoked', 'Expired')),
  constraint client_portal_access_email_lower_check
    check (email = lower(email))
);

create index if not exists client_portal_access_workspace_idx
  on public.client_portal_access (workspace_id);
create index if not exists client_portal_access_client_idx
  on public.client_portal_access (client_id);
create index if not exists client_portal_access_user_idx
  on public.client_portal_access (user_id);
create index if not exists client_portal_access_email_idx
  on public.client_portal_access (email);
create index if not exists client_portal_access_invite_token_hash_idx
  on public.client_portal_access (invite_token_hash);

drop trigger if exists client_portal_access_set_updated_at on public.client_portal_access;
create trigger client_portal_access_set_updated_at
  before update on public.client_portal_access
  for each row execute function public.set_updated_at();

alter table public.client_portal_access enable row level security;

drop policy if exists "Workspace managers can read client portal access" on public.client_portal_access;
create policy "Workspace managers can read client portal access"
  on public.client_portal_access for select
  using (public.has_workspace_role(workspace_id, array['Owner', 'Manager']));

drop policy if exists "Workspace managers can create client portal access" on public.client_portal_access;
create policy "Workspace managers can create client portal access"
  on public.client_portal_access for insert
  with check (public.has_workspace_role(workspace_id, array['Owner', 'Manager']));

drop policy if exists "Workspace managers can update client portal access" on public.client_portal_access;
create policy "Workspace managers can update client portal access"
  on public.client_portal_access for update
  using (public.has_workspace_role(workspace_id, array['Owner', 'Manager']))
  with check (public.has_workspace_role(workspace_id, array['Owner', 'Manager']));

drop policy if exists "Linked client users can read own active access" on public.client_portal_access;
create policy "Linked client users can read own active access"
  on public.client_portal_access for select
  using (user_id = auth.uid() and status = 'Active');
