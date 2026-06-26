alter table public.documents
  add column if not exists image_analysis_status text null,
  add column if not exists image_analysis_queued_at timestamptz null,
  add column if not exists image_analysis_started_at timestamptz null,
  add column if not exists image_analysis_completed_at timestamptz null,
  add column if not exists image_analysis_failed_at timestamptz null,
  add column if not exists image_analysis_error text null,
  add column if not exists image_analysis_retry_count integer not null default 0,
  add column if not exists image_analysis_provider text null,
  add column if not exists image_analysis_model text null,
  add column if not exists image_analysis_confidence numeric null,
  add column if not exists image_analysis_summary text null,
  add column if not exists image_review_draft_id uuid null references public.ai_review_drafts(id) on delete set null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'documents_image_analysis_status_check'
      and conrelid = 'public.documents'::regclass
  ) then
    alter table public.documents
      add constraint documents_image_analysis_status_check
      check (
        image_analysis_status is null
        or image_analysis_status in ('queued', 'processing', 'completed', 'failed')
      );
  end if;
end $$;

create index if not exists documents_image_review_draft_idx
  on public.documents (image_review_draft_id);

create index if not exists documents_image_analysis_status_idx
  on public.documents (workspace_id, image_analysis_status);

create index if not exists documents_image_analysis_completed_idx
  on public.documents (workspace_id, image_analysis_completed_at desc);
