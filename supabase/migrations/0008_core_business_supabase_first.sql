create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  client_name_snapshot text,
  name text not null,
  status text not null default 'Lead',
  estimated_value_cents integer not null default 0,
  scheduled_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.job_materials (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  name text not null,
  quantity numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  current_qty numeric,
  target_qty numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  job_id uuid references public.jobs(id) on delete set null,
  invoice_number text not null,
  invoice_date date not null,
  due_date date,
  company_name text,
  company_address text,
  company_city text,
  company_state text,
  company_zip text,
  company_phone text,
  company_email text,
  bill_to_name text,
  bill_to_company text,
  bill_to_address text,
  bill_to_city text,
  bill_to_state text,
  bill_to_zip text,
  bill_to_phone text,
  bill_to_email text,
  discount_type text not null default 'None',
  discount_value numeric not null default 0,
  tax_rate numeric not null default 0,
  footer_message text,
  contact_message text,
  status text not null default 'Draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invoice_line_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  description text not null,
  quantity numeric not null default 1,
  unit_price_cents integer not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.client_calendar_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  client_name_snapshot text,
  title text not null,
  event_date date not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists jobs_workspace_idx on public.jobs (workspace_id);
create index if not exists jobs_client_idx on public.jobs (client_id);
create index if not exists jobs_scheduled_date_idx on public.jobs (scheduled_date);
create index if not exists job_materials_workspace_idx on public.job_materials (workspace_id);
create index if not exists job_materials_job_idx on public.job_materials (job_id);
create index if not exists job_materials_name_idx on public.job_materials (lower(name));
create index if not exists inventory_items_workspace_idx on public.inventory_items (workspace_id);
create unique index if not exists inventory_items_workspace_name_uidx on public.inventory_items (workspace_id, lower(name));
create index if not exists invoices_workspace_idx on public.invoices (workspace_id);
create index if not exists invoices_client_idx on public.invoices (client_id);
create index if not exists invoices_job_idx on public.invoices (job_id);
create index if not exists invoices_date_idx on public.invoices (invoice_date);
create index if not exists invoices_status_idx on public.invoices (status);
create unique index if not exists invoices_workspace_number_uidx on public.invoices (workspace_id, invoice_number);
create index if not exists invoice_line_items_workspace_idx on public.invoice_line_items (workspace_id);
create index if not exists invoice_line_items_invoice_idx on public.invoice_line_items (invoice_id);
create index if not exists client_calendar_events_workspace_idx on public.client_calendar_events (workspace_id);
create index if not exists client_calendar_events_client_idx on public.client_calendar_events (client_id);
create index if not exists client_calendar_events_date_idx on public.client_calendar_events (event_date);

drop trigger if exists jobs_set_updated_at on public.jobs;
create trigger jobs_set_updated_at before update on public.jobs for each row execute function public.set_updated_at();
drop trigger if exists inventory_items_set_updated_at on public.inventory_items;
create trigger inventory_items_set_updated_at before update on public.inventory_items for each row execute function public.set_updated_at();
drop trigger if exists invoices_set_updated_at on public.invoices;
create trigger invoices_set_updated_at before update on public.invoices for each row execute function public.set_updated_at();
drop trigger if exists client_calendar_events_set_updated_at on public.client_calendar_events;
create trigger client_calendar_events_set_updated_at before update on public.client_calendar_events for each row execute function public.set_updated_at();

alter table public.jobs enable row level security;
alter table public.job_materials enable row level security;
alter table public.inventory_items enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_line_items enable row level security;
alter table public.client_calendar_events enable row level security;

drop policy if exists "Workspace members can read jobs" on public.jobs;
create policy "Workspace members can read jobs" on public.jobs for select using (public.is_workspace_member(workspace_id));
drop policy if exists "Workspace members can insert jobs" on public.jobs;
create policy "Workspace members can insert jobs" on public.jobs for insert with check (public.is_workspace_member(workspace_id));
drop policy if exists "Workspace members can update jobs" on public.jobs;
create policy "Workspace members can update jobs" on public.jobs for update using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
drop policy if exists "Workspace members can delete jobs" on public.jobs;
create policy "Workspace members can delete jobs" on public.jobs for delete using (public.is_workspace_member(workspace_id));

drop policy if exists "Workspace members can read job materials" on public.job_materials;
create policy "Workspace members can read job materials" on public.job_materials for select using (public.is_workspace_member(workspace_id));
drop policy if exists "Workspace members can insert job materials" on public.job_materials;
create policy "Workspace members can insert job materials" on public.job_materials for insert with check (public.is_workspace_member(workspace_id));
drop policy if exists "Workspace members can update job materials" on public.job_materials;
create policy "Workspace members can update job materials" on public.job_materials for update using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
drop policy if exists "Workspace members can delete job materials" on public.job_materials;
create policy "Workspace members can delete job materials" on public.job_materials for delete using (public.is_workspace_member(workspace_id));

drop policy if exists "Workspace members can read inventory" on public.inventory_items;
create policy "Workspace members can read inventory" on public.inventory_items for select using (public.is_workspace_member(workspace_id));
drop policy if exists "Workspace members can insert inventory" on public.inventory_items;
create policy "Workspace members can insert inventory" on public.inventory_items for insert with check (public.is_workspace_member(workspace_id));
drop policy if exists "Workspace members can update inventory" on public.inventory_items;
create policy "Workspace members can update inventory" on public.inventory_items for update using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
drop policy if exists "Workspace members can delete inventory" on public.inventory_items;
create policy "Workspace members can delete inventory" on public.inventory_items for delete using (public.is_workspace_member(workspace_id));

drop policy if exists "Workspace members can read invoices" on public.invoices;
create policy "Workspace members can read invoices" on public.invoices for select using (public.is_workspace_member(workspace_id));
drop policy if exists "Workspace members can insert invoices" on public.invoices;
create policy "Workspace members can insert invoices" on public.invoices for insert with check (public.is_workspace_member(workspace_id));
drop policy if exists "Workspace members can update invoices" on public.invoices;
create policy "Workspace members can update invoices" on public.invoices for update using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
drop policy if exists "Workspace members can delete invoices" on public.invoices;
create policy "Workspace members can delete invoices" on public.invoices for delete using (public.is_workspace_member(workspace_id));

drop policy if exists "Workspace members can read invoice line items" on public.invoice_line_items;
create policy "Workspace members can read invoice line items" on public.invoice_line_items for select using (public.is_workspace_member(workspace_id));
drop policy if exists "Workspace members can insert invoice line items" on public.invoice_line_items;
create policy "Workspace members can insert invoice line items" on public.invoice_line_items for insert with check (public.is_workspace_member(workspace_id));
drop policy if exists "Workspace members can update invoice line items" on public.invoice_line_items;
create policy "Workspace members can update invoice line items" on public.invoice_line_items for update using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
drop policy if exists "Workspace members can delete invoice line items" on public.invoice_line_items;
create policy "Workspace members can delete invoice line items" on public.invoice_line_items for delete using (public.is_workspace_member(workspace_id));

drop policy if exists "Workspace members can read calendar events" on public.client_calendar_events;
create policy "Workspace members can read calendar events" on public.client_calendar_events for select using (public.is_workspace_member(workspace_id));
drop policy if exists "Workspace members can insert calendar events" on public.client_calendar_events;
create policy "Workspace members can insert calendar events" on public.client_calendar_events for insert with check (public.is_workspace_member(workspace_id));
drop policy if exists "Workspace members can update calendar events" on public.client_calendar_events;
create policy "Workspace members can update calendar events" on public.client_calendar_events for update using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
drop policy if exists "Workspace members can delete calendar events" on public.client_calendar_events;
create policy "Workspace members can delete calendar events" on public.client_calendar_events for delete using (public.is_workspace_member(workspace_id));
