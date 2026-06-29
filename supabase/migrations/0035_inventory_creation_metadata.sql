alter table public.inventory_items
  add column if not exists unit text,
  add column if not exists notes text,
  add column if not exists reorder_threshold numeric,
  add column if not exists storage_location text;

alter table public.material_catalog_items
  add column if not exists preferred_vendor text,
  add column if not exists vendor_sku text,
  add column if not exists variant_name text,
  add column if not exists retail_price_cents bigint;

alter table public.material_vendor_skus
  add column if not exists variant_name text,
  add column if not exists retail_price_cents bigint;
