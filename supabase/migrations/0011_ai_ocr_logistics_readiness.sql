alter table public.documents
  add column if not exists processing_status text not null default 'uploaded',
  add column if not exists extracted_text text,
  add column if not exists ocr_provider text,
  add column if not exists ai_job_id uuid,
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewed_by uuid references public.profiles(id) on delete set null,
  add column if not exists confidence numeric,
  add column if not exists document_type text;

alter table public.documents
  drop constraint if exists documents_processing_status_check;

alter table public.documents
  add constraint documents_processing_status_check
  check (processing_status in ('uploaded', 'queued', 'processing', 'needs_review', 'reviewed', 'failed'));

create index if not exists documents_processing_status_idx on public.documents (processing_status);
create index if not exists documents_document_type_idx on public.documents (document_type);
create index if not exists documents_ai_job_idx on public.documents (ai_job_id);

alter table public.ai_jobs
  add column if not exists created_by uuid references public.profiles(id) on delete set null,
  add column if not exists job_type text,
  add column if not exists input_ref text,
  add column if not exists output_json jsonb,
  add column if not exists started_at timestamptz,
  add column if not exists completed_at timestamptz;

update public.ai_jobs
set job_type = coalesce(job_type, workflow_name)
where job_type is null;

alter table public.ai_jobs
  alter column job_type set default 'document_ocr';

alter table public.ai_jobs
  drop constraint if exists ai_jobs_job_type_check;

alter table public.ai_jobs
  add constraint ai_jobs_job_type_check
  check (job_type in (
    'document_ocr',
    'document_extraction',
    'voice_command',
    'logistics_plan',
    'invoice_parse',
    'client_parse'
  ));

alter table public.ai_jobs
  drop constraint if exists ai_jobs_status_check;

alter table public.ai_jobs
  add constraint ai_jobs_status_check
  check (status in (
    'Queued',
    'Processing',
    'Needs Review',
    'Approved',
    'Failed',
    'queued',
    'processing',
    'needs_review',
    'reviewed',
    'failed'
  ));

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'documents_ai_job_id_fkey'
  ) then
    alter table public.documents
      add constraint documents_ai_job_id_fkey
      foreign key (ai_job_id) references public.ai_jobs(id) on delete set null;
  end if;
end $$;

create index if not exists ai_jobs_job_type_idx on public.ai_jobs (job_type);
create index if not exists ai_jobs_created_by_idx on public.ai_jobs (created_by);

create or replace function public.upsert_job_with_materials(
  job_payload jsonb,
  materials_payload jsonb
)
returns public.jobs
language plpgsql
security invoker
set search_path = public
as $$
declare
  target_job public.jobs;
  target_workspace_id uuid;
  target_job_id uuid;
  material_item jsonb;
begin
  target_workspace_id := (job_payload ->> 'workspace_id')::uuid;
  target_job_id := (job_payload ->> 'id')::uuid;

  if not public.is_workspace_member(target_workspace_id) then
    raise exception 'Access denied for workspace %', target_workspace_id using errcode = '42501';
  end if;

  insert into public.jobs (
    id,
    workspace_id,
    client_id,
    client_name_snapshot,
    name,
    status,
    estimated_value_cents,
    scheduled_date,
    notes
  )
  values (
    target_job_id,
    target_workspace_id,
    nullif(job_payload ->> 'client_id', '')::uuid,
    job_payload ->> 'client_name_snapshot',
    job_payload ->> 'name',
    coalesce(job_payload ->> 'status', 'Lead'),
    coalesce(nullif(job_payload ->> 'estimated_value_cents', '')::integer, 0),
    nullif(job_payload ->> 'scheduled_date', '')::date,
    job_payload ->> 'notes'
  )
  on conflict (id) do update
    set client_id = excluded.client_id,
        client_name_snapshot = excluded.client_name_snapshot,
        name = excluded.name,
        status = excluded.status,
        estimated_value_cents = excluded.estimated_value_cents,
        scheduled_date = excluded.scheduled_date,
        notes = excluded.notes,
        updated_at = now()
  returning * into target_job;

  delete from public.job_materials
  where job_id = target_job_id
    and workspace_id = target_workspace_id;

  for material_item in
    select * from jsonb_array_elements(coalesce(materials_payload, '[]'::jsonb))
  loop
    insert into public.job_materials (
      workspace_id,
      job_id,
      name,
      quantity
    )
    values (
      target_workspace_id,
      target_job_id,
      material_item ->> 'name',
      coalesce(nullif(material_item ->> 'quantity', '')::numeric, 0)
    );
  end loop;

  return target_job;
end;
$$;

create or replace function public.upsert_route_with_stops(
  route_payload jsonb,
  stops_payload jsonb
)
returns public.route_plans
language plpgsql
security invoker
set search_path = public
as $$
declare
  target_route public.route_plans;
  target_workspace_id uuid;
  target_route_id uuid;
  stop_item jsonb;
begin
  target_workspace_id := (route_payload ->> 'workspace_id')::uuid;
  target_route_id := (route_payload ->> 'id')::uuid;

  if not public.is_workspace_member(target_workspace_id) then
    raise exception 'Access denied for workspace %', target_workspace_id using errcode = '42501';
  end if;

  insert into public.route_plans (
    id,
    workspace_id,
    name,
    total_distance_meters,
    total_duration_seconds,
    google_maps_url,
    notes
  )
  values (
    target_route_id,
    target_workspace_id,
    route_payload ->> 'name',
    nullif(route_payload ->> 'total_distance_meters', '')::integer,
    nullif(route_payload ->> 'total_duration_seconds', '')::integer,
    route_payload ->> 'google_maps_url',
    route_payload ->> 'notes'
  )
  on conflict (id) do update
    set name = excluded.name,
        total_distance_meters = excluded.total_distance_meters,
        total_duration_seconds = excluded.total_duration_seconds,
        google_maps_url = excluded.google_maps_url,
        notes = excluded.notes,
        updated_at = now()
  returning * into target_route;

  delete from public.route_plan_stops
  where route_plan_id = target_route_id
    and workspace_id = target_workspace_id;

  for stop_item in
    select * from jsonb_array_elements(coalesce(stops_payload, '[]'::jsonb))
  loop
    insert into public.route_plan_stops (
      id,
      workspace_id,
      route_plan_id,
      client_id,
      stop_order,
      latitude,
      longitude,
      address_snapshot
    )
    values (
      coalesce(nullif(stop_item ->> 'id', '')::uuid, gen_random_uuid()),
      target_workspace_id,
      target_route_id,
      nullif(stop_item ->> 'client_id', '')::uuid,
      coalesce(nullif(stop_item ->> 'stop_order', '')::integer, 0),
      nullif(stop_item ->> 'latitude', '')::numeric,
      nullif(stop_item ->> 'longitude', '')::numeric,
      stop_item ->> 'address_snapshot'
    );
  end loop;

  return target_route;
end;
$$;
