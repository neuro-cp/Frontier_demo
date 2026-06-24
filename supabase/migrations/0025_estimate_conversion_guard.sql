create unique index if not exists invoices_source_estimate_uidx
  on public.invoices (source_estimate_id)
  where source_estimate_id is not null;
