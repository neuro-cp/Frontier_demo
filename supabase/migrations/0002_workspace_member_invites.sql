create policy "Workspace members can create invited memberships"
  on public.workspace_members for insert
  with check (
    public.is_workspace_member(workspace_id)
    and status = 'Invited'
    and user_id is null
    and invited_email is not null
  );
