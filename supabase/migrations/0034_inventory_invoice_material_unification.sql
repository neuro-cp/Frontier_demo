drop index if exists public.inventory_items_workspace_name_uidx;

create index if not exists inventory_items_workspace_name_idx
  on public.inventory_items (workspace_id, lower(name));

alter table public.invoice_line_items
  add column if not exists inventory_item_id uuid references public.inventory_items(id) on delete set null,
  add column if not exists material_vendor_sku_id uuid references public.material_vendor_skus(id) on delete set null,
  add column if not exists sku_snapshot text,
  add column if not exists unit_snapshot text,
  add column if not exists unit_cost_snapshot_cents bigint,
  add column if not exists inventory_deduction_status text not null default 'Not Applicable'
    check (inventory_deduction_status in ('Not Applicable', 'Pending', 'Deducted'));

create index if not exists invoice_line_items_inventory_item_idx
  on public.invoice_line_items (inventory_item_id);

create index if not exists invoice_line_items_vendor_sku_idx
  on public.invoice_line_items (material_vendor_sku_id);
