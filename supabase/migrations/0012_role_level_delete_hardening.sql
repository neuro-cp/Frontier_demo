create or replace function public.has_workspace_role(
  target_workspace_id uuid,
  allowed_roles text[]
)
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
      and role = any(allowed_roles)
  );
$$;

create or replace function public.is_workspace_owner(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_workspace_role(target_workspace_id, array['Owner']);
$$;

create or replace function public.is_workspace_manager(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_workspace_role(target_workspace_id, array['Owner', 'Manager']);
$$;

revoke execute on function public.has_workspace_role(uuid, text[]) from public;
revoke execute on function public.is_workspace_owner(uuid) from public;
revoke execute on function public.is_workspace_manager(uuid) from public;
grant execute on function public.has_workspace_role(uuid, text[]) to authenticated;
grant execute on function public.is_workspace_owner(uuid) to authenticated;
grant execute on function public.is_workspace_manager(uuid) to authenticated;

drop policy if exists "Workspace members can delete workspaces" on public.workspaces;
create policy "Workspace owners can delete workspaces"
  on public.workspaces for delete
  using (public.is_workspace_owner(id));

drop policy if exists "Workspace members can delete settings" on public.workspace_settings;
create policy "Workspace owners can delete settings"
  on public.workspace_settings for delete
  using (public.is_workspace_owner(workspace_id));

drop policy if exists "Workspace members can delete clients" on public.clients;
create policy "Workspace managers can delete clients"
  on public.clients for delete
  using (public.is_workspace_manager(workspace_id));

drop policy if exists "Workspace members can delete client notes" on public.client_notes;
create policy "Workspace managers can delete client notes"
  on public.client_notes for delete
  using (public.is_workspace_manager(workspace_id));

drop policy if exists "Workspace members can delete client activity" on public.client_activity;
create policy "Workspace managers can delete client activity"
  on public.client_activity for delete
  using (public.is_workspace_manager(workspace_id));

drop policy if exists "Workspace members can delete jobs" on public.jobs;
create policy "Workspace managers can delete jobs"
  on public.jobs for delete
  using (public.is_workspace_manager(workspace_id));

drop policy if exists "Workspace members can delete job materials" on public.job_materials;
create policy "Workspace managers can delete job materials"
  on public.job_materials for delete
  using (public.is_workspace_manager(workspace_id));

drop policy if exists "Workspace members can delete job activity" on public.job_activity;
create policy "Workspace managers can delete job activity"
  on public.job_activity for delete
  using (public.is_workspace_manager(workspace_id));

drop policy if exists "Workspace members can delete inventory" on public.inventory_items;
create policy "Workspace managers can delete inventory"
  on public.inventory_items for delete
  using (public.is_workspace_manager(workspace_id));

drop policy if exists "Workspace members can delete estimates" on public.estimates;
create policy "Workspace managers can delete estimates"
  on public.estimates for delete
  using (public.is_workspace_manager(workspace_id));

drop policy if exists "Workspace members can delete estimate line items" on public.estimate_line_items;
create policy "Workspace managers can delete estimate line items"
  on public.estimate_line_items for delete
  using (public.is_workspace_manager(workspace_id));

drop policy if exists "Workspace members can delete invoices" on public.invoices;
create policy "Workspace managers can delete invoices"
  on public.invoices for delete
  using (public.is_workspace_manager(workspace_id));

drop policy if exists "Workspace members can delete invoice line items" on public.invoice_line_items;
create policy "Workspace managers can delete invoice line items"
  on public.invoice_line_items for delete
  using (public.is_workspace_manager(workspace_id));

drop policy if exists "Workspace members can delete invoice payments" on public.invoice_payments;
create policy "Workspace managers can delete invoice payments"
  on public.invoice_payments for delete
  using (public.is_workspace_manager(workspace_id));

drop policy if exists "Workspace members can delete expenses" on public.expenses;
create policy "Workspace managers can delete expenses"
  on public.expenses for delete
  using (public.is_workspace_manager(workspace_id));

drop policy if exists "Workspace members can delete documents" on public.documents;
create policy "Workspace managers can delete documents"
  on public.documents for delete
  using (public.is_workspace_manager(workspace_id));

drop policy if exists "Workspace members can delete document tags" on public.document_tags;
create policy "Workspace managers can delete document tags"
  on public.document_tags for delete
  using (public.is_workspace_manager(workspace_id));

drop policy if exists "Workspace members can delete document tag links" on public.document_tag_links;
create policy "Workspace managers can delete document tag links"
  on public.document_tag_links for delete
  using (public.is_workspace_manager(workspace_id));

drop policy if exists "Workspace members can delete calendar events" on public.client_calendar_events;
create policy "Workspace managers can delete calendar events"
  on public.client_calendar_events for delete
  using (public.is_workspace_manager(workspace_id));

drop policy if exists "Workspace members can delete route plans" on public.route_plans;
create policy "Workspace managers can delete route plans"
  on public.route_plans for delete
  using (public.is_workspace_manager(workspace_id));

drop policy if exists "Workspace members can delete route stops" on public.route_plan_stops;
create policy "Workspace managers can delete route stops"
  on public.route_plan_stops for delete
  using (public.is_workspace_manager(workspace_id));

drop policy if exists "Workspace members can delete AI jobs" on public.ai_jobs;
create policy "Workspace managers can delete AI jobs"
  on public.ai_jobs for delete
  using (public.is_workspace_manager(workspace_id));

drop policy if exists "Workspace members can delete document objects" on storage.objects;
create policy "Workspace managers can delete document objects"
  on storage.objects for delete
  using (
    bucket_id = 'workspace-documents'
    and public.is_workspace_manager(public.storage_workspace_id(name))
  );
