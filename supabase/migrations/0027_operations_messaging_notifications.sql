create table if not exists public.workspace_conversations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  title text not null,
  status text not null default 'Open'
    check (status in ('Open', 'Archived')),
  channel text not null default 'Client Portal'
    check (channel in ('Client Portal', 'Internal')),
  last_message_at timestamptz,
  archived_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_messages (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  conversation_id uuid not null references public.workspace_conversations(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  sender_user_id uuid references auth.users(id) on delete set null,
  sender_type text not null
    check (sender_type in ('Client', 'Workspace', 'Employee', 'System')),
  body text not null,
  is_internal boolean not null default false,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_notifications (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  entity_type text,
  entity_id uuid,
  read_at timestamptz,
  archived_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.employee_job_updates (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  employee_user_id uuid not null references auth.users(id) on delete cascade,
  update_type text not null default 'Progress'
    check (update_type in ('Progress', 'Completion', 'Material Usage', 'Note')),
  body text not null,
  completion_percent integer check (completion_percent is null or (completion_percent >= 0 and completion_percent <= 100)),
  material_name text,
  material_quantity numeric,
  status text not null default 'Submitted'
    check (status in ('Submitted', 'Reviewed', 'Archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists workspace_conversations_set_updated_at on public.workspace_conversations;
create trigger workspace_conversations_set_updated_at
  before update on public.workspace_conversations
  for each row execute function public.set_updated_at();

drop trigger if exists workspace_messages_set_updated_at on public.workspace_messages;
create trigger workspace_messages_set_updated_at
  before update on public.workspace_messages
  for each row execute function public.set_updated_at();

drop trigger if exists workspace_notifications_set_updated_at on public.workspace_notifications;
create trigger workspace_notifications_set_updated_at
  before update on public.workspace_notifications
  for each row execute function public.set_updated_at();

drop trigger if exists employee_job_updates_set_updated_at on public.employee_job_updates;
create trigger employee_job_updates_set_updated_at
  before update on public.employee_job_updates
  for each row execute function public.set_updated_at();

create index if not exists workspace_conversations_workspace_idx
  on public.workspace_conversations (workspace_id);
create index if not exists workspace_conversations_client_idx
  on public.workspace_conversations (client_id);
create index if not exists workspace_conversations_status_idx
  on public.workspace_conversations (status);

create index if not exists workspace_messages_workspace_idx
  on public.workspace_messages (workspace_id);
create index if not exists workspace_messages_conversation_idx
  on public.workspace_messages (conversation_id);
create index if not exists workspace_messages_client_idx
  on public.workspace_messages (client_id);
create index if not exists workspace_messages_created_idx
  on public.workspace_messages (created_at);

create index if not exists workspace_notifications_workspace_idx
  on public.workspace_notifications (workspace_id);
create index if not exists workspace_notifications_user_idx
  on public.workspace_notifications (user_id);
create index if not exists workspace_notifications_type_idx
  on public.workspace_notifications (type);
create index if not exists workspace_notifications_unread_idx
  on public.workspace_notifications (workspace_id, user_id)
  where read_at is null and archived_at is null;

create index if not exists employee_job_updates_workspace_idx
  on public.employee_job_updates (workspace_id);
create index if not exists employee_job_updates_job_idx
  on public.employee_job_updates (job_id);
create index if not exists employee_job_updates_employee_idx
  on public.employee_job_updates (employee_user_id);

alter table public.workspace_conversations enable row level security;
alter table public.workspace_messages enable row level security;
alter table public.workspace_notifications enable row level security;
alter table public.employee_job_updates enable row level security;

drop policy if exists "Workspace members can read conversations" on public.workspace_conversations;
create policy "Workspace members can read conversations"
  on public.workspace_conversations for select
  using (public.has_workspace_role(workspace_id, array['Owner', 'Manager', 'Employee']));

drop policy if exists "Workspace managers can manage conversations" on public.workspace_conversations;
create policy "Workspace managers can manage conversations"
  on public.workspace_conversations for all
  using (public.has_workspace_role(workspace_id, array['Owner', 'Manager']))
  with check (public.has_workspace_role(workspace_id, array['Owner', 'Manager']));

drop policy if exists "Workspace members can read messages" on public.workspace_messages;
create policy "Workspace members can read messages"
  on public.workspace_messages for select
  using (public.has_workspace_role(workspace_id, array['Owner', 'Manager', 'Employee']));

drop policy if exists "Workspace members can write messages" on public.workspace_messages;
create policy "Workspace members can write messages"
  on public.workspace_messages for insert
  with check (public.has_workspace_role(workspace_id, array['Owner', 'Manager', 'Employee']));

drop policy if exists "Workspace members can read notifications" on public.workspace_notifications;
create policy "Workspace members can read notifications"
  on public.workspace_notifications for select
  using (public.has_workspace_role(workspace_id, array['Owner', 'Manager', 'Employee']) or user_id = auth.uid());

drop policy if exists "Workspace managers can manage notifications" on public.workspace_notifications;
create policy "Workspace managers can manage notifications"
  on public.workspace_notifications for all
  using (public.has_workspace_role(workspace_id, array['Owner', 'Manager']))
  with check (public.has_workspace_role(workspace_id, array['Owner', 'Manager']));

drop policy if exists "Employees can read own job updates" on public.employee_job_updates;
create policy "Employees can read own job updates"
  on public.employee_job_updates for select
  using (
    employee_user_id = auth.uid()
    or public.has_workspace_role(workspace_id, array['Owner', 'Manager'])
  );

drop policy if exists "Employees can create own job updates" on public.employee_job_updates;
create policy "Employees can create own job updates"
  on public.employee_job_updates for insert
  with check (
    employee_user_id = auth.uid()
    and public.has_workspace_role(workspace_id, array['Employee'])
  );

drop policy if exists "Managers can manage employee job updates" on public.employee_job_updates;
create policy "Managers can manage employee job updates"
  on public.employee_job_updates for update
  using (public.has_workspace_role(workspace_id, array['Owner', 'Manager']))
  with check (public.has_workspace_role(workspace_id, array['Owner', 'Manager']));
