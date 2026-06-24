alter table public.estimates
  add column if not exists approved_at timestamptz,
  add column if not exists approved_by_user_id uuid references auth.users(id) on delete set null,
  add column if not exists approval_notes text,
  add column if not exists rejected_at timestamptz,
  add column if not exists rejected_by_user_id uuid references auth.users(id) on delete set null,
  add column if not exists rejection_notes text;

create index if not exists estimates_approved_by_user_idx
  on public.estimates (approved_by_user_id);
create index if not exists estimates_rejected_by_user_idx
  on public.estimates (rejected_by_user_id);
