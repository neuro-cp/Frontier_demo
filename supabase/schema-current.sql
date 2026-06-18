-- Frontier current live database schema snapshot
-- Generated from live Supabase database at 2026-06-18T00:11:47.820Z
-- Scope: public application schema plus installed extensions. Supabase-managed auth/storage schemas are platform-owned.
-- This is an audit snapshot, not a migration to apply automatically.


-- -----------------------------------------------------------------------------
-- Extensions
-- -----------------------------------------------------------------------------
create extension if not exists "pg_stat_statements" with schema "extensions"; -- version 1.11
create extension if not exists "pgcrypto" with schema "extensions"; -- version 1.3
create extension if not exists "plpgsql" with schema "pg_catalog"; -- version 1.0
create extension if not exists "supabase_vault" with schema "vault"; -- version 0.3.1
create extension if not exists "uuid-ossp" with schema "extensions"; -- version 1.1


-- -----------------------------------------------------------------------------
-- Functions
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.accept_workspace_invites_for_current_user()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.get_platform_admin_summary()
 RETURNS TABLE(admin_email text, auth_user_count bigint, profile_count bigint, workspace_count bigint, client_count bigint, job_count bigint, invoice_count bigint, document_count bigint, route_plan_count bigint)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
begin
  if not public.is_platform_admin() then
    return;
  end if;

  return query
  select
    lower(coalesce(auth.jwt() ->> 'email', platform_admins.email)) as admin_email,
    (select count(*) from auth.users) as auth_user_count,
    (select count(*) from public.profiles) as profile_count,
    (select count(*) from public.workspaces) as workspace_count,
    (select count(*) from public.clients) as client_count,
    (select count(*) from public.jobs) as job_count,
    (select count(*) from public.invoices) as invoice_count,
    (select count(*) from public.documents) as document_count,
    (select count(*) from public.route_plans) as route_plan_count
  from public.platform_admins
  where platform_admins.user_id = auth.uid()
  limit 1;
end;
$function$;

CREATE OR REPLACE FUNCTION public.is_platform_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1
    from public.platform_admins
    where user_id = auth.uid()
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_workspace_creator(target_workspace_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1
    from public.workspaces
    where id = target_workspace_id
      and created_by = auth.uid()
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_workspace_manager(target_workspace_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1
    from public.workspace_members
    where workspace_id = target_workspace_id
      and user_id = auth.uid()
      and status = 'Active'
      and role in ('Owner', 'Manager')
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_workspace_member(target_workspace_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1
    from public.workspace_members
    where workspace_id = target_workspace_id
      and user_id = auth.uid()
      and status = 'Active'
  );
$function$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;



-- -----------------------------------------------------------------------------
-- Views
-- -----------------------------------------------------------------------------
-- No public views found.


-- -----------------------------------------------------------------------------
-- Sequences
-- -----------------------------------------------------------------------------
-- No public sequences found.


-- -----------------------------------------------------------------------------
-- Tables and Columns
-- -----------------------------------------------------------------------------
create table public."admin_audit_logs" (
  "id" uuid default gen_random_uuid() not null,
  "admin_user_id" uuid not null,
  "target_user_id" uuid,
  "target_workspace_id" uuid,
  "action" text not null,
  "metadata" jsonb default '{}'::jsonb not null,
  "created_at" timestamp with time zone default now() not null
);

create table public."ai_jobs" (
  "id" uuid default gen_random_uuid() not null,
  "workspace_id" uuid not null,
  "document_id" uuid,
  "client_id" uuid,
  "job_id" uuid,
  "invoice_id" uuid,
  "expense_id" uuid,
  "workflow_name" text not null,
  "status" text default 'Queued'::text not null,
  "model_provider" text,
  "model_name" text,
  "prompt_version" text,
  "input_json" jsonb default '{}'::jsonb not null,
  "result_json" jsonb,
  "confidence" numeric,
  "error_message" text,
  "approved_by" uuid,
  "approved_at" timestamp with time zone,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null
);

create table public."client_activity" (
  "id" uuid default gen_random_uuid() not null,
  "workspace_id" uuid not null,
  "client_id" uuid not null,
  "activity_type" text not null,
  "title" text not null,
  "body" text,
  "metadata" jsonb default '{}'::jsonb not null,
  "created_by" uuid,
  "created_at" timestamp with time zone default now() not null
);

create table public."client_calendar_events" (
  "id" uuid default gen_random_uuid() not null,
  "workspace_id" uuid not null,
  "client_id" uuid,
  "client_name_snapshot" text,
  "title" text not null,
  "event_date" date not null,
  "notes" text,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null
);

create table public."client_notes" (
  "id" uuid default gen_random_uuid() not null,
  "workspace_id" uuid not null,
  "client_id" uuid not null,
  "body" text not null,
  "created_by" uuid,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null
);

create table public."clients" (
  "id" uuid default gen_random_uuid() not null,
  "workspace_id" uuid not null,
  "name" text not null,
  "status" text default 'Active'::text not null,
  "balance_cents" integer default 0 not null,
  "email" text,
  "phone" text,
  "address" text,
  "city" text,
  "state" text,
  "zip" text,
  "notes" text,
  "latitude" numeric(10,7),
  "longitude" numeric(10,7),
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null
);

create table public."document_tag_links" (
  "id" uuid default gen_random_uuid() not null,
  "workspace_id" uuid not null,
  "document_id" uuid not null,
  "tag_id" uuid not null,
  "created_at" timestamp with time zone default now() not null
);

create table public."document_tags" (
  "id" uuid default gen_random_uuid() not null,
  "workspace_id" uuid not null,
  "name" text not null,
  "color" text,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null
);

create table public."documents" (
  "id" uuid default gen_random_uuid() not null,
  "workspace_id" uuid not null,
  "client_id" uuid,
  "job_id" uuid,
  "invoice_id" uuid,
  "estimate_id" uuid,
  "expense_id" uuid,
  "name" text not null,
  "detected_type" text,
  "extraction_status" text,
  "file_name" text,
  "storage_bucket" text,
  "storage_path" text,
  "mime_type" text,
  "size_bytes" bigint,
  "notes" text,
  "extracted_json" jsonb,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null
);

create table public."estimate_line_items" (
  "id" uuid default gen_random_uuid() not null,
  "workspace_id" uuid not null,
  "estimate_id" uuid not null,
  "description" text not null,
  "quantity" numeric default 1 not null,
  "unit_price_cents" integer default 0 not null,
  "sort_order" integer default 0 not null,
  "created_at" timestamp with time zone default now() not null
);

create table public."estimates" (
  "id" uuid default gen_random_uuid() not null,
  "workspace_id" uuid not null,
  "client_id" uuid,
  "job_id" uuid,
  "estimate_number" text not null,
  "estimate_date" date not null,
  "converted_invoice_id" uuid,
  "company_name" text,
  "company_address" text,
  "company_city" text,
  "company_state" text,
  "company_zip" text,
  "company_phone" text,
  "company_email" text,
  "bill_to_name" text,
  "bill_to_company" text,
  "bill_to_address" text,
  "bill_to_city" text,
  "bill_to_state" text,
  "bill_to_zip" text,
  "bill_to_phone" text,
  "bill_to_email" text,
  "discount_type" text default 'None'::text not null,
  "discount_value" numeric default 0 not null,
  "tax_rate" numeric default 0 not null,
  "footer_message" text,
  "contact_message" text,
  "status" text default 'Draft'::text not null,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null
);

create table public."expenses" (
  "id" uuid default gen_random_uuid() not null,
  "workspace_id" uuid not null,
  "description" text not null,
  "category" text not null,
  "amount_cents" integer default 0 not null,
  "expense_date" date,
  "notes" text,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null
);

create table public."inventory_items" (
  "id" uuid default gen_random_uuid() not null,
  "workspace_id" uuid not null,
  "name" text not null,
  "current_qty" numeric,
  "target_qty" numeric,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null
);

create table public."invoice_line_items" (
  "id" uuid default gen_random_uuid() not null,
  "workspace_id" uuid not null,
  "invoice_id" uuid not null,
  "description" text not null,
  "quantity" numeric default 1 not null,
  "unit_price_cents" integer default 0 not null,
  "sort_order" integer default 0 not null,
  "created_at" timestamp with time zone default now() not null
);

create table public."invoice_payments" (
  "id" uuid default gen_random_uuid() not null,
  "workspace_id" uuid not null,
  "invoice_id" uuid not null,
  "amount_cents" integer not null,
  "payment_date" date default CURRENT_DATE not null,
  "method" text,
  "reference" text,
  "notes" text,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null
);

create table public."invoices" (
  "id" uuid default gen_random_uuid() not null,
  "workspace_id" uuid not null,
  "client_id" uuid,
  "job_id" uuid,
  "source_estimate_id" uuid,
  "invoice_number" text not null,
  "invoice_date" date not null,
  "due_date" date,
  "company_name" text,
  "company_address" text,
  "company_city" text,
  "company_state" text,
  "company_zip" text,
  "company_phone" text,
  "company_email" text,
  "bill_to_name" text,
  "bill_to_company" text,
  "bill_to_address" text,
  "bill_to_city" text,
  "bill_to_state" text,
  "bill_to_zip" text,
  "bill_to_phone" text,
  "bill_to_email" text,
  "discount_type" text default 'None'::text not null,
  "discount_value" numeric default 0 not null,
  "tax_rate" numeric default 0 not null,
  "footer_message" text,
  "contact_message" text,
  "sent_at" timestamp with time zone,
  "paid_at" timestamp with time zone,
  "email_status" text,
  "status" text default 'Draft'::text not null,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null
);

create table public."job_activity" (
  "id" uuid default gen_random_uuid() not null,
  "workspace_id" uuid not null,
  "job_id" uuid not null,
  "activity_type" text not null,
  "title" text not null,
  "body" text,
  "metadata" jsonb default '{}'::jsonb not null,
  "created_by" uuid,
  "created_at" timestamp with time zone default now() not null
);

create table public."job_materials" (
  "id" uuid default gen_random_uuid() not null,
  "workspace_id" uuid not null,
  "job_id" uuid not null,
  "name" text not null,
  "quantity" numeric default 0 not null,
  "created_at" timestamp with time zone default now() not null
);

create table public."jobs" (
  "id" uuid default gen_random_uuid() not null,
  "workspace_id" uuid not null,
  "client_id" uuid,
  "client_name_snapshot" text,
  "name" text not null,
  "status" text default 'Lead'::text not null,
  "estimated_value_cents" integer default 0 not null,
  "scheduled_date" date,
  "notes" text,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null
);

create table public."platform_admins" (
  "user_id" uuid not null,
  "email" text not null,
  "role" text default 'Admin'::text not null,
  "created_at" timestamp with time zone default now() not null
);

create table public."profiles" (
  "id" uuid not null,
  "display_name" text,
  "email" text,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null
);

create table public."route_plan_stops" (
  "id" uuid default gen_random_uuid() not null,
  "workspace_id" uuid not null,
  "route_plan_id" uuid not null,
  "client_id" uuid,
  "stop_order" integer not null,
  "latitude" numeric(10,7),
  "longitude" numeric(10,7),
  "address_snapshot" text,
  "created_at" timestamp with time zone default now() not null
);

create table public."route_plans" (
  "id" uuid default gen_random_uuid() not null,
  "workspace_id" uuid not null,
  "name" text not null,
  "total_distance_meters" integer,
  "total_duration_seconds" integer,
  "google_maps_url" text,
  "notes" text,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null
);

create table public."workspace_members" (
  "id" uuid default gen_random_uuid() not null,
  "workspace_id" uuid not null,
  "user_id" uuid,
  "role" text not null,
  "status" text default 'Active'::text not null,
  "invited_email" text,
  "invited_by" uuid,
  "invite_token" text,
  "invite_expires_at" timestamp with time zone,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null
);

create table public."workspace_settings" (
  "workspace_id" uuid not null,
  "company_name" text,
  "company_address" text,
  "company_city" text,
  "company_state" text,
  "company_zip" text,
  "company_phone" text,
  "company_email" text,
  "company_website" text,
  "default_invoice_terms" text,
  "default_footer_message" text,
  "default_contact_message" text,
  "default_invoice_status" text default 'Draft'::text not null,
  "tax_state" text,
  "default_tax_rate" numeric default 0 not null,
  "tax_location_mode" text default 'Business location'::text not null,
  "discount_before_tax" boolean default true not null,
  "workspace_nickname" text,
  "business_type" text,
  "notes" text,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null
);

create table public."workspaces" (
  "id" uuid default gen_random_uuid() not null,
  "name" text not null,
  "type" text default 'Other'::text not null,
  "created_by" uuid,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null
);



-- -----------------------------------------------------------------------------
-- Constraints
-- -----------------------------------------------------------------------------
alter table admin_audit_logs add constraint "admin_audit_logs_pkey" PRIMARY KEY (id);
alter table admin_audit_logs add constraint "admin_audit_logs_admin_user_id_fkey" FOREIGN KEY (admin_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table admin_audit_logs add constraint "admin_audit_logs_target_user_id_fkey" FOREIGN KEY (target_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
alter table admin_audit_logs add constraint "admin_audit_logs_target_workspace_id_fkey" FOREIGN KEY (target_workspace_id) REFERENCES workspaces(id) ON DELETE SET NULL;
alter table ai_jobs add constraint "ai_jobs_pkey" PRIMARY KEY (id);
alter table ai_jobs add constraint "ai_jobs_approved_by_fkey" FOREIGN KEY (approved_by) REFERENCES profiles(id) ON DELETE SET NULL;
alter table ai_jobs add constraint "ai_jobs_client_id_fkey" FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;
alter table ai_jobs add constraint "ai_jobs_document_id_fkey" FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE SET NULL;
alter table ai_jobs add constraint "ai_jobs_expense_id_fkey" FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE SET NULL;
alter table ai_jobs add constraint "ai_jobs_invoice_id_fkey" FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL;
alter table ai_jobs add constraint "ai_jobs_job_id_fkey" FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL;
alter table ai_jobs add constraint "ai_jobs_workspace_id_fkey" FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;
alter table ai_jobs add constraint "ai_jobs_status_check" CHECK ((status = ANY (ARRAY['Queued'::text, 'Processing'::text, 'Needs Review'::text, 'Approved'::text, 'Failed'::text])));
alter table client_activity add constraint "client_activity_pkey" PRIMARY KEY (id);
alter table client_activity add constraint "client_activity_client_id_fkey" FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;
alter table client_activity add constraint "client_activity_created_by_fkey" FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;
alter table client_activity add constraint "client_activity_workspace_id_fkey" FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;
alter table client_calendar_events add constraint "client_calendar_events_pkey" PRIMARY KEY (id);
alter table client_calendar_events add constraint "client_calendar_events_client_id_fkey" FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;
alter table client_calendar_events add constraint "client_calendar_events_workspace_id_fkey" FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;
alter table client_notes add constraint "client_notes_pkey" PRIMARY KEY (id);
alter table client_notes add constraint "client_notes_client_id_fkey" FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;
alter table client_notes add constraint "client_notes_created_by_fkey" FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;
alter table client_notes add constraint "client_notes_workspace_id_fkey" FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;
alter table clients add constraint "clients_pkey" PRIMARY KEY (id);
alter table clients add constraint "clients_workspace_id_fkey" FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;
alter table clients add constraint "clients_status_check" CHECK ((status = ANY (ARRAY['Lead'::text, 'Active'::text, 'Inactive'::text])));
alter table document_tag_links add constraint "document_tag_links_pkey" PRIMARY KEY (id);
alter table document_tag_links add constraint "document_tag_links_document_id_tag_id_key" UNIQUE (document_id, tag_id);
alter table document_tag_links add constraint "document_tag_links_document_id_fkey" FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE;
alter table document_tag_links add constraint "document_tag_links_tag_id_fkey" FOREIGN KEY (tag_id) REFERENCES document_tags(id) ON DELETE CASCADE;
alter table document_tag_links add constraint "document_tag_links_workspace_id_fkey" FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;
alter table document_tags add constraint "document_tags_pkey" PRIMARY KEY (id);
alter table document_tags add constraint "document_tags_workspace_id_fkey" FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;
alter table documents add constraint "documents_pkey" PRIMARY KEY (id);
alter table documents add constraint "documents_client_id_fkey" FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;
alter table documents add constraint "documents_estimate_id_fkey" FOREIGN KEY (estimate_id) REFERENCES estimates(id) ON DELETE SET NULL;
alter table documents add constraint "documents_expense_id_fkey" FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE SET NULL;
alter table documents add constraint "documents_invoice_id_fkey" FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL;
alter table documents add constraint "documents_job_id_fkey" FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL;
alter table documents add constraint "documents_workspace_id_fkey" FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;
alter table estimate_line_items add constraint "estimate_line_items_pkey" PRIMARY KEY (id);
alter table estimate_line_items add constraint "estimate_line_items_estimate_id_fkey" FOREIGN KEY (estimate_id) REFERENCES estimates(id) ON DELETE CASCADE;
alter table estimate_line_items add constraint "estimate_line_items_workspace_id_fkey" FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;
alter table estimates add constraint "estimates_pkey" PRIMARY KEY (id);
alter table estimates add constraint "estimates_client_id_fkey" FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;
alter table estimates add constraint "estimates_converted_invoice_fk" FOREIGN KEY (converted_invoice_id) REFERENCES invoices(id) ON DELETE SET NULL;
alter table estimates add constraint "estimates_job_id_fkey" FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL;
alter table estimates add constraint "estimates_workspace_id_fkey" FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;
alter table estimates add constraint "estimates_discount_type_check" CHECK ((discount_type = ANY (ARRAY['None'::text, 'Percent'::text, 'Fixed'::text])));
alter table estimates add constraint "estimates_status_check" CHECK ((status = ANY (ARRAY['Draft'::text, 'Sent'::text, 'Accepted'::text, 'Declined'::text, 'Expired'::text, 'Converted'::text])));
alter table expenses add constraint "expenses_pkey" PRIMARY KEY (id);
alter table expenses add constraint "expenses_workspace_id_fkey" FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;
alter table inventory_items add constraint "inventory_items_pkey" PRIMARY KEY (id);
alter table inventory_items add constraint "inventory_items_workspace_id_fkey" FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;
alter table invoice_line_items add constraint "invoice_line_items_pkey" PRIMARY KEY (id);
alter table invoice_line_items add constraint "invoice_line_items_invoice_id_fkey" FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE;
alter table invoice_line_items add constraint "invoice_line_items_workspace_id_fkey" FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;
alter table invoice_payments add constraint "invoice_payments_pkey" PRIMARY KEY (id);
alter table invoice_payments add constraint "invoice_payments_invoice_id_fkey" FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE;
alter table invoice_payments add constraint "invoice_payments_workspace_id_fkey" FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;
alter table invoice_payments add constraint "invoice_payments_amount_cents_check" CHECK ((amount_cents >= 0));
alter table invoices add constraint "invoices_pkey" PRIMARY KEY (id);
alter table invoices add constraint "invoices_client_id_fkey" FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;
alter table invoices add constraint "invoices_job_id_fkey" FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL;
alter table invoices add constraint "invoices_source_estimate_id_fkey" FOREIGN KEY (source_estimate_id) REFERENCES estimates(id) ON DELETE SET NULL;
alter table invoices add constraint "invoices_workspace_id_fkey" FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;
alter table invoices add constraint "invoices_discount_type_check" CHECK ((discount_type = ANY (ARRAY['None'::text, 'Percent'::text, 'Fixed'::text])));
alter table invoices add constraint "invoices_status_check" CHECK ((status = ANY (ARRAY['Draft'::text, 'Sent'::text, 'Overdue'::text, 'Paid'::text])));
alter table job_activity add constraint "job_activity_pkey" PRIMARY KEY (id);
alter table job_activity add constraint "job_activity_created_by_fkey" FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;
alter table job_activity add constraint "job_activity_job_id_fkey" FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;
alter table job_activity add constraint "job_activity_workspace_id_fkey" FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;
alter table job_materials add constraint "job_materials_pkey" PRIMARY KEY (id);
alter table job_materials add constraint "job_materials_job_id_fkey" FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;
alter table job_materials add constraint "job_materials_workspace_id_fkey" FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;
alter table jobs add constraint "jobs_pkey" PRIMARY KEY (id);
alter table jobs add constraint "jobs_client_id_fkey" FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;
alter table jobs add constraint "jobs_workspace_id_fkey" FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;
alter table jobs add constraint "jobs_status_check" CHECK ((status = ANY (ARRAY['Lead'::text, 'Quoted'::text, 'Scheduled'::text, 'Completed'::text, 'Paid'::text])));
alter table platform_admins add constraint "platform_admins_pkey" PRIMARY KEY (user_id);
alter table platform_admins add constraint "platform_admins_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table platform_admins add constraint "platform_admins_email_normalized_check" CHECK ((email = lower(TRIM(BOTH FROM email))));
alter table platform_admins add constraint "platform_admins_role_check" CHECK ((role = ANY (ARRAY['Owner'::text, 'Admin'::text, 'Support'::text])));
alter table profiles add constraint "profiles_pkey" PRIMARY KEY (id);
alter table profiles add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table route_plan_stops add constraint "route_plan_stops_pkey" PRIMARY KEY (id);
alter table route_plan_stops add constraint "route_plan_stops_route_plan_id_stop_order_key" UNIQUE (route_plan_id, stop_order);
alter table route_plan_stops add constraint "route_plan_stops_client_id_fkey" FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;
alter table route_plan_stops add constraint "route_plan_stops_route_plan_id_fkey" FOREIGN KEY (route_plan_id) REFERENCES route_plans(id) ON DELETE CASCADE;
alter table route_plan_stops add constraint "route_plan_stops_workspace_id_fkey" FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;
alter table route_plans add constraint "route_plans_pkey" PRIMARY KEY (id);
alter table route_plans add constraint "route_plans_workspace_id_fkey" FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;
alter table workspace_members add constraint "workspace_members_pkey" PRIMARY KEY (id);
alter table workspace_members add constraint "workspace_members_invited_by_fkey" FOREIGN KEY (invited_by) REFERENCES profiles(id) ON DELETE SET NULL;
alter table workspace_members add constraint "workspace_members_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
alter table workspace_members add constraint "workspace_members_workspace_id_fkey" FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;
alter table workspace_members add constraint "workspace_members_role_check" CHECK ((role = ANY (ARRAY['Owner'::text, 'Manager'::text, 'Employee'::text])));
alter table workspace_members add constraint "workspace_members_status_check" CHECK ((status = ANY (ARRAY['Active'::text, 'Invited'::text, 'Removed'::text])));
alter table workspace_members add constraint "workspace_members_user_or_email_check" CHECK (((user_id IS NOT NULL) OR (invited_email IS NOT NULL)));
alter table workspace_settings add constraint "workspace_settings_pkey" PRIMARY KEY (workspace_id);
alter table workspace_settings add constraint "workspace_settings_workspace_id_fkey" FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;
alter table workspace_settings add constraint "workspace_settings_default_invoice_status_check" CHECK ((default_invoice_status = ANY (ARRAY['Draft'::text, 'Sent'::text])));
alter table workspace_settings add constraint "workspace_settings_tax_location_mode_check" CHECK ((tax_location_mode = ANY (ARRAY['Business location'::text, 'Job location'::text])));
alter table workspaces add constraint "workspaces_pkey" PRIMARY KEY (id);
alter table workspaces add constraint "workspaces_created_by_fkey" FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;


-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------
CREATE INDEX admin_audit_logs_action_created_idx ON public.admin_audit_logs USING btree (action, created_at DESC);
CREATE INDEX admin_audit_logs_admin_user_idx ON public.admin_audit_logs USING btree (admin_user_id);
CREATE INDEX admin_audit_logs_target_user_idx ON public.admin_audit_logs USING btree (target_user_id);
CREATE INDEX admin_audit_logs_target_workspace_idx ON public.admin_audit_logs USING btree (target_workspace_id);
CREATE INDEX ai_jobs_document_idx ON public.ai_jobs USING btree (document_id);
CREATE INDEX ai_jobs_status_idx ON public.ai_jobs USING btree (status);
CREATE INDEX ai_jobs_workspace_idx ON public.ai_jobs USING btree (workspace_id);
CREATE INDEX client_activity_client_idx ON public.client_activity USING btree (client_id);
CREATE INDEX client_activity_workspace_idx ON public.client_activity USING btree (workspace_id);
CREATE INDEX client_calendar_events_client_idx ON public.client_calendar_events USING btree (client_id);
CREATE INDEX client_calendar_events_date_idx ON public.client_calendar_events USING btree (event_date);
CREATE INDEX client_calendar_events_workspace_idx ON public.client_calendar_events USING btree (workspace_id);
CREATE INDEX client_notes_client_idx ON public.client_notes USING btree (client_id);
CREATE INDEX client_notes_workspace_idx ON public.client_notes USING btree (workspace_id);
CREATE INDEX clients_workspace_idx ON public.clients USING btree (workspace_id);
CREATE UNIQUE INDEX clients_workspace_name_uidx ON public.clients USING btree (workspace_id, lower(name));
CREATE INDEX document_tag_links_document_idx ON public.document_tag_links USING btree (document_id);
CREATE INDEX document_tag_links_tag_idx ON public.document_tag_links USING btree (tag_id);
CREATE INDEX document_tag_links_workspace_idx ON public.document_tag_links USING btree (workspace_id);
CREATE INDEX document_tags_workspace_idx ON public.document_tags USING btree (workspace_id);
CREATE UNIQUE INDEX document_tags_workspace_name_uidx ON public.document_tags USING btree (workspace_id, lower(name));
CREATE INDEX documents_client_idx ON public.documents USING btree (client_id);
CREATE INDEX documents_estimate_idx ON public.documents USING btree (estimate_id);
CREATE INDEX documents_expense_idx ON public.documents USING btree (expense_id);
CREATE INDEX documents_invoice_idx ON public.documents USING btree (invoice_id);
CREATE INDEX documents_job_idx ON public.documents USING btree (job_id);
CREATE INDEX documents_workspace_idx ON public.documents USING btree (workspace_id);
CREATE INDEX estimate_line_items_estimate_idx ON public.estimate_line_items USING btree (estimate_id);
CREATE INDEX estimate_line_items_workspace_idx ON public.estimate_line_items USING btree (workspace_id);
CREATE INDEX estimates_client_idx ON public.estimates USING btree (client_id);
CREATE INDEX estimates_date_idx ON public.estimates USING btree (estimate_date);
CREATE INDEX estimates_job_idx ON public.estimates USING btree (job_id);
CREATE INDEX estimates_status_idx ON public.estimates USING btree (status);
CREATE INDEX estimates_workspace_idx ON public.estimates USING btree (workspace_id);
CREATE UNIQUE INDEX estimates_workspace_number_uidx ON public.estimates USING btree (workspace_id, estimate_number);
CREATE INDEX expenses_category_idx ON public.expenses USING btree (category);
CREATE INDEX expenses_date_idx ON public.expenses USING btree (expense_date);
CREATE INDEX expenses_workspace_idx ON public.expenses USING btree (workspace_id);
CREATE INDEX inventory_items_workspace_idx ON public.inventory_items USING btree (workspace_id);
CREATE UNIQUE INDEX inventory_items_workspace_name_uidx ON public.inventory_items USING btree (workspace_id, lower(name));
CREATE INDEX invoice_line_items_invoice_idx ON public.invoice_line_items USING btree (invoice_id);
CREATE INDEX invoice_line_items_workspace_idx ON public.invoice_line_items USING btree (workspace_id);
CREATE INDEX invoice_payments_date_idx ON public.invoice_payments USING btree (payment_date);
CREATE INDEX invoice_payments_invoice_idx ON public.invoice_payments USING btree (invoice_id);
CREATE INDEX invoice_payments_workspace_idx ON public.invoice_payments USING btree (workspace_id);
CREATE INDEX invoices_client_idx ON public.invoices USING btree (client_id);
CREATE INDEX invoices_date_idx ON public.invoices USING btree (invoice_date);
CREATE INDEX invoices_job_idx ON public.invoices USING btree (job_id);
CREATE INDEX invoices_source_estimate_idx ON public.invoices USING btree (source_estimate_id);
CREATE INDEX invoices_status_idx ON public.invoices USING btree (status);
CREATE INDEX invoices_workspace_idx ON public.invoices USING btree (workspace_id);
CREATE UNIQUE INDEX invoices_workspace_number_uidx ON public.invoices USING btree (workspace_id, invoice_number);
CREATE INDEX job_activity_job_idx ON public.job_activity USING btree (job_id);
CREATE INDEX job_activity_workspace_idx ON public.job_activity USING btree (workspace_id);
CREATE INDEX job_materials_job_idx ON public.job_materials USING btree (job_id);
CREATE INDEX job_materials_name_idx ON public.job_materials USING btree (lower(name));
CREATE INDEX job_materials_workspace_idx ON public.job_materials USING btree (workspace_id);
CREATE INDEX jobs_client_idx ON public.jobs USING btree (client_id);
CREATE INDEX jobs_scheduled_date_idx ON public.jobs USING btree (scheduled_date);
CREATE INDEX jobs_workspace_idx ON public.jobs USING btree (workspace_id);
CREATE INDEX route_plan_stops_client_idx ON public.route_plan_stops USING btree (client_id);
CREATE INDEX route_plan_stops_route_idx ON public.route_plan_stops USING btree (route_plan_id);
CREATE INDEX route_plan_stops_workspace_idx ON public.route_plan_stops USING btree (workspace_id);
CREATE INDEX route_plans_workspace_idx ON public.route_plans USING btree (workspace_id);
CREATE UNIQUE INDEX workspace_members_invite_token_uidx ON public.workspace_members USING btree (invite_token) WHERE (invite_token IS NOT NULL);
CREATE INDEX workspace_members_user_idx ON public.workspace_members USING btree (user_id);
CREATE INDEX workspace_members_workspace_idx ON public.workspace_members USING btree (workspace_id);
CREATE UNIQUE INDEX workspace_members_workspace_user_uidx ON public.workspace_members USING btree (workspace_id, user_id) WHERE (user_id IS NOT NULL);


-- -----------------------------------------------------------------------------
-- Triggers
-- -----------------------------------------------------------------------------
create trigger "ai_jobs_set_updated_at" BEFORE UPDATE on public."ai_jobs" for each row EXECUTE FUNCTION set_updated_at();
create trigger "client_calendar_events_set_updated_at" BEFORE UPDATE on public."client_calendar_events" for each row EXECUTE FUNCTION set_updated_at();
create trigger "client_notes_set_updated_at" BEFORE UPDATE on public."client_notes" for each row EXECUTE FUNCTION set_updated_at();
create trigger "clients_set_updated_at" BEFORE UPDATE on public."clients" for each row EXECUTE FUNCTION set_updated_at();
create trigger "document_tags_set_updated_at" BEFORE UPDATE on public."document_tags" for each row EXECUTE FUNCTION set_updated_at();
create trigger "documents_set_updated_at" BEFORE UPDATE on public."documents" for each row EXECUTE FUNCTION set_updated_at();
create trigger "estimates_set_updated_at" BEFORE UPDATE on public."estimates" for each row EXECUTE FUNCTION set_updated_at();
create trigger "expenses_set_updated_at" BEFORE UPDATE on public."expenses" for each row EXECUTE FUNCTION set_updated_at();
create trigger "inventory_items_set_updated_at" BEFORE UPDATE on public."inventory_items" for each row EXECUTE FUNCTION set_updated_at();
create trigger "invoice_payments_set_updated_at" BEFORE UPDATE on public."invoice_payments" for each row EXECUTE FUNCTION set_updated_at();
create trigger "invoices_set_updated_at" BEFORE UPDATE on public."invoices" for each row EXECUTE FUNCTION set_updated_at();
create trigger "jobs_set_updated_at" BEFORE UPDATE on public."jobs" for each row EXECUTE FUNCTION set_updated_at();
create trigger "profiles_set_updated_at" BEFORE UPDATE on public."profiles" for each row EXECUTE FUNCTION set_updated_at();
create trigger "route_plans_set_updated_at" BEFORE UPDATE on public."route_plans" for each row EXECUTE FUNCTION set_updated_at();
create trigger "workspace_members_set_updated_at" BEFORE UPDATE on public."workspace_members" for each row EXECUTE FUNCTION set_updated_at();
create trigger "workspace_settings_set_updated_at" BEFORE UPDATE on public."workspace_settings" for each row EXECUTE FUNCTION set_updated_at();
create trigger "workspaces_set_updated_at" BEFORE UPDATE on public."workspaces" for each row EXECUTE FUNCTION set_updated_at();


-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
alter table public."admin_audit_logs" enable row level security;
alter table public."ai_jobs" enable row level security;
alter table public."client_activity" enable row level security;
alter table public."client_calendar_events" enable row level security;
alter table public."client_notes" enable row level security;
alter table public."clients" enable row level security;
alter table public."document_tag_links" enable row level security;
alter table public."document_tags" enable row level security;
alter table public."documents" enable row level security;
alter table public."estimate_line_items" enable row level security;
alter table public."estimates" enable row level security;
alter table public."expenses" enable row level security;
alter table public."inventory_items" enable row level security;
alter table public."invoice_line_items" enable row level security;
alter table public."invoice_payments" enable row level security;
alter table public."invoices" enable row level security;
alter table public."job_activity" enable row level security;
alter table public."job_materials" enable row level security;
alter table public."jobs" enable row level security;
alter table public."platform_admins" enable row level security;
alter table public."profiles" enable row level security;
alter table public."route_plan_stops" enable row level security;
alter table public."route_plans" enable row level security;
alter table public."workspace_members" enable row level security;
alter table public."workspace_settings" enable row level security;
alter table public."workspaces" enable row level security;


-- -----------------------------------------------------------------------------
-- Policies
-- -----------------------------------------------------------------------------
create policy "Platform admins can read admin audit logs"
  on public."admin_audit_logs"
  as permissive
  for select
  to "public"
  using (is_platform_admin());

create policy "Workspace members can delete AI jobs"
  on public."ai_jobs"
  as permissive
  for delete
  to "public"
  using (is_workspace_member(workspace_id));

create policy "Workspace members can insert AI jobs"
  on public."ai_jobs"
  as permissive
  for insert
  to "public"
  with check (is_workspace_member(workspace_id));

create policy "Workspace members can read AI jobs"
  on public."ai_jobs"
  as permissive
  for select
  to "public"
  using (is_workspace_member(workspace_id));

create policy "Workspace members can update AI jobs"
  on public."ai_jobs"
  as permissive
  for update
  to "public"
  using (is_workspace_member(workspace_id))
  with check (is_workspace_member(workspace_id));

create policy "Workspace members can delete client activity"
  on public."client_activity"
  as permissive
  for delete
  to "public"
  using (is_workspace_member(workspace_id));

create policy "Workspace members can insert client activity"
  on public."client_activity"
  as permissive
  for insert
  to "public"
  with check (is_workspace_member(workspace_id));

create policy "Workspace members can read client activity"
  on public."client_activity"
  as permissive
  for select
  to "public"
  using (is_workspace_member(workspace_id));

create policy "Workspace members can update client activity"
  on public."client_activity"
  as permissive
  for update
  to "public"
  using (is_workspace_member(workspace_id))
  with check (is_workspace_member(workspace_id));

create policy "Workspace members can delete calendar events"
  on public."client_calendar_events"
  as permissive
  for delete
  to "public"
  using (is_workspace_member(workspace_id));

create policy "Workspace members can insert calendar events"
  on public."client_calendar_events"
  as permissive
  for insert
  to "public"
  with check (is_workspace_member(workspace_id));

create policy "Workspace members can read calendar events"
  on public."client_calendar_events"
  as permissive
  for select
  to "public"
  using (is_workspace_member(workspace_id));

create policy "Workspace members can update calendar events"
  on public."client_calendar_events"
  as permissive
  for update
  to "public"
  using (is_workspace_member(workspace_id))
  with check (is_workspace_member(workspace_id));

create policy "Workspace members can delete client notes"
  on public."client_notes"
  as permissive
  for delete
  to "public"
  using (is_workspace_member(workspace_id));

create policy "Workspace members can insert client notes"
  on public."client_notes"
  as permissive
  for insert
  to "public"
  with check (is_workspace_member(workspace_id));

create policy "Workspace members can read client notes"
  on public."client_notes"
  as permissive
  for select
  to "public"
  using (is_workspace_member(workspace_id));

create policy "Workspace members can update client notes"
  on public."client_notes"
  as permissive
  for update
  to "public"
  using (is_workspace_member(workspace_id))
  with check (is_workspace_member(workspace_id));

create policy "Workspace members can delete clients"
  on public."clients"
  as permissive
  for delete
  to "public"
  using (is_workspace_member(workspace_id));

create policy "Workspace members can insert clients"
  on public."clients"
  as permissive
  for insert
  to "public"
  with check (is_workspace_member(workspace_id));

create policy "Workspace members can read clients"
  on public."clients"
  as permissive
  for select
  to "public"
  using (is_workspace_member(workspace_id));

create policy "Workspace members can update clients"
  on public."clients"
  as permissive
  for update
  to "public"
  using (is_workspace_member(workspace_id))
  with check (is_workspace_member(workspace_id));

create policy "Workspace members can delete document tag links"
  on public."document_tag_links"
  as permissive
  for delete
  to "public"
  using (is_workspace_member(workspace_id));

create policy "Workspace members can insert document tag links"
  on public."document_tag_links"
  as permissive
  for insert
  to "public"
  with check (is_workspace_member(workspace_id));

create policy "Workspace members can read document tag links"
  on public."document_tag_links"
  as permissive
  for select
  to "public"
  using (is_workspace_member(workspace_id));

create policy "Workspace members can update document tag links"
  on public."document_tag_links"
  as permissive
  for update
  to "public"
  using (is_workspace_member(workspace_id))
  with check (is_workspace_member(workspace_id));

create policy "Workspace members can delete document tags"
  on public."document_tags"
  as permissive
  for delete
  to "public"
  using (is_workspace_member(workspace_id));

create policy "Workspace members can insert document tags"
  on public."document_tags"
  as permissive
  for insert
  to "public"
  with check (is_workspace_member(workspace_id));

create policy "Workspace members can read document tags"
  on public."document_tags"
  as permissive
  for select
  to "public"
  using (is_workspace_member(workspace_id));

create policy "Workspace members can update document tags"
  on public."document_tags"
  as permissive
  for update
  to "public"
  using (is_workspace_member(workspace_id))
  with check (is_workspace_member(workspace_id));

create policy "Workspace members can delete documents"
  on public."documents"
  as permissive
  for delete
  to "public"
  using (is_workspace_member(workspace_id));

create policy "Workspace members can insert documents"
  on public."documents"
  as permissive
  for insert
  to "public"
  with check (is_workspace_member(workspace_id));

create policy "Workspace members can read documents"
  on public."documents"
  as permissive
  for select
  to "public"
  using (is_workspace_member(workspace_id));

create policy "Workspace members can update documents"
  on public."documents"
  as permissive
  for update
  to "public"
  using (is_workspace_member(workspace_id))
  with check (is_workspace_member(workspace_id));

create policy "Workspace members can delete estimate line items"
  on public."estimate_line_items"
  as permissive
  for delete
  to "public"
  using (is_workspace_member(workspace_id));

create policy "Workspace members can insert estimate line items"
  on public."estimate_line_items"
  as permissive
  for insert
  to "public"
  with check (is_workspace_member(workspace_id));

create policy "Workspace members can read estimate line items"
  on public."estimate_line_items"
  as permissive
  for select
  to "public"
  using (is_workspace_member(workspace_id));

create policy "Workspace members can update estimate line items"
  on public."estimate_line_items"
  as permissive
  for update
  to "public"
  using (is_workspace_member(workspace_id))
  with check (is_workspace_member(workspace_id));

create policy "Workspace members can delete estimates"
  on public."estimates"
  as permissive
  for delete
  to "public"
  using (is_workspace_member(workspace_id));

create policy "Workspace members can insert estimates"
  on public."estimates"
  as permissive
  for insert
  to "public"
  with check (is_workspace_member(workspace_id));

create policy "Workspace members can read estimates"
  on public."estimates"
  as permissive
  for select
  to "public"
  using (is_workspace_member(workspace_id));

create policy "Workspace members can update estimates"
  on public."estimates"
  as permissive
  for update
  to "public"
  using (is_workspace_member(workspace_id))
  with check (is_workspace_member(workspace_id));

create policy "Workspace members can delete expenses"
  on public."expenses"
  as permissive
  for delete
  to "public"
  using (is_workspace_member(workspace_id));

create policy "Workspace members can insert expenses"
  on public."expenses"
  as permissive
  for insert
  to "public"
  with check (is_workspace_member(workspace_id));

create policy "Workspace members can read expenses"
  on public."expenses"
  as permissive
  for select
  to "public"
  using (is_workspace_member(workspace_id));

create policy "Workspace members can update expenses"
  on public."expenses"
  as permissive
  for update
  to "public"
  using (is_workspace_member(workspace_id))
  with check (is_workspace_member(workspace_id));

create policy "Workspace members can delete inventory"
  on public."inventory_items"
  as permissive
  for delete
  to "public"
  using (is_workspace_member(workspace_id));

create policy "Workspace members can insert inventory"
  on public."inventory_items"
  as permissive
  for insert
  to "public"
  with check (is_workspace_member(workspace_id));

create policy "Workspace members can read inventory"
  on public."inventory_items"
  as permissive
  for select
  to "public"
  using (is_workspace_member(workspace_id));

create policy "Workspace members can update inventory"
  on public."inventory_items"
  as permissive
  for update
  to "public"
  using (is_workspace_member(workspace_id))
  with check (is_workspace_member(workspace_id));

create policy "Workspace members can delete invoice line items"
  on public."invoice_line_items"
  as permissive
  for delete
  to "public"
  using (is_workspace_member(workspace_id));

create policy "Workspace members can insert invoice line items"
  on public."invoice_line_items"
  as permissive
  for insert
  to "public"
  with check (is_workspace_member(workspace_id));

create policy "Workspace members can read invoice line items"
  on public."invoice_line_items"
  as permissive
  for select
  to "public"
  using (is_workspace_member(workspace_id));

create policy "Workspace members can update invoice line items"
  on public."invoice_line_items"
  as permissive
  for update
  to "public"
  using (is_workspace_member(workspace_id))
  with check (is_workspace_member(workspace_id));

create policy "Workspace members can delete invoice payments"
  on public."invoice_payments"
  as permissive
  for delete
  to "public"
  using (is_workspace_member(workspace_id));

create policy "Workspace members can insert invoice payments"
  on public."invoice_payments"
  as permissive
  for insert
  to "public"
  with check (is_workspace_member(workspace_id));

create policy "Workspace members can read invoice payments"
  on public."invoice_payments"
  as permissive
  for select
  to "public"
  using (is_workspace_member(workspace_id));

create policy "Workspace members can update invoice payments"
  on public."invoice_payments"
  as permissive
  for update
  to "public"
  using (is_workspace_member(workspace_id))
  with check (is_workspace_member(workspace_id));

create policy "Workspace members can delete invoices"
  on public."invoices"
  as permissive
  for delete
  to "public"
  using (is_workspace_member(workspace_id));

create policy "Workspace members can insert invoices"
  on public."invoices"
  as permissive
  for insert
  to "public"
  with check (is_workspace_member(workspace_id));

create policy "Workspace members can read invoices"
  on public."invoices"
  as permissive
  for select
  to "public"
  using (is_workspace_member(workspace_id));

create policy "Workspace members can update invoices"
  on public."invoices"
  as permissive
  for update
  to "public"
  using (is_workspace_member(workspace_id))
  with check (is_workspace_member(workspace_id));

create policy "Workspace members can delete job activity"
  on public."job_activity"
  as permissive
  for delete
  to "public"
  using (is_workspace_member(workspace_id));

create policy "Workspace members can insert job activity"
  on public."job_activity"
  as permissive
  for insert
  to "public"
  with check (is_workspace_member(workspace_id));

create policy "Workspace members can read job activity"
  on public."job_activity"
  as permissive
  for select
  to "public"
  using (is_workspace_member(workspace_id));

create policy "Workspace members can update job activity"
  on public."job_activity"
  as permissive
  for update
  to "public"
  using (is_workspace_member(workspace_id))
  with check (is_workspace_member(workspace_id));

create policy "Workspace members can delete job materials"
  on public."job_materials"
  as permissive
  for delete
  to "public"
  using (is_workspace_member(workspace_id));

create policy "Workspace members can insert job materials"
  on public."job_materials"
  as permissive
  for insert
  to "public"
  with check (is_workspace_member(workspace_id));

create policy "Workspace members can read job materials"
  on public."job_materials"
  as permissive
  for select
  to "public"
  using (is_workspace_member(workspace_id));

create policy "Workspace members can update job materials"
  on public."job_materials"
  as permissive
  for update
  to "public"
  using (is_workspace_member(workspace_id))
  with check (is_workspace_member(workspace_id));

create policy "Workspace members can delete jobs"
  on public."jobs"
  as permissive
  for delete
  to "public"
  using (is_workspace_member(workspace_id));

create policy "Workspace members can insert jobs"
  on public."jobs"
  as permissive
  for insert
  to "public"
  with check (is_workspace_member(workspace_id));

create policy "Workspace members can read jobs"
  on public."jobs"
  as permissive
  for select
  to "public"
  using (is_workspace_member(workspace_id));

create policy "Workspace members can update jobs"
  on public."jobs"
  as permissive
  for update
  to "public"
  using (is_workspace_member(workspace_id))
  with check (is_workspace_member(workspace_id));

create policy "Platform admins can read platform admins"
  on public."platform_admins"
  as permissive
  for select
  to "public"
  using (is_platform_admin());

create policy "Profiles are editable by owner"
  on public."profiles"
  as permissive
  for update
  to "public"
  using ((id = auth.uid()))
  with check ((id = auth.uid()));

create policy "Profiles are visible to owner"
  on public."profiles"
  as permissive
  for select
  to "public"
  using ((id = auth.uid()));

create policy "Profiles can be inserted by owner"
  on public."profiles"
  as permissive
  for insert
  to "public"
  with check ((id = auth.uid()));

create policy "Workspace members can delete route stops"
  on public."route_plan_stops"
  as permissive
  for delete
  to "public"
  using (is_workspace_member(workspace_id));

create policy "Workspace members can insert route stops"
  on public."route_plan_stops"
  as permissive
  for insert
  to "public"
  with check (is_workspace_member(workspace_id));

create policy "Workspace members can read route stops"
  on public."route_plan_stops"
  as permissive
  for select
  to "public"
  using (is_workspace_member(workspace_id));

create policy "Workspace members can update route stops"
  on public."route_plan_stops"
  as permissive
  for update
  to "public"
  using (is_workspace_member(workspace_id))
  with check (is_workspace_member(workspace_id));

create policy "Workspace members can delete route plans"
  on public."route_plans"
  as permissive
  for delete
  to "public"
  using (is_workspace_member(workspace_id));

create policy "Workspace members can insert route plans"
  on public."route_plans"
  as permissive
  for insert
  to "public"
  with check (is_workspace_member(workspace_id));

create policy "Workspace members can read route plans"
  on public."route_plans"
  as permissive
  for select
  to "public"
  using (is_workspace_member(workspace_id));

create policy "Workspace members can update route plans"
  on public."route_plans"
  as permissive
  for update
  to "public"
  using (is_workspace_member(workspace_id))
  with check (is_workspace_member(workspace_id));

create policy "Users can create their initial owner membership"
  on public."workspace_members"
  as permissive
  for insert
  to "public"
  with check (((auth.uid() IS NOT NULL) AND (user_id = auth.uid()) AND (role = 'Owner'::text) AND (status = 'Active'::text) AND is_workspace_creator(workspace_id)));

create policy "Workspace managers can create invited memberships"
  on public."workspace_members"
  as permissive
  for insert
  to "public"
  with check ((is_workspace_manager(workspace_id) AND (status = 'Invited'::text) AND (user_id IS NULL) AND (invited_email IS NOT NULL)));

create policy "Workspace managers can manage memberships"
  on public."workspace_members"
  as permissive
  for update
  to "public"
  using (is_workspace_manager(workspace_id))
  with check (is_workspace_manager(workspace_id));

create policy "Workspace managers can remove memberships"
  on public."workspace_members"
  as permissive
  for delete
  to "public"
  using (is_workspace_manager(workspace_id));

create policy "Workspace members can view memberships"
  on public."workspace_members"
  as permissive
  for select
  to "public"
  using ((is_workspace_member(workspace_id) OR (user_id = auth.uid())));

create policy "Workspace members can delete settings"
  on public."workspace_settings"
  as permissive
  for delete
  to "public"
  using (is_workspace_member(workspace_id));

create policy "Workspace members can insert settings"
  on public."workspace_settings"
  as permissive
  for insert
  to "public"
  with check (is_workspace_member(workspace_id));

create policy "Workspace members can read settings"
  on public."workspace_settings"
  as permissive
  for select
  to "public"
  using (is_workspace_member(workspace_id));

create policy "Workspace members can update settings"
  on public."workspace_settings"
  as permissive
  for update
  to "public"
  using (is_workspace_member(workspace_id))
  with check (is_workspace_member(workspace_id));

create policy "Authenticated users can create workspaces"
  on public."workspaces"
  as permissive
  for insert
  to "public"
  with check (((auth.uid() IS NOT NULL) AND (created_by = auth.uid())));

create policy "Workspace members can delete workspaces"
  on public."workspaces"
  as permissive
  for delete
  to "public"
  using (is_workspace_member(id));

create policy "Workspace members can update workspaces"
  on public."workspaces"
  as permissive
  for update
  to "public"
  using (is_workspace_member(id))
  with check (is_workspace_member(id));

create policy "Workspace members can view workspaces"
  on public."workspaces"
  as permissive
  for select
  to "public"
  using (is_workspace_member(id));

