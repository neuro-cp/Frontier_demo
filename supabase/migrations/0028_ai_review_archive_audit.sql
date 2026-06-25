alter table public.ai_review_drafts
  add column if not exists archived_at timestamptz null,
  add column if not exists archived_by uuid null references public.profiles(id) on delete set null;

alter table public.ai_review_drafts
  drop constraint if exists ai_review_drafts_status_check;

alter table public.ai_review_drafts
  add constraint ai_review_drafts_status_check
  check (status in ('Pending', 'Approved', 'Rejected', 'Needs Changes', 'Archived'));

create table if not exists public.ai_review_draft_audit_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  review_draft_id uuid not null references public.ai_review_drafts(id) on delete cascade,
  event_type text not null,
  actor_user_id uuid null references public.profiles(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint ai_review_draft_audit_events_type_check
    check (
      event_type in (
        'created',
        'edited',
        'approved',
        'rejected',
        'needs_changes',
        'archived',
        'executed',
        'execution_failed',
        'duplicated'
      )
    ),
  constraint ai_review_draft_audit_events_metadata_object_check
    check (jsonb_typeof(metadata) = 'object')
);

create index if not exists ai_review_draft_audit_events_workspace_idx
  on public.ai_review_draft_audit_events (workspace_id, created_at desc);

create index if not exists ai_review_draft_audit_events_draft_idx
  on public.ai_review_draft_audit_events (review_draft_id, created_at desc);

alter table public.ai_review_draft_audit_events enable row level security;

drop policy if exists "Workspace members can read AI review audit events"
  on public.ai_review_draft_audit_events;
create policy "Workspace members can read AI review audit events"
  on public.ai_review_draft_audit_events for select
  using (public.is_workspace_member(workspace_id));

drop policy if exists "Workspace managers can create AI review audit events"
  on public.ai_review_draft_audit_events;
create policy "Workspace managers can create AI review audit events"
  on public.ai_review_draft_audit_events for insert
  with check (public.is_workspace_manager(workspace_id));

create or replace function public.capture_ai_review_draft_audit_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  event_name text;
begin
  if tg_op = 'INSERT' then
    insert into public.ai_review_draft_audit_events (
      workspace_id,
      review_draft_id,
      event_type,
      actor_user_id,
      metadata
    ) values (
      new.workspace_id,
      new.id,
      'created',
      auth.uid(),
      '{}'::jsonb
    );
    return new;
  end if;

  if old.source_label is distinct from new.source_label
     or old.summary is distinct from new.summary
     or old.actions is distinct from new.actions
     or old.warnings is distinct from new.warnings then
    insert into public.ai_review_draft_audit_events (
      workspace_id,
      review_draft_id,
      event_type,
      actor_user_id,
      metadata
    ) values (
      new.workspace_id,
      new.id,
      'edited',
      auth.uid(),
      jsonb_build_object('previousUpdatedAt', old.updated_at)
    );
  end if;

  if old.status is distinct from new.status then
    event_name := case new.status
      when 'Approved' then 'approved'
      when 'Rejected' then 'rejected'
      when 'Needs Changes' then 'needs_changes'
      when 'Archived' then 'archived'
      else null
    end;

    if event_name is not null then
      insert into public.ai_review_draft_audit_events (
        workspace_id,
        review_draft_id,
        event_type,
        actor_user_id,
        metadata
      ) values (
        new.workspace_id,
        new.id,
        event_name,
        auth.uid(),
        jsonb_build_object('previousStatus', old.status)
      );
    end if;
  end if;

  if coalesce(old.execution_status, 'Not Executed') is distinct from coalesce(new.execution_status, 'Not Executed') then
    event_name := case new.execution_status
      when 'Executed' then 'executed'
      when 'Failed' then 'execution_failed'
      else null
    end;

    if event_name is not null then
      insert into public.ai_review_draft_audit_events (
        workspace_id,
        review_draft_id,
        event_type,
        actor_user_id,
        metadata
      ) values (
        new.workspace_id,
        new.id,
        event_name,
        auth.uid(),
        jsonb_build_object('previousExecutionStatus', old.execution_status)
      );
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists ai_review_drafts_capture_audit_event on public.ai_review_drafts;
create trigger ai_review_drafts_capture_audit_event
after insert or update on public.ai_review_drafts
for each row execute function public.capture_ai_review_draft_audit_event();
