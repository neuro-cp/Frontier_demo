create or replace function public.is_workspace_manager(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members
    where workspace_id = target_workspace_id
      and user_id = auth.uid()
      and status = 'Active'
      and role in ('Owner', 'Manager')
  );
$$;

create or replace function public.accept_workspace_invites_for_current_user()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  accepted_count integer;
  user_email text;
begin
  user_email := nullif(lower(auth.jwt() ->> 'email'), '');

  if auth.uid() is null or user_email is null then
    return 0;
  end if;

  update public.workspace_members member
  set
    user_id = auth.uid(),
    status = 'Active',
    invited_email = null,
    invite_token = null,
    invite_expires_at = null
  where member.user_id is null
    and member.status = 'Invited'
    and lower(member.invited_email) = user_email
    and (
      member.invite_expires_at is null
      or member.invite_expires_at > now()
    )
    and not exists (
      select 1
      from public.workspace_members existing_member
      where existing_member.workspace_id = member.workspace_id
        and existing_member.user_id = auth.uid()
    );

  get diagnostics accepted_count = row_count;
  return accepted_count;
end;
$$;

grant execute on function public.accept_workspace_invites_for_current_user() to authenticated;

drop policy if exists "Workspace members can create invited memberships"
  on public.workspace_members;

create policy "Workspace managers can create invited memberships"
  on public.workspace_members for insert
  with check (
    public.is_workspace_manager(workspace_id)
    and status = 'Invited'
    and user_id is null
    and invited_email is not null
  );

drop policy if exists "Workspace members can manage memberships"
  on public.workspace_members;

create policy "Workspace managers can manage memberships"
  on public.workspace_members for update
  using (public.is_workspace_manager(workspace_id))
  with check (public.is_workspace_manager(workspace_id));

drop policy if exists "Workspace members can remove memberships"
  on public.workspace_members;

create policy "Workspace managers can remove memberships"
  on public.workspace_members for delete
  using (public.is_workspace_manager(workspace_id));
