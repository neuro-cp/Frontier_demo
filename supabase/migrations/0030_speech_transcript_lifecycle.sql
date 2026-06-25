create table if not exists public.speech_transcripts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  created_by uuid null references public.profiles(id) on delete set null,
  source_label text null,
  file_name text null,
  mime_type text null,
  size_bytes bigint null,
  status text not null default 'queued',
  transcript_text text null,
  provider text null,
  model_name text null,
  language text null,
  duration_seconds numeric null,
  confidence numeric null,
  segments jsonb not null default '[]'::jsonb,
  error_text text null,
  retry_count integer not null default 0,
  queued_at timestamptz null,
  started_at timestamptz null,
  completed_at timestamptz null,
  failed_at timestamptz null,
  review_draft_id uuid null references public.ai_review_drafts(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint speech_transcripts_status_check
    check (status in ('queued', 'processing', 'completed', 'failed')),
  constraint speech_transcripts_segments_array_check
    check (jsonb_typeof(segments) = 'array')
);

create index if not exists speech_transcripts_workspace_idx
  on public.speech_transcripts (workspace_id, created_at desc);

create index if not exists speech_transcripts_review_draft_idx
  on public.speech_transcripts (review_draft_id);

drop trigger if exists speech_transcripts_set_updated_at on public.speech_transcripts;
create trigger speech_transcripts_set_updated_at
  before update on public.speech_transcripts
  for each row execute function public.set_updated_at();

alter table public.speech_transcripts enable row level security;

drop policy if exists "Workspace members can read speech transcripts"
  on public.speech_transcripts;
create policy "Workspace members can read speech transcripts"
  on public.speech_transcripts for select
  using (public.is_workspace_member(workspace_id));

drop policy if exists "Workspace members can create speech transcripts"
  on public.speech_transcripts;
create policy "Workspace members can create speech transcripts"
  on public.speech_transcripts for insert
  with check (public.is_workspace_member(workspace_id));

drop policy if exists "Workspace members can update speech transcripts"
  on public.speech_transcripts;
create policy "Workspace members can update speech transcripts"
  on public.speech_transcripts for update
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));
