alter table public.ai_review_drafts
  add column if not exists summary text null;

create table if not exists public.ai_review_draft_revisions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  review_draft_id uuid not null references public.ai_review_drafts(id) on delete cascade,
  source_label text null,
  summary text null,
  actions jsonb not null default '[]'::jsonb,
  warnings jsonb not null default '[]'::jsonb,
  changed_by uuid null references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists ai_review_draft_revisions_draft_idx
  on public.ai_review_draft_revisions (review_draft_id, created_at desc);

alter table public.ai_review_draft_revisions enable row level security;

drop policy if exists "Workspace members can read review draft revisions"
  on public.ai_review_draft_revisions;
create policy "Workspace members can read review draft revisions"
  on public.ai_review_draft_revisions for select
  using (public.is_workspace_member(workspace_id));

create or replace function public.capture_ai_review_draft_revision()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.source_label is distinct from new.source_label
     or old.summary is distinct from new.summary
     or old.actions is distinct from new.actions
     or old.warnings is distinct from new.warnings then
    insert into public.ai_review_draft_revisions (
      workspace_id,
      review_draft_id,
      source_label,
      summary,
      actions,
      warnings,
      changed_by
    ) values (
      old.workspace_id,
      old.id,
      old.source_label,
      old.summary,
      old.actions,
      old.warnings,
      auth.uid()
    );
  end if;
  return new;
end;
$$;

drop trigger if exists ai_review_drafts_capture_revision on public.ai_review_drafts;
create trigger ai_review_drafts_capture_revision
before update on public.ai_review_drafts
for each row execute function public.capture_ai_review_draft_revision();
