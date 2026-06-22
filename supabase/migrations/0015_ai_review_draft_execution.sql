alter table public.ai_review_drafts
  add column if not exists execution_status text not null default 'Not Executed',
  add column if not exists executed_at timestamptz null,
  add column if not exists executed_by uuid null references public.profiles(id) on delete set null,
  add column if not exists execution_result jsonb not null default '{}'::jsonb,
  add column if not exists execution_error text null;

alter table public.ai_review_drafts
  drop constraint if exists ai_review_drafts_execution_status_check;

alter table public.ai_review_drafts
  add constraint ai_review_drafts_execution_status_check
  check (execution_status in ('Not Executed', 'Executed', 'Failed'));

create index if not exists ai_review_drafts_execution_status_idx
  on public.ai_review_drafts (workspace_id, execution_status);
