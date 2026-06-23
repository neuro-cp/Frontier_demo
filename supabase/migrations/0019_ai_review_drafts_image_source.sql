alter table public.ai_review_drafts
  drop constraint if exists ai_review_drafts_source_type_check;

alter table public.ai_review_drafts
  add constraint ai_review_drafts_source_type_check
  check (source_type in ('ocr', 'transcript', 'image'));

