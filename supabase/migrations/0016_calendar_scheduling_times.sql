alter table public.jobs
  add column if not exists scheduled_time time without time zone;

alter table public.client_calendar_events
  add column if not exists event_time time without time zone;

create index if not exists jobs_schedule_idx
  on public.jobs (workspace_id, scheduled_date, scheduled_time);

create index if not exists client_calendar_events_schedule_idx
  on public.client_calendar_events (workspace_id, event_date, event_time);

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
    scheduled_time,
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
    nullif(job_payload ->> 'scheduled_time', '')::time,
    job_payload ->> 'notes'
  )
  on conflict (id) do update
    set client_id = excluded.client_id,
        client_name_snapshot = excluded.client_name_snapshot,
        name = excluded.name,
        status = excluded.status,
        estimated_value_cents = excluded.estimated_value_cents,
        scheduled_date = excluded.scheduled_date,
        scheduled_time = excluded.scheduled_time,
        notes = excluded.notes,
        updated_at = now()
  returning * into target_job;

  delete from public.job_materials
  where job_id = target_job_id
    and workspace_id = target_workspace_id;

  for material_item in
    select * from jsonb_array_elements(coalesce(materials_payload, '[]'::jsonb))
  loop
    insert into public.job_materials (workspace_id, job_id, name, quantity)
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
