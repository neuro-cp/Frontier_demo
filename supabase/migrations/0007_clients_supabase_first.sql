create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  status text not null default 'Active',
  balance_cents integer not null default 0,
  email text,
  phone text,
  address text,
  city text,
  state text,
  zip text,
  notes text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.clients
  add column if not exists workspace_id uuid,
  add column if not exists name text,
  add column if not exists status text not null default 'Active',
  add column if not exists balance_cents integer not null default 0,
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists address text,
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists zip text,
  add column if not exists notes text,
  add column if not exists latitude numeric(10,7),
  add column if not exists longitude numeric(10,7),
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'clients_workspace_id_fkey'
      and conrelid = 'public.clients'::regclass
  ) then
    alter table public.clients
      add constraint clients_workspace_id_fkey
      foreign key (workspace_id)
      references public.workspaces(id)
      on delete cascade;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'clients_status_check'
      and conrelid = 'public.clients'::regclass
  ) then
    alter table public.clients
      add constraint clients_status_check
      check (status in ('Lead', 'Active', 'Inactive'));
  end if;
end $$;

create index if not exists clients_workspace_idx
  on public.clients (workspace_id);

create unique index if not exists clients_workspace_name_uidx
  on public.clients (workspace_id, lower(name));

drop trigger if exists clients_set_updated_at on public.clients;
create trigger clients_set_updated_at
  before update on public.clients
  for each row
  execute function public.set_updated_at();

alter table public.clients enable row level security;

drop policy if exists "Workspace members can read clients" on public.clients;
create policy "Workspace members can read clients"
  on public.clients for select
  using (public.is_workspace_member(workspace_id));

drop policy if exists "Workspace members can insert clients" on public.clients;
create policy "Workspace members can insert clients"
  on public.clients for insert
  with check (public.is_workspace_member(workspace_id));

drop policy if exists "Workspace members can update clients" on public.clients;
create policy "Workspace members can update clients"
  on public.clients for update
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

drop policy if exists "Workspace members can delete clients" on public.clients;
create policy "Workspace members can delete clients"
  on public.clients for delete
  using (public.is_workspace_member(workspace_id));
