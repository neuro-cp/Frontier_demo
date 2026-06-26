alter table public.jobs
  add column if not exists completed_at timestamptz;

create index if not exists jobs_completed_at_idx
  on public.jobs (workspace_id, completed_at);
