create table if not exists public.ai_review_drafts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  source_type text not null,
  source_id uuid null,
  source_label text null,
  status text not null default 'Pending',
  confidence numeric null,
  warnings jsonb not null default '[]'::jsonb,
  actions jsonb not null default '[]'::jsonb,
  raw_input text null,
  model_provider text null,
  model_name text null,
  created_by uuid null references public.profiles(id) on delete set null,
  reviewed_by uuid null references public.profiles(id) on delete set null,
  reviewed_at timestamptz null,
  approved_at timestamptz null,
  rejected_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ai_review_drafts_source_type_check
    check (source_type in ('ocr', 'transcript')),
  constraint ai_review_drafts_status_check
    check (status in ('Pending', 'Approved', 'Rejected')),
  constraint ai_review_drafts_warnings_array_check
    check (jsonb_typeof(warnings) = 'array'),
  constraint ai_review_drafts_actions_array_check
    check (jsonb_typeof(actions) = 'array'),
  constraint ai_review_drafts_no_delete_actions_check
    check (
      not jsonb_path_exists(
        actions,
        '$[*] ? (@.type like_regex "^delete_")'
      )
    )
);

create index if not exists ai_review_drafts_workspace_idx
  on public.ai_review_drafts (workspace_id);
create index if not exists ai_review_drafts_source_idx
  on public.ai_review_drafts (source_type, source_id);
create index if not exists ai_review_drafts_status_idx
  on public.ai_review_drafts (status);
create index if not exists ai_review_drafts_created_by_idx
  on public.ai_review_drafts (created_by);
create index if not exists ai_review_drafts_created_at_idx
  on public.ai_review_drafts (created_at desc);

drop trigger if exists ai_review_drafts_set_updated_at on public.ai_review_drafts;
create trigger ai_review_drafts_set_updated_at
  before update on public.ai_review_drafts
  for each row execute function public.set_updated_at();

alter table public.ai_review_drafts enable row level security;

drop policy if exists "Workspace members can read AI review drafts" on public.ai_review_drafts;
create policy "Workspace members can read AI review drafts"
  on public.ai_review_drafts for select
  using (public.is_workspace_member(workspace_id));

drop policy if exists "Workspace members can create AI review drafts" on public.ai_review_drafts;
create policy "Workspace members can create AI review drafts"
  on public.ai_review_drafts for insert
  with check (
    public.is_workspace_member(workspace_id)
    and status = 'Pending'
  );

drop policy if exists "Workspace managers can update AI review drafts" on public.ai_review_drafts;
create policy "Workspace managers can update AI review drafts"
  on public.ai_review_drafts for update
  using (public.is_workspace_manager(workspace_id))
  with check (public.is_workspace_manager(workspace_id));
