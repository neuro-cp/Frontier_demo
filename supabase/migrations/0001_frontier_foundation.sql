-- Frontier database foundation
-- Schema-only migration. UI remains on localStorage until a later integration phase.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null default 'Other',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text not null check (role in ('Owner', 'Manager', 'Employee')),
  status text not null default 'Active' check (status in ('Active', 'Invited', 'Removed')),
  invited_email text,
  invited_by uuid references public.profiles(id) on delete set null,
  invite_token text,
  invite_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workspace_members_user_or_email_check check (
    user_id is not null or invited_email is not null
  )
);

create unique index workspace_members_workspace_user_uidx
  on public.workspace_members (workspace_id, user_id)
  where user_id is not null;
create unique index workspace_members_invite_token_uidx
  on public.workspace_members (invite_token)
  where invite_token is not null;
create index workspace_members_workspace_idx on public.workspace_members (workspace_id);
create index workspace_members_user_idx on public.workspace_members (user_id);

create or replace function public.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members
    where workspace_id = target_workspace_id
      and user_id = auth.uid()
      and status = 'Active'
  );
$$;

create or replace function public.is_workspace_creator(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspaces
    where id = target_workspace_id
      and created_by = auth.uid()
  );
$$;

create table public.workspace_settings (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  company_name text,
  company_address text,
  company_city text,
  company_state text,
  company_zip text,
  company_phone text,
  company_email text,
  company_website text,
  default_invoice_terms text,
  default_footer_message text,
  default_contact_message text,
  default_invoice_status text not null default 'Draft' check (default_invoice_status in ('Draft', 'Sent')),
  tax_state text,
  default_tax_rate numeric not null default 0,
  tax_location_mode text not null default 'Business location' check (tax_location_mode in ('Business location', 'Job location')),
  discount_before_tax boolean not null default true,
  workspace_nickname text,
  business_type text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  status text not null default 'Active' check (status in ('Lead', 'Active', 'Inactive')),
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

create index clients_workspace_idx on public.clients (workspace_id);
create unique index clients_workspace_name_uidx on public.clients (workspace_id, lower(name));

create table public.client_notes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  body text not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index client_notes_workspace_idx on public.client_notes (workspace_id);
create index client_notes_client_idx on public.client_notes (client_id);

create table public.client_activity (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  activity_type text not null,
  title text not null,
  body text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index client_activity_workspace_idx on public.client_activity (workspace_id);
create index client_activity_client_idx on public.client_activity (client_id);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  client_name_snapshot text,
  name text not null,
  status text not null default 'Lead' check (status in ('Lead', 'Quoted', 'Scheduled', 'Completed', 'Paid')),
  estimated_value_cents integer not null default 0,
  scheduled_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index jobs_workspace_idx on public.jobs (workspace_id);
create index jobs_client_idx on public.jobs (client_id);
create index jobs_scheduled_date_idx on public.jobs (scheduled_date);

create table public.job_materials (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  name text not null,
  quantity numeric not null default 0,
  created_at timestamptz not null default now()
);

create index job_materials_workspace_idx on public.job_materials (workspace_id);
create index job_materials_job_idx on public.job_materials (job_id);
create index job_materials_name_idx on public.job_materials (lower(name));

create table public.job_activity (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  activity_type text not null,
  title text not null,
  body text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index job_activity_workspace_idx on public.job_activity (workspace_id);
create index job_activity_job_idx on public.job_activity (job_id);

create table public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  current_qty numeric,
  target_qty numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index inventory_items_workspace_idx on public.inventory_items (workspace_id);
create unique index inventory_items_workspace_name_uidx on public.inventory_items (workspace_id, lower(name));

create table public.estimates (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  job_id uuid references public.jobs(id) on delete set null,
  estimate_number text not null,
  estimate_date date not null,
  converted_invoice_id uuid,
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
  discount_type text not null default 'None' check (discount_type in ('None', 'Percent', 'Fixed')),
  discount_value numeric not null default 0,
  tax_rate numeric not null default 0,
  footer_message text,
  contact_message text,
  status text not null default 'Draft' check (status in ('Draft', 'Sent', 'Accepted', 'Declined', 'Expired', 'Converted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index estimates_workspace_idx on public.estimates (workspace_id);
create index estimates_client_idx on public.estimates (client_id);
create index estimates_job_idx on public.estimates (job_id);
create index estimates_date_idx on public.estimates (estimate_date);
create index estimates_status_idx on public.estimates (status);
create unique index estimates_workspace_number_uidx on public.estimates (workspace_id, estimate_number);

create table public.estimate_line_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  estimate_id uuid not null references public.estimates(id) on delete cascade,
  description text not null,
  quantity numeric not null default 1,
  unit_price_cents integer not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index estimate_line_items_workspace_idx on public.estimate_line_items (workspace_id);
create index estimate_line_items_estimate_idx on public.estimate_line_items (estimate_id);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  job_id uuid references public.jobs(id) on delete set null,
  source_estimate_id uuid references public.estimates(id) on delete set null,
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
  discount_type text not null default 'None' check (discount_type in ('None', 'Percent', 'Fixed')),
  discount_value numeric not null default 0,
  tax_rate numeric not null default 0,
  footer_message text,
  contact_message text,
  sent_at timestamptz,
  paid_at timestamptz,
  email_status text,
  status text not null default 'Draft' check (status in ('Draft', 'Sent', 'Overdue', 'Paid')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.estimates
  add constraint estimates_converted_invoice_fk
  foreign key (converted_invoice_id) references public.invoices(id) on delete set null;

create index invoices_workspace_idx on public.invoices (workspace_id);
create index invoices_client_idx on public.invoices (client_id);
create index invoices_job_idx on public.invoices (job_id);
create index invoices_source_estimate_idx on public.invoices (source_estimate_id);
create index invoices_date_idx on public.invoices (invoice_date);
create index invoices_status_idx on public.invoices (status);
create unique index invoices_workspace_number_uidx on public.invoices (workspace_id, invoice_number);

create table public.invoice_line_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  description text not null,
  quantity numeric not null default 1,
  unit_price_cents integer not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index invoice_line_items_workspace_idx on public.invoice_line_items (workspace_id);
create index invoice_line_items_invoice_idx on public.invoice_line_items (invoice_id);

create table public.invoice_payments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  amount_cents integer not null check (amount_cents >= 0),
  payment_date date not null default current_date,
  method text,
  reference text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index invoice_payments_workspace_idx on public.invoice_payments (workspace_id);
create index invoice_payments_invoice_idx on public.invoice_payments (invoice_id);
create index invoice_payments_date_idx on public.invoice_payments (payment_date);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  description text not null,
  category text not null,
  amount_cents integer not null default 0,
  expense_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index expenses_workspace_idx on public.expenses (workspace_id);
create index expenses_date_idx on public.expenses (expense_date);
create index expenses_category_idx on public.expenses (category);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  job_id uuid references public.jobs(id) on delete set null,
  invoice_id uuid references public.invoices(id) on delete set null,
  estimate_id uuid references public.estimates(id) on delete set null,
  expense_id uuid references public.expenses(id) on delete set null,
  name text not null,
  detected_type text,
  extraction_status text,
  file_name text,
  storage_bucket text,
  storage_path text,
  mime_type text,
  size_bytes bigint,
  notes text,
  extracted_json jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index documents_workspace_idx on public.documents (workspace_id);
create index documents_client_idx on public.documents (client_id);
create index documents_job_idx on public.documents (job_id);
create index documents_invoice_idx on public.documents (invoice_id);
create index documents_estimate_idx on public.documents (estimate_id);
create index documents_expense_idx on public.documents (expense_id);

create table public.document_tags (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index document_tags_workspace_idx on public.document_tags (workspace_id);
create unique index document_tags_workspace_name_uidx on public.document_tags (workspace_id, lower(name));

create table public.document_tag_links (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade,
  tag_id uuid not null references public.document_tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (document_id, tag_id)
);

create index document_tag_links_workspace_idx on public.document_tag_links (workspace_id);
create index document_tag_links_document_idx on public.document_tag_links (document_id);
create index document_tag_links_tag_idx on public.document_tag_links (tag_id);

create table public.client_calendar_events (
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

create index client_calendar_events_workspace_idx on public.client_calendar_events (workspace_id);
create index client_calendar_events_client_idx on public.client_calendar_events (client_id);
create index client_calendar_events_date_idx on public.client_calendar_events (event_date);

create table public.route_plans (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  total_distance_meters integer,
  total_duration_seconds integer,
  google_maps_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index route_plans_workspace_idx on public.route_plans (workspace_id);

create table public.route_plan_stops (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  route_plan_id uuid not null references public.route_plans(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  stop_order integer not null,
  latitude numeric(10,7),
  longitude numeric(10,7),
  address_snapshot text,
  created_at timestamptz not null default now(),
  unique (route_plan_id, stop_order)
);

create index route_plan_stops_workspace_idx on public.route_plan_stops (workspace_id);
create index route_plan_stops_route_idx on public.route_plan_stops (route_plan_id);
create index route_plan_stops_client_idx on public.route_plan_stops (client_id);

create table public.ai_jobs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  document_id uuid references public.documents(id) on delete set null,
  client_id uuid references public.clients(id) on delete set null,
  job_id uuid references public.jobs(id) on delete set null,
  invoice_id uuid references public.invoices(id) on delete set null,
  expense_id uuid references public.expenses(id) on delete set null,
  workflow_name text not null,
  status text not null default 'Queued' check (status in ('Queued', 'Processing', 'Needs Review', 'Approved', 'Failed')),
  model_provider text,
  model_name text,
  prompt_version text,
  input_json jsonb not null default '{}'::jsonb,
  result_json jsonb,
  confidence numeric,
  error_message text,
  approved_by uuid references public.profiles(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index ai_jobs_workspace_idx on public.ai_jobs (workspace_id);
create index ai_jobs_document_idx on public.ai_jobs (document_id);
create index ai_jobs_status_idx on public.ai_jobs (status);

create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger workspaces_set_updated_at before update on public.workspaces
  for each row execute function public.set_updated_at();
create trigger workspace_members_set_updated_at before update on public.workspace_members
  for each row execute function public.set_updated_at();
create trigger workspace_settings_set_updated_at before update on public.workspace_settings
  for each row execute function public.set_updated_at();
create trigger clients_set_updated_at before update on public.clients
  for each row execute function public.set_updated_at();
create trigger client_notes_set_updated_at before update on public.client_notes
  for each row execute function public.set_updated_at();
create trigger jobs_set_updated_at before update on public.jobs
  for each row execute function public.set_updated_at();
create trigger inventory_items_set_updated_at before update on public.inventory_items
  for each row execute function public.set_updated_at();
create trigger estimates_set_updated_at before update on public.estimates
  for each row execute function public.set_updated_at();
create trigger invoices_set_updated_at before update on public.invoices
  for each row execute function public.set_updated_at();
create trigger invoice_payments_set_updated_at before update on public.invoice_payments
  for each row execute function public.set_updated_at();
create trigger expenses_set_updated_at before update on public.expenses
  for each row execute function public.set_updated_at();
create trigger documents_set_updated_at before update on public.documents
  for each row execute function public.set_updated_at();
create trigger document_tags_set_updated_at before update on public.document_tags
  for each row execute function public.set_updated_at();
create trigger client_calendar_events_set_updated_at before update on public.client_calendar_events
  for each row execute function public.set_updated_at();
create trigger route_plans_set_updated_at before update on public.route_plans
  for each row execute function public.set_updated_at();
create trigger ai_jobs_set_updated_at before update on public.ai_jobs
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.workspace_settings enable row level security;
alter table public.clients enable row level security;
alter table public.client_notes enable row level security;
alter table public.client_activity enable row level security;
alter table public.jobs enable row level security;
alter table public.job_materials enable row level security;
alter table public.job_activity enable row level security;
alter table public.inventory_items enable row level security;
alter table public.estimates enable row level security;
alter table public.estimate_line_items enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_line_items enable row level security;
alter table public.invoice_payments enable row level security;
alter table public.expenses enable row level security;
alter table public.documents enable row level security;
alter table public.document_tags enable row level security;
alter table public.document_tag_links enable row level security;
alter table public.client_calendar_events enable row level security;
alter table public.route_plans enable row level security;
alter table public.route_plan_stops enable row level security;
alter table public.ai_jobs enable row level security;

create policy "Profiles are visible to owner"
  on public.profiles for select
  using (id = auth.uid());

create policy "Profiles are editable by owner"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "Profiles can be inserted by owner"
  on public.profiles for insert
  with check (id = auth.uid());

create policy "Workspace members can view workspaces"
  on public.workspaces for select
  using (public.is_workspace_member(id));

create policy "Authenticated users can create workspaces"
  on public.workspaces for insert
  with check (auth.uid() is not null and created_by = auth.uid());

create policy "Workspace members can update workspaces"
  on public.workspaces for update
  using (public.is_workspace_member(id))
  with check (public.is_workspace_member(id));

create policy "Workspace members can delete workspaces"
  on public.workspaces for delete
  using (public.is_workspace_member(id));

create policy "Workspace members can view memberships"
  on public.workspace_members for select
  using (public.is_workspace_member(workspace_id) or user_id = auth.uid());

create policy "Users can create their initial owner membership"
  on public.workspace_members for insert
  with check (
    auth.uid() is not null
    and user_id = auth.uid()
    and role = 'Owner'
    and status = 'Active'
    and public.is_workspace_creator(workspace_id)
  );

create policy "Workspace members can manage memberships"
  on public.workspace_members for update
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy "Workspace members can remove memberships"
  on public.workspace_members for delete
  using (public.is_workspace_member(workspace_id));

create policy "Workspace members can read settings"
  on public.workspace_settings for select
  using (public.is_workspace_member(workspace_id));
create policy "Workspace members can insert settings"
  on public.workspace_settings for insert
  with check (public.is_workspace_member(workspace_id));
create policy "Workspace members can update settings"
  on public.workspace_settings for update
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));
create policy "Workspace members can delete settings"
  on public.workspace_settings for delete
  using (public.is_workspace_member(workspace_id));

create policy "Workspace members can read clients"
  on public.clients for select
  using (public.is_workspace_member(workspace_id));
create policy "Workspace members can insert clients"
  on public.clients for insert
  with check (public.is_workspace_member(workspace_id));
create policy "Workspace members can update clients"
  on public.clients for update
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));
create policy "Workspace members can delete clients"
  on public.clients for delete
  using (public.is_workspace_member(workspace_id));

create policy "Workspace members can read client notes"
  on public.client_notes for select
  using (public.is_workspace_member(workspace_id));
create policy "Workspace members can insert client notes"
  on public.client_notes for insert
  with check (public.is_workspace_member(workspace_id));
create policy "Workspace members can update client notes"
  on public.client_notes for update
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));
create policy "Workspace members can delete client notes"
  on public.client_notes for delete
  using (public.is_workspace_member(workspace_id));

create policy "Workspace members can read client activity"
  on public.client_activity for select
  using (public.is_workspace_member(workspace_id));
create policy "Workspace members can insert client activity"
  on public.client_activity for insert
  with check (public.is_workspace_member(workspace_id));
create policy "Workspace members can update client activity"
  on public.client_activity for update
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));
create policy "Workspace members can delete client activity"
  on public.client_activity for delete
  using (public.is_workspace_member(workspace_id));

create policy "Workspace members can read jobs"
  on public.jobs for select
  using (public.is_workspace_member(workspace_id));
create policy "Workspace members can insert jobs"
  on public.jobs for insert
  with check (public.is_workspace_member(workspace_id));
create policy "Workspace members can update jobs"
  on public.jobs for update
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));
create policy "Workspace members can delete jobs"
  on public.jobs for delete
  using (public.is_workspace_member(workspace_id));

create policy "Workspace members can read job materials"
  on public.job_materials for select
  using (public.is_workspace_member(workspace_id));
create policy "Workspace members can insert job materials"
  on public.job_materials for insert
  with check (public.is_workspace_member(workspace_id));
create policy "Workspace members can update job materials"
  on public.job_materials for update
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));
create policy "Workspace members can delete job materials"
  on public.job_materials for delete
  using (public.is_workspace_member(workspace_id));

create policy "Workspace members can read job activity"
  on public.job_activity for select
  using (public.is_workspace_member(workspace_id));
create policy "Workspace members can insert job activity"
  on public.job_activity for insert
  with check (public.is_workspace_member(workspace_id));
create policy "Workspace members can update job activity"
  on public.job_activity for update
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));
create policy "Workspace members can delete job activity"
  on public.job_activity for delete
  using (public.is_workspace_member(workspace_id));

create policy "Workspace members can read inventory"
  on public.inventory_items for select
  using (public.is_workspace_member(workspace_id));
create policy "Workspace members can insert inventory"
  on public.inventory_items for insert
  with check (public.is_workspace_member(workspace_id));
create policy "Workspace members can update inventory"
  on public.inventory_items for update
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));
create policy "Workspace members can delete inventory"
  on public.inventory_items for delete
  using (public.is_workspace_member(workspace_id));

create policy "Workspace members can read estimates"
  on public.estimates for select
  using (public.is_workspace_member(workspace_id));
create policy "Workspace members can insert estimates"
  on public.estimates for insert
  with check (public.is_workspace_member(workspace_id));
create policy "Workspace members can update estimates"
  on public.estimates for update
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));
create policy "Workspace members can delete estimates"
  on public.estimates for delete
  using (public.is_workspace_member(workspace_id));

create policy "Workspace members can read estimate line items"
  on public.estimate_line_items for select
  using (public.is_workspace_member(workspace_id));
create policy "Workspace members can insert estimate line items"
  on public.estimate_line_items for insert
  with check (public.is_workspace_member(workspace_id));
create policy "Workspace members can update estimate line items"
  on public.estimate_line_items for update
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));
create policy "Workspace members can delete estimate line items"
  on public.estimate_line_items for delete
  using (public.is_workspace_member(workspace_id));

create policy "Workspace members can read invoices"
  on public.invoices for select
  using (public.is_workspace_member(workspace_id));
create policy "Workspace members can insert invoices"
  on public.invoices for insert
  with check (public.is_workspace_member(workspace_id));
create policy "Workspace members can update invoices"
  on public.invoices for update
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));
create policy "Workspace members can delete invoices"
  on public.invoices for delete
  using (public.is_workspace_member(workspace_id));

create policy "Workspace members can read invoice line items"
  on public.invoice_line_items for select
  using (public.is_workspace_member(workspace_id));
create policy "Workspace members can insert invoice line items"
  on public.invoice_line_items for insert
  with check (public.is_workspace_member(workspace_id));
create policy "Workspace members can update invoice line items"
  on public.invoice_line_items for update
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));
create policy "Workspace members can delete invoice line items"
  on public.invoice_line_items for delete
  using (public.is_workspace_member(workspace_id));

create policy "Workspace members can read invoice payments"
  on public.invoice_payments for select
  using (public.is_workspace_member(workspace_id));
create policy "Workspace members can insert invoice payments"
  on public.invoice_payments for insert
  with check (public.is_workspace_member(workspace_id));
create policy "Workspace members can update invoice payments"
  on public.invoice_payments for update
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));
create policy "Workspace members can delete invoice payments"
  on public.invoice_payments for delete
  using (public.is_workspace_member(workspace_id));

create policy "Workspace members can read expenses"
  on public.expenses for select
  using (public.is_workspace_member(workspace_id));
create policy "Workspace members can insert expenses"
  on public.expenses for insert
  with check (public.is_workspace_member(workspace_id));
create policy "Workspace members can update expenses"
  on public.expenses for update
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));
create policy "Workspace members can delete expenses"
  on public.expenses for delete
  using (public.is_workspace_member(workspace_id));

create policy "Workspace members can read documents"
  on public.documents for select
  using (public.is_workspace_member(workspace_id));
create policy "Workspace members can insert documents"
  on public.documents for insert
  with check (public.is_workspace_member(workspace_id));
create policy "Workspace members can update documents"
  on public.documents for update
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));
create policy "Workspace members can delete documents"
  on public.documents for delete
  using (public.is_workspace_member(workspace_id));

create policy "Workspace members can read document tags"
  on public.document_tags for select
  using (public.is_workspace_member(workspace_id));
create policy "Workspace members can insert document tags"
  on public.document_tags for insert
  with check (public.is_workspace_member(workspace_id));
create policy "Workspace members can update document tags"
  on public.document_tags for update
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));
create policy "Workspace members can delete document tags"
  on public.document_tags for delete
  using (public.is_workspace_member(workspace_id));

create policy "Workspace members can read document tag links"
  on public.document_tag_links for select
  using (public.is_workspace_member(workspace_id));
create policy "Workspace members can insert document tag links"
  on public.document_tag_links for insert
  with check (public.is_workspace_member(workspace_id));
create policy "Workspace members can update document tag links"
  on public.document_tag_links for update
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));
create policy "Workspace members can delete document tag links"
  on public.document_tag_links for delete
  using (public.is_workspace_member(workspace_id));

create policy "Workspace members can read calendar events"
  on public.client_calendar_events for select
  using (public.is_workspace_member(workspace_id));
create policy "Workspace members can insert calendar events"
  on public.client_calendar_events for insert
  with check (public.is_workspace_member(workspace_id));
create policy "Workspace members can update calendar events"
  on public.client_calendar_events for update
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));
create policy "Workspace members can delete calendar events"
  on public.client_calendar_events for delete
  using (public.is_workspace_member(workspace_id));

create policy "Workspace members can read route plans"
  on public.route_plans for select
  using (public.is_workspace_member(workspace_id));
create policy "Workspace members can insert route plans"
  on public.route_plans for insert
  with check (public.is_workspace_member(workspace_id));
create policy "Workspace members can update route plans"
  on public.route_plans for update
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));
create policy "Workspace members can delete route plans"
  on public.route_plans for delete
  using (public.is_workspace_member(workspace_id));

create policy "Workspace members can read route stops"
  on public.route_plan_stops for select
  using (public.is_workspace_member(workspace_id));
create policy "Workspace members can insert route stops"
  on public.route_plan_stops for insert
  with check (public.is_workspace_member(workspace_id));
create policy "Workspace members can update route stops"
  on public.route_plan_stops for update
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));
create policy "Workspace members can delete route stops"
  on public.route_plan_stops for delete
  using (public.is_workspace_member(workspace_id));

create policy "Workspace members can read AI jobs"
  on public.ai_jobs for select
  using (public.is_workspace_member(workspace_id));
create policy "Workspace members can insert AI jobs"
  on public.ai_jobs for insert
  with check (public.is_workspace_member(workspace_id));
create policy "Workspace members can update AI jobs"
  on public.ai_jobs for update
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));
create policy "Workspace members can delete AI jobs"
  on public.ai_jobs for delete
  using (public.is_workspace_member(workspace_id));
