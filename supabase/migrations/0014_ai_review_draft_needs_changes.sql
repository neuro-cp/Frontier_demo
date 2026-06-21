alter table public.ai_review_drafts
  drop constraint if exists ai_review_drafts_status_check;

alter table public.ai_review_drafts
  add constraint ai_review_drafts_status_check
  check (status in ('Pending', 'Approved', 'Rejected', 'Needs Changes'));
