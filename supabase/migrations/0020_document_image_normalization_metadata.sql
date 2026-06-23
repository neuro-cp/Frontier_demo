alter table public.documents
  add column if not exists original_file_name text,
  add column if not exists original_mime_type text,
  add column if not exists original_size_bytes bigint,
  add column if not exists normalized_file_name text,
  add column if not exists normalized_mime_type text,
  add column if not exists normalized_size_bytes bigint,
  add column if not exists normalization_status text;

