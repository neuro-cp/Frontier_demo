alter table public.workspace_settings
  add column if not exists business_latitude numeric(10,7),
  add column if not exists business_longitude numeric(10,7),
  add column if not exists business_geocoded_at timestamptz;
