insert into storage.buckets (id, name, public)
values ('workspace-documents', 'workspace-documents', false)
on conflict (id) do update
  set public = false;

create or replace function public.storage_workspace_id(object_name text)
returns uuid
language plpgsql
stable
as $$
declare
  workspace_segment text;
begin
  workspace_segment := (storage.foldername(object_name))[1];
  return workspace_segment::uuid;
exception
  when invalid_text_representation or null_value_not_allowed then
    return null;
end;
$$;

comment on function public.storage_workspace_id(text) is
  'Extracts the workspace UUID from workspace-documents object paths: workspaceId/entityType/entityId/file.ext.';

drop policy if exists "Workspace members can read document objects" on storage.objects;
create policy "Workspace members can read document objects"
  on storage.objects for select
  using (
    bucket_id = 'workspace-documents'
    and public.is_workspace_member(public.storage_workspace_id(name))
  );

drop policy if exists "Workspace members can upload document objects" on storage.objects;
create policy "Workspace members can upload document objects"
  on storage.objects for insert
  with check (
    bucket_id = 'workspace-documents'
    and owner = auth.uid()
    and public.is_workspace_member(public.storage_workspace_id(name))
  );

drop policy if exists "Workspace members can update document objects" on storage.objects;
create policy "Workspace members can update document objects"
  on storage.objects for update
  using (
    bucket_id = 'workspace-documents'
    and public.is_workspace_member(public.storage_workspace_id(name))
  )
  with check (
    bucket_id = 'workspace-documents'
    and public.is_workspace_member(public.storage_workspace_id(name))
  );

drop policy if exists "Workspace members can delete document objects" on storage.objects;
create policy "Workspace members can delete document objects"
  on storage.objects for delete
  using (
    bucket_id = 'workspace-documents'
    and public.is_workspace_member(public.storage_workspace_id(name))
  );
