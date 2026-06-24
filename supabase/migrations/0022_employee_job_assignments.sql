create table if not exists public.employee_job_assignments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  employee_user_id uuid not null references auth.users(id) on delete cascade,
  assigned_by uuid references auth.users(id) on delete set null,
  status text not null default 'Assigned'
    check (status in ('Assigned', 'Completed', 'Removed')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists employee_job_assignments_set_updated_at
  on public.employee_job_assignments;
create trigger employee_job_assignments_set_updated_at
  before update on public.employee_job_assignments
  for each row execute function public.set_updated_at();

create index if not exists employee_job_assignments_workspace_idx
  on public.employee_job_assignments (workspace_id);
create index if not exists employee_job_assignments_job_idx
  on public.employee_job_assignments (job_id);
create index if not exists employee_job_assignments_employee_idx
  on public.employee_job_assignments (employee_user_id);
create unique index if not exists employee_job_assignments_active_uidx
  on public.employee_job_assignments (workspace_id, job_id, employee_user_id)
  where status <> 'Removed';

alter table public.employee_job_assignments enable row level security;

drop policy if exists "Managers can read employee job assignments"
  on public.employee_job_assignments;
create policy "Managers can read employee job assignments"
  on public.employee_job_assignments for select
  using (public.has_workspace_role(workspace_id, array['Owner', 'Manager']));

drop policy if exists "Employees can read own job assignments"
  on public.employee_job_assignments;
create policy "Employees can read own job assignments"
  on public.employee_job_assignments for select
  using (
    employee_user_id = auth.uid()
    and status <> 'Removed'
    and public.has_workspace_role(workspace_id, array['Employee'])
  );

drop policy if exists "Managers can insert employee job assignments"
  on public.employee_job_assignments;
create policy "Managers can insert employee job assignments"
  on public.employee_job_assignments for insert
  with check (public.has_workspace_role(workspace_id, array['Owner', 'Manager']));

drop policy if exists "Managers can update employee job assignments"
  on public.employee_job_assignments;
create policy "Managers can update employee job assignments"
  on public.employee_job_assignments for update
  using (public.has_workspace_role(workspace_id, array['Owner', 'Manager']))
  with check (public.has_workspace_role(workspace_id, array['Owner', 'Manager']));
