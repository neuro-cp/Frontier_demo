alter table public.invoices
  drop constraint if exists invoices_status_check;

alter table public.invoices
  add constraint invoices_status_check
  check (status in ('Estimate', 'Draft', 'Sent', 'Overdue', 'Paid'));

alter table public.workspace_settings
  drop constraint if exists workspace_settings_default_invoice_status_check;

alter table public.workspace_settings
  add constraint workspace_settings_default_invoice_status_check
  check (default_invoice_status in ('Estimate', 'Draft', 'Sent'));

create or replace function public.upsert_invoice_with_lines(
  invoice_payload jsonb,
  line_items_payload jsonb
)
returns public.invoices
language plpgsql
security invoker
set search_path = public
as $$
declare
  target_invoice public.invoices;
  target_workspace_id uuid;
  target_invoice_id uuid;
  line_item jsonb;
begin
  target_workspace_id := (invoice_payload ->> 'workspace_id')::uuid;
  target_invoice_id := (invoice_payload ->> 'id')::uuid;

  if not public.is_workspace_member(target_workspace_id) then
    raise exception 'Access denied for workspace %', target_workspace_id
      using errcode = '42501';
  end if;

  insert into public.invoices (
    id,
    workspace_id,
    client_id,
    job_id,
    invoice_number,
    invoice_date,
    company_name,
    company_address,
    company_city,
    company_state,
    company_zip,
    company_phone,
    company_email,
    bill_to_name,
    bill_to_company,
    bill_to_address,
    bill_to_city,
    bill_to_state,
    bill_to_zip,
    bill_to_phone,
    bill_to_email,
    discount_type,
    discount_value,
    tax_rate,
    footer_message,
    contact_message,
    status
  )
  values (
    target_invoice_id,
    target_workspace_id,
    nullif(invoice_payload ->> 'client_id', '')::uuid,
    nullif(invoice_payload ->> 'job_id', '')::uuid,
    invoice_payload ->> 'invoice_number',
    (invoice_payload ->> 'invoice_date')::date,
    invoice_payload ->> 'company_name',
    invoice_payload ->> 'company_address',
    invoice_payload ->> 'company_city',
    invoice_payload ->> 'company_state',
    invoice_payload ->> 'company_zip',
    invoice_payload ->> 'company_phone',
    invoice_payload ->> 'company_email',
    invoice_payload ->> 'bill_to_name',
    invoice_payload ->> 'bill_to_company',
    invoice_payload ->> 'bill_to_address',
    invoice_payload ->> 'bill_to_city',
    invoice_payload ->> 'bill_to_state',
    invoice_payload ->> 'bill_to_zip',
    invoice_payload ->> 'bill_to_phone',
    invoice_payload ->> 'bill_to_email',
    coalesce(invoice_payload ->> 'discount_type', 'None'),
    coalesce(nullif(invoice_payload ->> 'discount_value', '')::numeric, 0),
    coalesce(nullif(invoice_payload ->> 'tax_rate', '')::numeric, 0),
    invoice_payload ->> 'footer_message',
    invoice_payload ->> 'contact_message',
    coalesce(invoice_payload ->> 'status', 'Draft')
  )
  on conflict (id) do update
    set client_id = excluded.client_id,
        job_id = excluded.job_id,
        invoice_number = excluded.invoice_number,
        invoice_date = excluded.invoice_date,
        company_name = excluded.company_name,
        company_address = excluded.company_address,
        company_city = excluded.company_city,
        company_state = excluded.company_state,
        company_zip = excluded.company_zip,
        company_phone = excluded.company_phone,
        company_email = excluded.company_email,
        bill_to_name = excluded.bill_to_name,
        bill_to_company = excluded.bill_to_company,
        bill_to_address = excluded.bill_to_address,
        bill_to_city = excluded.bill_to_city,
        bill_to_state = excluded.bill_to_state,
        bill_to_zip = excluded.bill_to_zip,
        bill_to_phone = excluded.bill_to_phone,
        bill_to_email = excluded.bill_to_email,
        discount_type = excluded.discount_type,
        discount_value = excluded.discount_value,
        tax_rate = excluded.tax_rate,
        footer_message = excluded.footer_message,
        contact_message = excluded.contact_message,
        status = excluded.status,
        updated_at = now()
  returning * into target_invoice;

  delete from public.invoice_line_items
  where invoice_id = target_invoice_id
    and workspace_id = target_workspace_id;

  for line_item in
    select * from jsonb_array_elements(coalesce(line_items_payload, '[]'::jsonb))
  loop
    insert into public.invoice_line_items (
      id,
      workspace_id,
      invoice_id,
      description,
      quantity,
      unit_price_cents,
      sort_order
    )
    values (
      coalesce(nullif(line_item ->> 'id', '')::uuid, gen_random_uuid()),
      target_workspace_id,
      target_invoice_id,
      line_item ->> 'description',
      coalesce(nullif(line_item ->> 'quantity', '')::numeric, 1),
      coalesce(nullif(line_item ->> 'unit_price_cents', '')::integer, 0),
      coalesce(nullif(line_item ->> 'sort_order', '')::integer, 0)
    );
  end loop;

  return target_invoice;
end;
$$;

create or replace function public.create_workspace_with_owner(
  workspace_id uuid,
  workspace_name text,
  workspace_type text
)
returns public.workspaces
language plpgsql
security invoker
set search_path = public
as $$
declare
  created_workspace public.workspaces;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  insert into public.workspaces (id, name, type, created_by)
  values (workspace_id, workspace_name, coalesce(nullif(workspace_type, ''), 'Other'), auth.uid())
  returning * into created_workspace;

  insert into public.workspace_members (workspace_id, user_id, role, status)
  values (workspace_id, auth.uid(), 'Owner', 'Active');

  insert into public.workspace_settings (
    workspace_id,
    workspace_nickname,
    business_type
  )
  values (
    workspace_id,
    workspace_name,
    coalesce(nullif(workspace_type, ''), 'Other')
  );

  return created_workspace;
end;
$$;
