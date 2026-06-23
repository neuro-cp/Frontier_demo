create table if not exists public.material_catalog_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  inventory_item_id uuid not null unique references public.inventory_items(id) on delete cascade,
  name text not null,
  description text,
  category text,
  unit text,
  default_cost_cents bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.material_vendor_skus (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  material_id uuid not null references public.material_catalog_items(id) on delete cascade,
  vendor_name text not null,
  sku text not null,
  unit_cost_cents bigint,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (material_id, vendor_name, sku)
);

create table if not exists public.inventory_lots (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  material_id uuid not null references public.material_catalog_items(id) on delete cascade,
  vendor_sku_id uuid references public.material_vendor_skus(id) on delete set null,
  quantity numeric not null default 0 check (quantity >= 0),
  unit_cost_cents bigint,
  received_at date,
  lot_reference text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.job_material_allocations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete cascade,
  material_id uuid not null references public.material_catalog_items(id) on delete cascade,
  quantity numeric not null check (quantity > 0),
  mode text not null default 'Append' check (mode in ('Append', 'Merge', 'Replace')),
  status text not null default 'Draft' check (status in ('Draft', 'Applied', 'Rejected')),
  source_document_id uuid references public.documents(id) on delete set null,
  review_draft_id uuid references public.ai_review_drafts(id) on delete set null,
  notes text,
  created_by uuid references public.profiles(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.documents
  add column if not exists material_catalog_item_id uuid references public.material_catalog_items(id) on delete set null,
  add column if not exists job_material_allocation_id uuid references public.job_material_allocations(id) on delete set null;

create index if not exists material_catalog_items_workspace_idx on public.material_catalog_items(workspace_id);
create index if not exists material_vendor_skus_material_idx on public.material_vendor_skus(material_id);
create index if not exists inventory_lots_material_idx on public.inventory_lots(material_id);
create index if not exists job_material_allocations_job_idx on public.job_material_allocations(job_id);
create index if not exists job_material_allocations_material_idx on public.job_material_allocations(material_id);
create index if not exists job_material_allocations_review_idx on public.job_material_allocations(review_draft_id);
create index if not exists documents_material_catalog_idx on public.documents(material_catalog_item_id);
create index if not exists documents_material_allocation_idx on public.documents(job_material_allocation_id);

create or replace function public.ensure_material_catalog_item()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.material_catalog_items (workspace_id, inventory_item_id, name)
  values (new.workspace_id, new.id, new.name)
  on conflict (inventory_item_id) do update
    set name = excluded.name,
        workspace_id = excluded.workspace_id,
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists inventory_items_ensure_catalog on public.inventory_items;
create trigger inventory_items_ensure_catalog
after insert or update of name, workspace_id on public.inventory_items
for each row execute function public.ensure_material_catalog_item();

insert into public.material_catalog_items (workspace_id, inventory_item_id, name)
select workspace_id, id, name from public.inventory_items
on conflict (inventory_item_id) do update
  set name = excluded.name,
      workspace_id = excluded.workspace_id,
      updated_at = now();

drop trigger if exists material_catalog_items_set_updated_at on public.material_catalog_items;
create trigger material_catalog_items_set_updated_at before update on public.material_catalog_items
for each row execute function public.set_updated_at();
drop trigger if exists material_vendor_skus_set_updated_at on public.material_vendor_skus;
create trigger material_vendor_skus_set_updated_at before update on public.material_vendor_skus
for each row execute function public.set_updated_at();
drop trigger if exists inventory_lots_set_updated_at on public.inventory_lots;
create trigger inventory_lots_set_updated_at before update on public.inventory_lots
for each row execute function public.set_updated_at();
drop trigger if exists job_material_allocations_set_updated_at on public.job_material_allocations;
create trigger job_material_allocations_set_updated_at before update on public.job_material_allocations
for each row execute function public.set_updated_at();

alter table public.material_catalog_items enable row level security;
alter table public.material_vendor_skus enable row level security;
alter table public.inventory_lots enable row level security;
alter table public.job_material_allocations enable row level security;

create policy "Workspace members can read material catalog" on public.material_catalog_items
for select using (public.is_workspace_member(workspace_id));
create policy "Workspace members can insert material catalog" on public.material_catalog_items
for insert with check (public.is_workspace_member(workspace_id));
create policy "Workspace members can update material catalog" on public.material_catalog_items
for update using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
create policy "Workspace managers can delete material catalog" on public.material_catalog_items
for delete using (public.is_workspace_manager(workspace_id));

create policy "Workspace members can read vendor SKUs" on public.material_vendor_skus
for select using (public.is_workspace_member(workspace_id));
create policy "Workspace members can insert vendor SKUs" on public.material_vendor_skus
for insert with check (public.is_workspace_member(workspace_id));
create policy "Workspace members can update vendor SKUs" on public.material_vendor_skus
for update using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
create policy "Workspace managers can delete vendor SKUs" on public.material_vendor_skus
for delete using (public.is_workspace_manager(workspace_id));

create policy "Workspace members can read inventory lots" on public.inventory_lots
for select using (public.is_workspace_member(workspace_id));
create policy "Workspace members can insert inventory lots" on public.inventory_lots
for insert with check (public.is_workspace_member(workspace_id));
create policy "Workspace members can update inventory lots" on public.inventory_lots
for update using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
create policy "Workspace managers can delete inventory lots" on public.inventory_lots
for delete using (public.is_workspace_manager(workspace_id));

create policy "Workspace members can read material allocations" on public.job_material_allocations
for select using (public.is_workspace_member(workspace_id));
create policy "Workspace members can insert draft material allocations" on public.job_material_allocations
for insert with check (public.is_workspace_member(workspace_id) and status = 'Draft');
create policy "Workspace managers can update material allocations" on public.job_material_allocations
for update using (public.is_workspace_manager(workspace_id)) with check (public.is_workspace_manager(workspace_id));
create policy "Workspace managers can delete material allocations" on public.job_material_allocations
for delete using (public.is_workspace_manager(workspace_id));

create or replace function public.create_material_allocation_draft(
  target_workspace_id uuid,
  target_job_id uuid,
  allocation_mode text,
  material_rows jsonb,
  source_document_id uuid default null,
  source_review_draft_id uuid default null
)
returns setof public.job_material_allocations
language plpgsql
security definer
set search_path = public
as $$
declare
  material_row jsonb;
  inventory_id uuid;
  catalog_id uuid;
  material_name text;
  material_quantity numeric;
begin
  if not public.is_workspace_member(target_workspace_id) then
    raise exception 'Workspace access denied.';
  end if;
  if allocation_mode not in ('Append', 'Merge', 'Replace') then
    raise exception 'Invalid allocation mode.';
  end if;
  if not exists (
    select 1 from public.jobs
    where id = target_job_id and workspace_id = target_workspace_id
  ) then
    raise exception 'Job does not belong to this workspace.';
  end if;
  if source_document_id is not null and not exists (
    select 1 from public.documents
    where id = source_document_id and workspace_id = target_workspace_id
  ) then
    raise exception 'Document does not belong to this workspace.';
  end if;
  if source_review_draft_id is not null and not exists (
    select 1 from public.ai_review_drafts
    where id = source_review_draft_id and workspace_id = target_workspace_id
  ) then
    raise exception 'Review draft does not belong to this workspace.';
  end if;

  for material_row in select value from jsonb_array_elements(material_rows)
  loop
    material_name := nullif(trim(material_row->>'name'), '');
    material_quantity := nullif(material_row->>'quantity', '')::numeric;
    if material_name is null or material_quantity is null or material_quantity <= 0 then
      raise exception 'Each material requires a name and positive quantity.';
    end if;

    select id into inventory_id
    from public.inventory_items
    where workspace_id = target_workspace_id and lower(name) = lower(material_name)
    limit 1;

    if inventory_id is null then
      insert into public.inventory_items (workspace_id, name, current_qty, target_qty)
      values (target_workspace_id, material_name, null, null)
      returning id into inventory_id;
    end if;

    select id into catalog_id
    from public.material_catalog_items
    where inventory_item_id = inventory_id;

    return query
      insert into public.job_material_allocations (
        workspace_id, job_id, material_id, quantity, mode, status,
        source_document_id, review_draft_id, notes, created_by
      ) values (
        target_workspace_id, target_job_id, catalog_id, material_quantity,
        allocation_mode, 'Draft', source_document_id, source_review_draft_id,
        nullif(material_row->>'notes', ''), auth.uid()
      ) returning *;
  end loop;
end;
$$;

revoke execute on function public.create_material_allocation_draft(uuid, uuid, text, jsonb, uuid, uuid) from public;
grant execute on function public.create_material_allocation_draft(uuid, uuid, text, jsonb, uuid, uuid) to authenticated;
