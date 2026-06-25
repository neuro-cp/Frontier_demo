alter table public.documents
  add column if not exists ocr_queued_at timestamptz null,
  add column if not exists ocr_started_at timestamptz null,
  add column if not exists ocr_completed_at timestamptz null,
  add column if not exists ocr_failed_at timestamptz null,
  add column if not exists ocr_error text null,
  add column if not exists ocr_retry_count integer not null default 0,
  add column if not exists ocr_review_draft_id uuid null references public.ai_review_drafts(id) on delete set null;

create index if not exists documents_ocr_review_draft_idx
  on public.documents (ocr_review_draft_id);

create index if not exists documents_ocr_completed_at_idx
  on public.documents (ocr_completed_at desc);
