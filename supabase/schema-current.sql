


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."accept_workspace_invites_for_current_user"() RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
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


ALTER FUNCTION "public"."accept_workspace_invites_for_current_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."capture_ai_review_draft_revision"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if old.source_label is distinct from new.source_label
     or old.summary is distinct from new.summary
     or old.actions is distinct from new.actions
     or old.warnings is distinct from new.warnings then
    insert into public.ai_review_draft_revisions (
      workspace_id,
      review_draft_id,
      source_label,
      summary,
      actions,
      warnings,
      changed_by
    ) values (
      old.workspace_id,
      old.id,
      old.source_label,
      old.summary,
      old.actions,
      old.warnings,
      auth.uid()
    );
  end if;
  return new;
end;
$$;


ALTER FUNCTION "public"."capture_ai_review_draft_revision"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."job_material_allocations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "job_id" "uuid",
    "material_id" "uuid" NOT NULL,
    "quantity" numeric NOT NULL,
    "mode" "text" DEFAULT 'Append'::"text" NOT NULL,
    "status" "text" DEFAULT 'Draft'::"text" NOT NULL,
    "source_document_id" "uuid",
    "review_draft_id" "uuid",
    "notes" "text",
    "created_by" "uuid" DEFAULT "auth"."uid"(),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "job_material_allocations_mode_check" CHECK (("mode" = ANY (ARRAY['Append'::"text", 'Merge'::"text", 'Replace'::"text"]))),
    CONSTRAINT "job_material_allocations_quantity_check" CHECK (("quantity" > (0)::numeric)),
    CONSTRAINT "job_material_allocations_status_check" CHECK (("status" = ANY (ARRAY['Draft'::"text", 'Applied'::"text", 'Rejected'::"text"])))
);


ALTER TABLE "public"."job_material_allocations" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_material_allocation_draft"("target_workspace_id" "uuid", "target_job_id" "uuid", "allocation_mode" "text", "material_rows" "jsonb", "source_document_id" "uuid" DEFAULT NULL::"uuid", "source_review_draft_id" "uuid" DEFAULT NULL::"uuid") RETURNS SETOF "public"."job_material_allocations"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
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


ALTER FUNCTION "public"."create_material_allocation_draft"("target_workspace_id" "uuid", "target_job_id" "uuid", "allocation_mode" "text", "material_rows" "jsonb", "source_document_id" "uuid", "source_review_draft_id" "uuid") OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."workspaces" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "type" "text" DEFAULT 'Other'::"text" NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."workspaces" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_workspace_with_owner"("workspace_id" "uuid", "workspace_name" "text", "workspace_type" "text") RETURNS "public"."workspaces"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
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


ALTER FUNCTION "public"."create_workspace_with_owner"("workspace_id" "uuid", "workspace_name" "text", "workspace_type" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."ensure_material_catalog_item"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
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


ALTER FUNCTION "public"."ensure_material_catalog_item"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_platform_admin_summary"() RETURNS TABLE("admin_email" "text", "auth_user_count" bigint, "profile_count" bigint, "workspace_count" bigint, "client_count" bigint, "job_count" bigint, "invoice_count" bigint, "document_count" bigint, "route_plan_count" bigint)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
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
$$;


ALTER FUNCTION "public"."get_platform_admin_summary"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_auth_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    lower(new.email),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', lower(new.email))
  )
  on conflict (id) do update
    set email = excluded.email,
        display_name = coalesce(public.profiles.display_name, excluded.display_name);

  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_auth_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."has_workspace_role"("target_workspace_id" "uuid", "allowed_roles" "text"[]) RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1
    from public.workspace_members
    where workspace_id = target_workspace_id
      and user_id = auth.uid()
      and status = 'Active'
      and role = any(allowed_roles)
  );
$$;


ALTER FUNCTION "public"."has_workspace_role"("target_workspace_id" "uuid", "allowed_roles" "text"[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_platform_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1
    from public.platform_admins
    where user_id = auth.uid()
  );
$$;


ALTER FUNCTION "public"."is_platform_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_workspace_creator"("target_workspace_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1
    from public.workspaces
    where id = target_workspace_id
      and created_by = auth.uid()
  );
$$;


ALTER FUNCTION "public"."is_workspace_creator"("target_workspace_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_workspace_manager"("target_workspace_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select public.has_workspace_role(target_workspace_id, array['Owner', 'Manager']);
$$;


ALTER FUNCTION "public"."is_workspace_manager"("target_workspace_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_workspace_member"("target_workspace_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1
    from public.workspace_members
    where workspace_id = target_workspace_id
      and user_id = auth.uid()
      and status = 'Active'
  );
$$;


ALTER FUNCTION "public"."is_workspace_member"("target_workspace_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_workspace_owner"("target_workspace_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select public.has_workspace_role(target_workspace_id, array['Owner']);
$$;


ALTER FUNCTION "public"."is_workspace_owner"("target_workspace_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."storage_workspace_id"("object_name" "text") RETURNS "uuid"
    LANGUAGE "plpgsql" STABLE
    AS $$
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


ALTER FUNCTION "public"."storage_workspace_id"("object_name" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."storage_workspace_id"("object_name" "text") IS 'Extracts the workspace UUID from workspace-documents object paths: workspaceId/entityType/entityId/file.ext.';



CREATE TABLE IF NOT EXISTS "public"."invoices" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "client_id" "uuid",
    "job_id" "uuid",
    "source_estimate_id" "uuid",
    "invoice_number" "text" NOT NULL,
    "invoice_date" "date" NOT NULL,
    "due_date" "date",
    "company_name" "text",
    "company_address" "text",
    "company_city" "text",
    "company_state" "text",
    "company_zip" "text",
    "company_phone" "text",
    "company_email" "text",
    "bill_to_name" "text",
    "bill_to_company" "text",
    "bill_to_address" "text",
    "bill_to_city" "text",
    "bill_to_state" "text",
    "bill_to_zip" "text",
    "bill_to_phone" "text",
    "bill_to_email" "text",
    "discount_type" "text" DEFAULT 'None'::"text" NOT NULL,
    "discount_value" numeric DEFAULT 0 NOT NULL,
    "tax_rate" numeric DEFAULT 0 NOT NULL,
    "footer_message" "text",
    "contact_message" "text",
    "sent_at" timestamp with time zone,
    "paid_at" timestamp with time zone,
    "email_status" "text",
    "status" "text" DEFAULT 'Draft'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "invoices_discount_type_check" CHECK (("discount_type" = ANY (ARRAY['None'::"text", 'Percent'::"text", 'Fixed'::"text"]))),
    CONSTRAINT "invoices_status_check" CHECK (("status" = ANY (ARRAY['Estimate'::"text", 'Draft'::"text", 'Sent'::"text", 'Overdue'::"text", 'Paid'::"text"])))
);


ALTER TABLE "public"."invoices" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."upsert_invoice_with_lines"("invoice_payload" "jsonb", "line_items_payload" "jsonb") RETURNS "public"."invoices"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
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


ALTER FUNCTION "public"."upsert_invoice_with_lines"("invoice_payload" "jsonb", "line_items_payload" "jsonb") OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."jobs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "client_id" "uuid",
    "client_name_snapshot" "text",
    "name" "text" NOT NULL,
    "status" "text" DEFAULT 'Lead'::"text" NOT NULL,
    "estimated_value_cents" integer DEFAULT 0 NOT NULL,
    "scheduled_date" "date",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "scheduled_time" time without time zone,
    CONSTRAINT "jobs_status_check" CHECK (("status" = ANY (ARRAY['Lead'::"text", 'Quoted'::"text", 'Scheduled'::"text", 'Completed'::"text", 'Paid'::"text"])))
);


ALTER TABLE "public"."jobs" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."upsert_job_with_materials"("job_payload" "jsonb", "materials_payload" "jsonb") RETURNS "public"."jobs"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
declare
  target_job public.jobs;
  target_workspace_id uuid;
  target_job_id uuid;
  material_item jsonb;
begin
  target_workspace_id := (job_payload ->> 'workspace_id')::uuid;
  target_job_id := (job_payload ->> 'id')::uuid;

  if not public.is_workspace_member(target_workspace_id) then
    raise exception 'Access denied for workspace %', target_workspace_id using errcode = '42501';
  end if;

  insert into public.jobs (
    id,
    workspace_id,
    client_id,
    client_name_snapshot,
    name,
    status,
    estimated_value_cents,
    scheduled_date,
    scheduled_time,
    notes
  )
  values (
    target_job_id,
    target_workspace_id,
    nullif(job_payload ->> 'client_id', '')::uuid,
    job_payload ->> 'client_name_snapshot',
    job_payload ->> 'name',
    coalesce(job_payload ->> 'status', 'Lead'),
    coalesce(nullif(job_payload ->> 'estimated_value_cents', '')::integer, 0),
    nullif(job_payload ->> 'scheduled_date', '')::date,
    nullif(job_payload ->> 'scheduled_time', '')::time,
    job_payload ->> 'notes'
  )
  on conflict (id) do update
    set client_id = excluded.client_id,
        client_name_snapshot = excluded.client_name_snapshot,
        name = excluded.name,
        status = excluded.status,
        estimated_value_cents = excluded.estimated_value_cents,
        scheduled_date = excluded.scheduled_date,
        scheduled_time = excluded.scheduled_time,
        notes = excluded.notes,
        updated_at = now()
  returning * into target_job;

  delete from public.job_materials
  where job_id = target_job_id
    and workspace_id = target_workspace_id;

  for material_item in
    select * from jsonb_array_elements(coalesce(materials_payload, '[]'::jsonb))
  loop
    insert into public.job_materials (workspace_id, job_id, name, quantity)
    values (
      target_workspace_id,
      target_job_id,
      material_item ->> 'name',
      coalesce(nullif(material_item ->> 'quantity', '')::numeric, 0)
    );
  end loop;

  return target_job;
end;
$$;


ALTER FUNCTION "public"."upsert_job_with_materials"("job_payload" "jsonb", "materials_payload" "jsonb") OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."route_plans" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "total_distance_meters" integer,
    "total_duration_seconds" integer,
    "google_maps_url" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."route_plans" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."upsert_route_with_stops"("route_payload" "jsonb", "stops_payload" "jsonb") RETURNS "public"."route_plans"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
declare
  target_route public.route_plans;
  target_workspace_id uuid;
  target_route_id uuid;
  stop_item jsonb;
begin
  target_workspace_id := (route_payload ->> 'workspace_id')::uuid;
  target_route_id := (route_payload ->> 'id')::uuid;

  if not public.is_workspace_member(target_workspace_id) then
    raise exception 'Access denied for workspace %', target_workspace_id using errcode = '42501';
  end if;

  insert into public.route_plans (
    id,
    workspace_id,
    name,
    total_distance_meters,
    total_duration_seconds,
    google_maps_url,
    notes
  )
  values (
    target_route_id,
    target_workspace_id,
    route_payload ->> 'name',
    nullif(route_payload ->> 'total_distance_meters', '')::integer,
    nullif(route_payload ->> 'total_duration_seconds', '')::integer,
    route_payload ->> 'google_maps_url',
    route_payload ->> 'notes'
  )
  on conflict (id) do update
    set name = excluded.name,
        total_distance_meters = excluded.total_distance_meters,
        total_duration_seconds = excluded.total_duration_seconds,
        google_maps_url = excluded.google_maps_url,
        notes = excluded.notes,
        updated_at = now()
  returning * into target_route;

  delete from public.route_plan_stops
  where route_plan_id = target_route_id
    and workspace_id = target_workspace_id;

  for stop_item in
    select * from jsonb_array_elements(coalesce(stops_payload, '[]'::jsonb))
  loop
    insert into public.route_plan_stops (
      id,
      workspace_id,
      route_plan_id,
      client_id,
      stop_order,
      latitude,
      longitude,
      address_snapshot
    )
    values (
      coalesce(nullif(stop_item ->> 'id', '')::uuid, gen_random_uuid()),
      target_workspace_id,
      target_route_id,
      nullif(stop_item ->> 'client_id', '')::uuid,
      coalesce(nullif(stop_item ->> 'stop_order', '')::integer, 0),
      nullif(stop_item ->> 'latitude', '')::numeric,
      nullif(stop_item ->> 'longitude', '')::numeric,
      stop_item ->> 'address_snapshot'
    );
  end loop;

  return target_route;
end;
$$;


ALTER FUNCTION "public"."upsert_route_with_stops"("route_payload" "jsonb", "stops_payload" "jsonb") OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."admin_audit_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "admin_user_id" "uuid" NOT NULL,
    "target_user_id" "uuid",
    "target_workspace_id" "uuid",
    "action" "text" NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."admin_audit_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ai_jobs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "document_id" "uuid",
    "client_id" "uuid",
    "job_id" "uuid",
    "invoice_id" "uuid",
    "expense_id" "uuid",
    "workflow_name" "text" NOT NULL,
    "status" "text" DEFAULT 'Queued'::"text" NOT NULL,
    "model_provider" "text",
    "model_name" "text",
    "prompt_version" "text",
    "input_json" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "result_json" "jsonb",
    "confidence" numeric,
    "error_message" "text",
    "approved_by" "uuid",
    "approved_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid",
    "job_type" "text" DEFAULT 'document_ocr'::"text",
    "input_ref" "text",
    "output_json" "jsonb",
    "started_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    CONSTRAINT "ai_jobs_job_type_check" CHECK (("job_type" = ANY (ARRAY['document_ocr'::"text", 'document_extraction'::"text", 'voice_command'::"text", 'logistics_plan'::"text", 'invoice_parse'::"text", 'client_parse'::"text"]))),
    CONSTRAINT "ai_jobs_status_check" CHECK (("status" = ANY (ARRAY['Queued'::"text", 'Processing'::"text", 'Needs Review'::"text", 'Approved'::"text", 'Failed'::"text", 'queued'::"text", 'processing'::"text", 'needs_review'::"text", 'reviewed'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."ai_jobs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ai_review_draft_revisions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "review_draft_id" "uuid" NOT NULL,
    "source_label" "text",
    "summary" "text",
    "actions" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "warnings" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "changed_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."ai_review_draft_revisions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ai_review_drafts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "source_type" "text" NOT NULL,
    "source_id" "uuid",
    "source_label" "text",
    "status" "text" DEFAULT 'Pending'::"text" NOT NULL,
    "confidence" numeric,
    "warnings" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "actions" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "raw_input" "text",
    "model_provider" "text",
    "model_name" "text",
    "created_by" "uuid",
    "reviewed_by" "uuid",
    "reviewed_at" timestamp with time zone,
    "approved_at" timestamp with time zone,
    "rejected_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "execution_status" "text" DEFAULT 'Not Executed'::"text" NOT NULL,
    "executed_at" timestamp with time zone,
    "executed_by" "uuid",
    "execution_result" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "execution_error" "text",
    "summary" "text",
    CONSTRAINT "ai_review_drafts_actions_array_check" CHECK (("jsonb_typeof"("actions") = 'array'::"text")),
    CONSTRAINT "ai_review_drafts_execution_status_check" CHECK (("execution_status" = ANY (ARRAY['Not Executed'::"text", 'Executed'::"text", 'Failed'::"text"]))),
    CONSTRAINT "ai_review_drafts_no_delete_actions_check" CHECK ((NOT "jsonb_path_exists"("actions", '$[*]?(@."type" like_regex "^delete_")'::"jsonpath"))),
    CONSTRAINT "ai_review_drafts_source_type_check" CHECK (("source_type" = ANY (ARRAY['ocr'::"text", 'transcript'::"text", 'image'::"text"]))),
    CONSTRAINT "ai_review_drafts_status_check" CHECK (("status" = ANY (ARRAY['Pending'::"text", 'Approved'::"text", 'Rejected'::"text", 'Needs Changes'::"text"]))),
    CONSTRAINT "ai_review_drafts_warnings_array_check" CHECK (("jsonb_typeof"("warnings") = 'array'::"text"))
);


ALTER TABLE "public"."ai_review_drafts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."client_activity" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "client_id" "uuid" NOT NULL,
    "activity_type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "body" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."client_activity" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."client_calendar_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "client_id" "uuid",
    "client_name_snapshot" "text",
    "title" "text" NOT NULL,
    "event_date" "date" NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "event_time" time without time zone
);


ALTER TABLE "public"."client_calendar_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."client_notes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "client_id" "uuid" NOT NULL,
    "body" "text" NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."client_notes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."clients" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "status" "text" DEFAULT 'Active'::"text" NOT NULL,
    "balance_cents" integer DEFAULT 0 NOT NULL,
    "email" "text",
    "phone" "text",
    "address" "text",
    "city" "text",
    "state" "text",
    "zip" "text",
    "notes" "text",
    "latitude" numeric(10,7),
    "longitude" numeric(10,7),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "clients_status_check" CHECK (("status" = ANY (ARRAY['Lead'::"text", 'Active'::"text", 'Inactive'::"text"])))
);


ALTER TABLE "public"."clients" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."document_tag_links" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "document_id" "uuid" NOT NULL,
    "tag_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."document_tag_links" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."document_tags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "color" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."document_tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "client_id" "uuid",
    "job_id" "uuid",
    "invoice_id" "uuid",
    "estimate_id" "uuid",
    "expense_id" "uuid",
    "name" "text" NOT NULL,
    "detected_type" "text",
    "extraction_status" "text",
    "file_name" "text",
    "storage_bucket" "text",
    "storage_path" "text",
    "mime_type" "text",
    "size_bytes" bigint,
    "notes" "text",
    "extracted_json" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "uploaded_by" "uuid",
    "status" "text" DEFAULT 'Metadata available'::"text" NOT NULL,
    "processing_status" "text" DEFAULT 'uploaded'::"text" NOT NULL,
    "extracted_text" "text",
    "ocr_provider" "text",
    "ai_job_id" "uuid",
    "reviewed_at" timestamp with time zone,
    "reviewed_by" "uuid",
    "confidence" numeric,
    "document_type" "text",
    "material_catalog_item_id" "uuid",
    "job_material_allocation_id" "uuid",
    CONSTRAINT "documents_processing_status_check" CHECK (("processing_status" = ANY (ARRAY['uploaded'::"text", 'queued'::"text", 'processing'::"text", 'needs_review'::"text", 'reviewed'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."estimate_line_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "estimate_id" "uuid" NOT NULL,
    "description" "text" NOT NULL,
    "quantity" numeric DEFAULT 1 NOT NULL,
    "unit_price_cents" integer DEFAULT 0 NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."estimate_line_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."estimates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "client_id" "uuid",
    "job_id" "uuid",
    "estimate_number" "text" NOT NULL,
    "estimate_date" "date" NOT NULL,
    "converted_invoice_id" "uuid",
    "company_name" "text",
    "company_address" "text",
    "company_city" "text",
    "company_state" "text",
    "company_zip" "text",
    "company_phone" "text",
    "company_email" "text",
    "bill_to_name" "text",
    "bill_to_company" "text",
    "bill_to_address" "text",
    "bill_to_city" "text",
    "bill_to_state" "text",
    "bill_to_zip" "text",
    "bill_to_phone" "text",
    "bill_to_email" "text",
    "discount_type" "text" DEFAULT 'None'::"text" NOT NULL,
    "discount_value" numeric DEFAULT 0 NOT NULL,
    "tax_rate" numeric DEFAULT 0 NOT NULL,
    "footer_message" "text",
    "contact_message" "text",
    "status" "text" DEFAULT 'Draft'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "estimates_discount_type_check" CHECK (("discount_type" = ANY (ARRAY['None'::"text", 'Percent'::"text", 'Fixed'::"text"]))),
    CONSTRAINT "estimates_status_check" CHECK (("status" = ANY (ARRAY['Draft'::"text", 'Sent'::"text", 'Accepted'::"text", 'Declined'::"text", 'Expired'::"text", 'Converted'::"text"])))
);


ALTER TABLE "public"."estimates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."expenses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "description" "text" NOT NULL,
    "category" "text" NOT NULL,
    "amount_cents" integer DEFAULT 0 NOT NULL,
    "expense_date" "date",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."expenses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."inventory_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "current_qty" numeric,
    "target_qty" numeric,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."inventory_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."inventory_lots" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "material_id" "uuid" NOT NULL,
    "vendor_sku_id" "uuid",
    "quantity" numeric DEFAULT 0 NOT NULL,
    "unit_cost_cents" bigint,
    "received_at" "date",
    "lot_reference" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "inventory_lots_quantity_check" CHECK (("quantity" >= (0)::numeric))
);


ALTER TABLE "public"."inventory_lots" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."invoice_line_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "invoice_id" "uuid" NOT NULL,
    "description" "text" NOT NULL,
    "quantity" numeric DEFAULT 1 NOT NULL,
    "unit_price_cents" integer DEFAULT 0 NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."invoice_line_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."invoice_payments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "invoice_id" "uuid" NOT NULL,
    "amount_cents" integer NOT NULL,
    "payment_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "method" "text",
    "reference" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "invoice_payments_amount_cents_check" CHECK (("amount_cents" >= 0))
);


ALTER TABLE "public"."invoice_payments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."job_activity" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "job_id" "uuid" NOT NULL,
    "activity_type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "body" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."job_activity" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."job_materials" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "job_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "quantity" numeric DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."job_materials" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."material_catalog_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "inventory_item_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "category" "text",
    "unit" "text",
    "default_cost_cents" bigint,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."material_catalog_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."material_vendor_skus" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "material_id" "uuid" NOT NULL,
    "vendor_name" "text" NOT NULL,
    "sku" "text" NOT NULL,
    "unit_cost_cents" bigint,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."material_vendor_skus" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."platform_admins" (
    "user_id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "role" "text" DEFAULT 'Admin'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "platform_admins_email_normalized_check" CHECK (("email" = "lower"(TRIM(BOTH FROM "email")))),
    CONSTRAINT "platform_admins_role_check" CHECK (("role" = ANY (ARRAY['Owner'::"text", 'Admin'::"text", 'Support'::"text"])))
);


ALTER TABLE "public"."platform_admins" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "display_name" "text",
    "email" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."route_plan_stops" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "route_plan_id" "uuid" NOT NULL,
    "client_id" "uuid",
    "stop_order" integer NOT NULL,
    "latitude" numeric(10,7),
    "longitude" numeric(10,7),
    "address_snapshot" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."route_plan_stops" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."workspace_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "user_id" "uuid",
    "role" "text" NOT NULL,
    "status" "text" DEFAULT 'Active'::"text" NOT NULL,
    "invited_email" "text",
    "invited_by" "uuid",
    "invite_token" "text",
    "invite_expires_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "workspace_members_role_check" CHECK (("role" = ANY (ARRAY['Owner'::"text", 'Manager'::"text", 'Employee'::"text"]))),
    CONSTRAINT "workspace_members_status_check" CHECK (("status" = ANY (ARRAY['Active'::"text", 'Invited'::"text", 'Removed'::"text"]))),
    CONSTRAINT "workspace_members_user_or_email_check" CHECK ((("user_id" IS NOT NULL) OR ("invited_email" IS NOT NULL)))
);


ALTER TABLE "public"."workspace_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."workspace_settings" (
    "workspace_id" "uuid" NOT NULL,
    "company_name" "text",
    "company_address" "text",
    "company_city" "text",
    "company_state" "text",
    "company_zip" "text",
    "company_phone" "text",
    "company_email" "text",
    "company_website" "text",
    "default_invoice_terms" "text",
    "default_footer_message" "text",
    "default_contact_message" "text",
    "default_invoice_status" "text" DEFAULT 'Draft'::"text" NOT NULL,
    "tax_state" "text",
    "default_tax_rate" numeric DEFAULT 0 NOT NULL,
    "tax_location_mode" "text" DEFAULT 'Business location'::"text" NOT NULL,
    "discount_before_tax" boolean DEFAULT true NOT NULL,
    "workspace_nickname" "text",
    "business_type" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "workspace_settings_default_invoice_status_check" CHECK (("default_invoice_status" = ANY (ARRAY['Estimate'::"text", 'Draft'::"text", 'Sent'::"text"]))),
    CONSTRAINT "workspace_settings_tax_location_mode_check" CHECK (("tax_location_mode" = ANY (ARRAY['Business location'::"text", 'Job location'::"text"])))
);


ALTER TABLE "public"."workspace_settings" OWNER TO "postgres";


ALTER TABLE ONLY "public"."admin_audit_logs"
    ADD CONSTRAINT "admin_audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_jobs"
    ADD CONSTRAINT "ai_jobs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_review_draft_revisions"
    ADD CONSTRAINT "ai_review_draft_revisions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_review_drafts"
    ADD CONSTRAINT "ai_review_drafts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."client_activity"
    ADD CONSTRAINT "client_activity_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."client_calendar_events"
    ADD CONSTRAINT "client_calendar_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."client_notes"
    ADD CONSTRAINT "client_notes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."document_tag_links"
    ADD CONSTRAINT "document_tag_links_document_id_tag_id_key" UNIQUE ("document_id", "tag_id");



ALTER TABLE ONLY "public"."document_tag_links"
    ADD CONSTRAINT "document_tag_links_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."document_tags"
    ADD CONSTRAINT "document_tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."estimate_line_items"
    ADD CONSTRAINT "estimate_line_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."estimates"
    ADD CONSTRAINT "estimates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."inventory_items"
    ADD CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."inventory_lots"
    ADD CONSTRAINT "inventory_lots_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invoice_line_items"
    ADD CONSTRAINT "invoice_line_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invoice_payments"
    ADD CONSTRAINT "invoice_payments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."job_activity"
    ADD CONSTRAINT "job_activity_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."job_material_allocations"
    ADD CONSTRAINT "job_material_allocations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."job_materials"
    ADD CONSTRAINT "job_materials_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."jobs"
    ADD CONSTRAINT "jobs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."material_catalog_items"
    ADD CONSTRAINT "material_catalog_items_inventory_item_id_key" UNIQUE ("inventory_item_id");



ALTER TABLE ONLY "public"."material_catalog_items"
    ADD CONSTRAINT "material_catalog_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."material_vendor_skus"
    ADD CONSTRAINT "material_vendor_skus_material_id_vendor_name_sku_key" UNIQUE ("material_id", "vendor_name", "sku");



ALTER TABLE ONLY "public"."material_vendor_skus"
    ADD CONSTRAINT "material_vendor_skus_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."platform_admins"
    ADD CONSTRAINT "platform_admins_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."route_plan_stops"
    ADD CONSTRAINT "route_plan_stops_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."route_plan_stops"
    ADD CONSTRAINT "route_plan_stops_route_plan_id_stop_order_key" UNIQUE ("route_plan_id", "stop_order");



ALTER TABLE ONLY "public"."route_plans"
    ADD CONSTRAINT "route_plans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."workspace_members"
    ADD CONSTRAINT "workspace_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."workspace_settings"
    ADD CONSTRAINT "workspace_settings_pkey" PRIMARY KEY ("workspace_id");



ALTER TABLE ONLY "public"."workspaces"
    ADD CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id");



CREATE INDEX "admin_audit_logs_action_created_idx" ON "public"."admin_audit_logs" USING "btree" ("action", "created_at" DESC);



CREATE INDEX "admin_audit_logs_admin_user_idx" ON "public"."admin_audit_logs" USING "btree" ("admin_user_id");



CREATE INDEX "admin_audit_logs_target_user_idx" ON "public"."admin_audit_logs" USING "btree" ("target_user_id");



CREATE INDEX "admin_audit_logs_target_workspace_idx" ON "public"."admin_audit_logs" USING "btree" ("target_workspace_id");



CREATE INDEX "ai_jobs_created_by_idx" ON "public"."ai_jobs" USING "btree" ("created_by");



CREATE INDEX "ai_jobs_document_idx" ON "public"."ai_jobs" USING "btree" ("document_id");



CREATE INDEX "ai_jobs_job_type_idx" ON "public"."ai_jobs" USING "btree" ("job_type");



CREATE INDEX "ai_jobs_status_idx" ON "public"."ai_jobs" USING "btree" ("status");



CREATE INDEX "ai_jobs_workspace_idx" ON "public"."ai_jobs" USING "btree" ("workspace_id");



CREATE INDEX "ai_review_draft_revisions_draft_idx" ON "public"."ai_review_draft_revisions" USING "btree" ("review_draft_id", "created_at" DESC);



CREATE INDEX "ai_review_drafts_created_at_idx" ON "public"."ai_review_drafts" USING "btree" ("created_at" DESC);



CREATE INDEX "ai_review_drafts_created_by_idx" ON "public"."ai_review_drafts" USING "btree" ("created_by");



CREATE INDEX "ai_review_drafts_execution_status_idx" ON "public"."ai_review_drafts" USING "btree" ("workspace_id", "execution_status");



CREATE INDEX "ai_review_drafts_source_idx" ON "public"."ai_review_drafts" USING "btree" ("source_type", "source_id");



CREATE INDEX "ai_review_drafts_status_idx" ON "public"."ai_review_drafts" USING "btree" ("status");



CREATE INDEX "ai_review_drafts_workspace_idx" ON "public"."ai_review_drafts" USING "btree" ("workspace_id");



CREATE INDEX "client_activity_client_idx" ON "public"."client_activity" USING "btree" ("client_id");



CREATE INDEX "client_activity_workspace_idx" ON "public"."client_activity" USING "btree" ("workspace_id");



CREATE INDEX "client_calendar_events_client_idx" ON "public"."client_calendar_events" USING "btree" ("client_id");



CREATE INDEX "client_calendar_events_date_idx" ON "public"."client_calendar_events" USING "btree" ("event_date");



CREATE INDEX "client_calendar_events_schedule_idx" ON "public"."client_calendar_events" USING "btree" ("workspace_id", "event_date", "event_time");



CREATE INDEX "client_calendar_events_workspace_idx" ON "public"."client_calendar_events" USING "btree" ("workspace_id");



CREATE INDEX "client_notes_client_idx" ON "public"."client_notes" USING "btree" ("client_id");



CREATE INDEX "client_notes_workspace_idx" ON "public"."client_notes" USING "btree" ("workspace_id");



CREATE INDEX "clients_workspace_idx" ON "public"."clients" USING "btree" ("workspace_id");



CREATE UNIQUE INDEX "clients_workspace_name_uidx" ON "public"."clients" USING "btree" ("workspace_id", "lower"("name"));



CREATE INDEX "document_tag_links_document_idx" ON "public"."document_tag_links" USING "btree" ("document_id");



CREATE INDEX "document_tag_links_tag_idx" ON "public"."document_tag_links" USING "btree" ("tag_id");



CREATE INDEX "document_tag_links_workspace_idx" ON "public"."document_tag_links" USING "btree" ("workspace_id");



CREATE INDEX "document_tags_workspace_idx" ON "public"."document_tags" USING "btree" ("workspace_id");



CREATE UNIQUE INDEX "document_tags_workspace_name_uidx" ON "public"."document_tags" USING "btree" ("workspace_id", "lower"("name"));



CREATE INDEX "documents_ai_job_idx" ON "public"."documents" USING "btree" ("ai_job_id");



CREATE INDEX "documents_client_idx" ON "public"."documents" USING "btree" ("client_id");



CREATE INDEX "documents_document_type_idx" ON "public"."documents" USING "btree" ("document_type");



CREATE INDEX "documents_estimate_idx" ON "public"."documents" USING "btree" ("estimate_id");



CREATE INDEX "documents_expense_idx" ON "public"."documents" USING "btree" ("expense_id");



CREATE INDEX "documents_invoice_idx" ON "public"."documents" USING "btree" ("invoice_id");



CREATE INDEX "documents_job_idx" ON "public"."documents" USING "btree" ("job_id");



CREATE INDEX "documents_material_allocation_idx" ON "public"."documents" USING "btree" ("job_material_allocation_id");



CREATE INDEX "documents_material_catalog_idx" ON "public"."documents" USING "btree" ("material_catalog_item_id");



CREATE INDEX "documents_processing_status_idx" ON "public"."documents" USING "btree" ("processing_status");



CREATE INDEX "documents_status_idx" ON "public"."documents" USING "btree" ("status");



CREATE INDEX "documents_uploaded_by_idx" ON "public"."documents" USING "btree" ("uploaded_by");



CREATE INDEX "documents_workspace_idx" ON "public"."documents" USING "btree" ("workspace_id");



CREATE INDEX "estimate_line_items_estimate_idx" ON "public"."estimate_line_items" USING "btree" ("estimate_id");



CREATE INDEX "estimate_line_items_workspace_idx" ON "public"."estimate_line_items" USING "btree" ("workspace_id");



CREATE INDEX "estimates_client_idx" ON "public"."estimates" USING "btree" ("client_id");



CREATE INDEX "estimates_date_idx" ON "public"."estimates" USING "btree" ("estimate_date");



CREATE INDEX "estimates_job_idx" ON "public"."estimates" USING "btree" ("job_id");



CREATE INDEX "estimates_status_idx" ON "public"."estimates" USING "btree" ("status");



CREATE INDEX "estimates_workspace_idx" ON "public"."estimates" USING "btree" ("workspace_id");



CREATE UNIQUE INDEX "estimates_workspace_number_uidx" ON "public"."estimates" USING "btree" ("workspace_id", "estimate_number");



CREATE INDEX "expenses_category_idx" ON "public"."expenses" USING "btree" ("category");



CREATE INDEX "expenses_date_idx" ON "public"."expenses" USING "btree" ("expense_date");



CREATE INDEX "expenses_workspace_idx" ON "public"."expenses" USING "btree" ("workspace_id");



CREATE INDEX "inventory_items_workspace_idx" ON "public"."inventory_items" USING "btree" ("workspace_id");



CREATE UNIQUE INDEX "inventory_items_workspace_name_uidx" ON "public"."inventory_items" USING "btree" ("workspace_id", "lower"("name"));



CREATE INDEX "inventory_lots_material_idx" ON "public"."inventory_lots" USING "btree" ("material_id");



CREATE INDEX "invoice_line_items_invoice_idx" ON "public"."invoice_line_items" USING "btree" ("invoice_id");



CREATE INDEX "invoice_line_items_workspace_idx" ON "public"."invoice_line_items" USING "btree" ("workspace_id");



CREATE INDEX "invoice_payments_date_idx" ON "public"."invoice_payments" USING "btree" ("payment_date");



CREATE INDEX "invoice_payments_invoice_idx" ON "public"."invoice_payments" USING "btree" ("invoice_id");



CREATE INDEX "invoice_payments_workspace_idx" ON "public"."invoice_payments" USING "btree" ("workspace_id");



CREATE INDEX "invoices_client_idx" ON "public"."invoices" USING "btree" ("client_id");



CREATE INDEX "invoices_date_idx" ON "public"."invoices" USING "btree" ("invoice_date");



CREATE INDEX "invoices_job_idx" ON "public"."invoices" USING "btree" ("job_id");



CREATE INDEX "invoices_source_estimate_idx" ON "public"."invoices" USING "btree" ("source_estimate_id");



CREATE INDEX "invoices_status_idx" ON "public"."invoices" USING "btree" ("status");



CREATE INDEX "invoices_workspace_idx" ON "public"."invoices" USING "btree" ("workspace_id");



CREATE UNIQUE INDEX "invoices_workspace_number_uidx" ON "public"."invoices" USING "btree" ("workspace_id", "invoice_number");



CREATE INDEX "job_activity_job_idx" ON "public"."job_activity" USING "btree" ("job_id");



CREATE INDEX "job_activity_workspace_idx" ON "public"."job_activity" USING "btree" ("workspace_id");



CREATE INDEX "job_material_allocations_job_idx" ON "public"."job_material_allocations" USING "btree" ("job_id");



CREATE INDEX "job_material_allocations_material_idx" ON "public"."job_material_allocations" USING "btree" ("material_id");



CREATE INDEX "job_material_allocations_review_idx" ON "public"."job_material_allocations" USING "btree" ("review_draft_id");



CREATE INDEX "job_materials_job_idx" ON "public"."job_materials" USING "btree" ("job_id");



CREATE INDEX "job_materials_name_idx" ON "public"."job_materials" USING "btree" ("lower"("name"));



CREATE INDEX "job_materials_workspace_idx" ON "public"."job_materials" USING "btree" ("workspace_id");



CREATE INDEX "jobs_client_idx" ON "public"."jobs" USING "btree" ("client_id");



CREATE INDEX "jobs_schedule_idx" ON "public"."jobs" USING "btree" ("workspace_id", "scheduled_date", "scheduled_time");



CREATE INDEX "jobs_scheduled_date_idx" ON "public"."jobs" USING "btree" ("scheduled_date");



CREATE INDEX "jobs_workspace_idx" ON "public"."jobs" USING "btree" ("workspace_id");



CREATE INDEX "material_catalog_items_workspace_idx" ON "public"."material_catalog_items" USING "btree" ("workspace_id");



CREATE INDEX "material_vendor_skus_material_idx" ON "public"."material_vendor_skus" USING "btree" ("material_id");



CREATE INDEX "route_plan_stops_client_idx" ON "public"."route_plan_stops" USING "btree" ("client_id");



CREATE INDEX "route_plan_stops_route_idx" ON "public"."route_plan_stops" USING "btree" ("route_plan_id");



CREATE INDEX "route_plan_stops_workspace_idx" ON "public"."route_plan_stops" USING "btree" ("workspace_id");



CREATE INDEX "route_plans_workspace_idx" ON "public"."route_plans" USING "btree" ("workspace_id");



CREATE UNIQUE INDEX "workspace_members_invite_token_uidx" ON "public"."workspace_members" USING "btree" ("invite_token") WHERE ("invite_token" IS NOT NULL);



CREATE INDEX "workspace_members_user_idx" ON "public"."workspace_members" USING "btree" ("user_id");



CREATE INDEX "workspace_members_workspace_idx" ON "public"."workspace_members" USING "btree" ("workspace_id");



CREATE UNIQUE INDEX "workspace_members_workspace_user_uidx" ON "public"."workspace_members" USING "btree" ("workspace_id", "user_id") WHERE ("user_id" IS NOT NULL);



CREATE OR REPLACE TRIGGER "ai_jobs_set_updated_at" BEFORE UPDATE ON "public"."ai_jobs" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "ai_review_drafts_capture_revision" BEFORE UPDATE ON "public"."ai_review_drafts" FOR EACH ROW EXECUTE FUNCTION "public"."capture_ai_review_draft_revision"();



CREATE OR REPLACE TRIGGER "ai_review_drafts_set_updated_at" BEFORE UPDATE ON "public"."ai_review_drafts" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "client_calendar_events_set_updated_at" BEFORE UPDATE ON "public"."client_calendar_events" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "client_notes_set_updated_at" BEFORE UPDATE ON "public"."client_notes" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "clients_set_updated_at" BEFORE UPDATE ON "public"."clients" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "document_tags_set_updated_at" BEFORE UPDATE ON "public"."document_tags" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "documents_set_updated_at" BEFORE UPDATE ON "public"."documents" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "estimates_set_updated_at" BEFORE UPDATE ON "public"."estimates" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "expenses_set_updated_at" BEFORE UPDATE ON "public"."expenses" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "inventory_items_ensure_catalog" AFTER INSERT OR UPDATE OF "name", "workspace_id" ON "public"."inventory_items" FOR EACH ROW EXECUTE FUNCTION "public"."ensure_material_catalog_item"();



CREATE OR REPLACE TRIGGER "inventory_items_set_updated_at" BEFORE UPDATE ON "public"."inventory_items" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "inventory_lots_set_updated_at" BEFORE UPDATE ON "public"."inventory_lots" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "invoice_payments_set_updated_at" BEFORE UPDATE ON "public"."invoice_payments" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "invoices_set_updated_at" BEFORE UPDATE ON "public"."invoices" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "job_material_allocations_set_updated_at" BEFORE UPDATE ON "public"."job_material_allocations" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "jobs_set_updated_at" BEFORE UPDATE ON "public"."jobs" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "material_catalog_items_set_updated_at" BEFORE UPDATE ON "public"."material_catalog_items" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "material_vendor_skus_set_updated_at" BEFORE UPDATE ON "public"."material_vendor_skus" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "profiles_set_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "route_plans_set_updated_at" BEFORE UPDATE ON "public"."route_plans" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "workspace_members_set_updated_at" BEFORE UPDATE ON "public"."workspace_members" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "workspace_settings_set_updated_at" BEFORE UPDATE ON "public"."workspace_settings" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "workspaces_set_updated_at" BEFORE UPDATE ON "public"."workspaces" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



ALTER TABLE ONLY "public"."admin_audit_logs"
    ADD CONSTRAINT "admin_audit_logs_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."admin_audit_logs"
    ADD CONSTRAINT "admin_audit_logs_target_user_id_fkey" FOREIGN KEY ("target_user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."admin_audit_logs"
    ADD CONSTRAINT "admin_audit_logs_target_workspace_id_fkey" FOREIGN KEY ("target_workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."ai_jobs"
    ADD CONSTRAINT "ai_jobs_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."ai_jobs"
    ADD CONSTRAINT "ai_jobs_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."ai_jobs"
    ADD CONSTRAINT "ai_jobs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."ai_jobs"
    ADD CONSTRAINT "ai_jobs_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."ai_jobs"
    ADD CONSTRAINT "ai_jobs_expense_id_fkey" FOREIGN KEY ("expense_id") REFERENCES "public"."expenses"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."ai_jobs"
    ADD CONSTRAINT "ai_jobs_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."ai_jobs"
    ADD CONSTRAINT "ai_jobs_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."ai_jobs"
    ADD CONSTRAINT "ai_jobs_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ai_review_draft_revisions"
    ADD CONSTRAINT "ai_review_draft_revisions_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."ai_review_draft_revisions"
    ADD CONSTRAINT "ai_review_draft_revisions_review_draft_id_fkey" FOREIGN KEY ("review_draft_id") REFERENCES "public"."ai_review_drafts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ai_review_draft_revisions"
    ADD CONSTRAINT "ai_review_draft_revisions_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ai_review_drafts"
    ADD CONSTRAINT "ai_review_drafts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."ai_review_drafts"
    ADD CONSTRAINT "ai_review_drafts_executed_by_fkey" FOREIGN KEY ("executed_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."ai_review_drafts"
    ADD CONSTRAINT "ai_review_drafts_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."ai_review_drafts"
    ADD CONSTRAINT "ai_review_drafts_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."client_activity"
    ADD CONSTRAINT "client_activity_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."client_activity"
    ADD CONSTRAINT "client_activity_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."client_activity"
    ADD CONSTRAINT "client_activity_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."client_calendar_events"
    ADD CONSTRAINT "client_calendar_events_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."client_calendar_events"
    ADD CONSTRAINT "client_calendar_events_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."client_notes"
    ADD CONSTRAINT "client_notes_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."client_notes"
    ADD CONSTRAINT "client_notes_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."client_notes"
    ADD CONSTRAINT "client_notes_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_tag_links"
    ADD CONSTRAINT "document_tag_links_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_tag_links"
    ADD CONSTRAINT "document_tag_links_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."document_tags"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_tag_links"
    ADD CONSTRAINT "document_tag_links_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_tags"
    ADD CONSTRAINT "document_tags_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_ai_job_id_fkey" FOREIGN KEY ("ai_job_id") REFERENCES "public"."ai_jobs"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_estimate_id_fkey" FOREIGN KEY ("estimate_id") REFERENCES "public"."estimates"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_expense_id_fkey" FOREIGN KEY ("expense_id") REFERENCES "public"."expenses"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_job_material_allocation_id_fkey" FOREIGN KEY ("job_material_allocation_id") REFERENCES "public"."job_material_allocations"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_material_catalog_item_id_fkey" FOREIGN KEY ("material_catalog_item_id") REFERENCES "public"."material_catalog_items"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."estimate_line_items"
    ADD CONSTRAINT "estimate_line_items_estimate_id_fkey" FOREIGN KEY ("estimate_id") REFERENCES "public"."estimates"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."estimate_line_items"
    ADD CONSTRAINT "estimate_line_items_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."estimates"
    ADD CONSTRAINT "estimates_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."estimates"
    ADD CONSTRAINT "estimates_converted_invoice_fk" FOREIGN KEY ("converted_invoice_id") REFERENCES "public"."invoices"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."estimates"
    ADD CONSTRAINT "estimates_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."estimates"
    ADD CONSTRAINT "estimates_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."inventory_items"
    ADD CONSTRAINT "inventory_items_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."inventory_lots"
    ADD CONSTRAINT "inventory_lots_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "public"."material_catalog_items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."inventory_lots"
    ADD CONSTRAINT "inventory_lots_vendor_sku_id_fkey" FOREIGN KEY ("vendor_sku_id") REFERENCES "public"."material_vendor_skus"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."inventory_lots"
    ADD CONSTRAINT "inventory_lots_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invoice_line_items"
    ADD CONSTRAINT "invoice_line_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invoice_line_items"
    ADD CONSTRAINT "invoice_line_items_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invoice_payments"
    ADD CONSTRAINT "invoice_payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invoice_payments"
    ADD CONSTRAINT "invoice_payments_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_source_estimate_id_fkey" FOREIGN KEY ("source_estimate_id") REFERENCES "public"."estimates"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."job_activity"
    ADD CONSTRAINT "job_activity_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."job_activity"
    ADD CONSTRAINT "job_activity_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."job_activity"
    ADD CONSTRAINT "job_activity_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."job_material_allocations"
    ADD CONSTRAINT "job_material_allocations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."job_material_allocations"
    ADD CONSTRAINT "job_material_allocations_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."job_material_allocations"
    ADD CONSTRAINT "job_material_allocations_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "public"."material_catalog_items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."job_material_allocations"
    ADD CONSTRAINT "job_material_allocations_review_draft_id_fkey" FOREIGN KEY ("review_draft_id") REFERENCES "public"."ai_review_drafts"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."job_material_allocations"
    ADD CONSTRAINT "job_material_allocations_source_document_id_fkey" FOREIGN KEY ("source_document_id") REFERENCES "public"."documents"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."job_material_allocations"
    ADD CONSTRAINT "job_material_allocations_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."job_materials"
    ADD CONSTRAINT "job_materials_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."job_materials"
    ADD CONSTRAINT "job_materials_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."jobs"
    ADD CONSTRAINT "jobs_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."jobs"
    ADD CONSTRAINT "jobs_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."material_catalog_items"
    ADD CONSTRAINT "material_catalog_items_inventory_item_id_fkey" FOREIGN KEY ("inventory_item_id") REFERENCES "public"."inventory_items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."material_catalog_items"
    ADD CONSTRAINT "material_catalog_items_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."material_vendor_skus"
    ADD CONSTRAINT "material_vendor_skus_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "public"."material_catalog_items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."material_vendor_skus"
    ADD CONSTRAINT "material_vendor_skus_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."platform_admins"
    ADD CONSTRAINT "platform_admins_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."route_plan_stops"
    ADD CONSTRAINT "route_plan_stops_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."route_plan_stops"
    ADD CONSTRAINT "route_plan_stops_route_plan_id_fkey" FOREIGN KEY ("route_plan_id") REFERENCES "public"."route_plans"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."route_plan_stops"
    ADD CONSTRAINT "route_plan_stops_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."route_plans"
    ADD CONSTRAINT "route_plans_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workspace_members"
    ADD CONSTRAINT "workspace_members_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."workspace_members"
    ADD CONSTRAINT "workspace_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workspace_members"
    ADD CONSTRAINT "workspace_members_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workspace_settings"
    ADD CONSTRAINT "workspace_settings_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workspaces"
    ADD CONSTRAINT "workspaces_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



CREATE POLICY "Authenticated users can create workspaces" ON "public"."workspaces" FOR INSERT WITH CHECK ((("auth"."uid"() IS NOT NULL) AND ("created_by" = "auth"."uid"())));



CREATE POLICY "Platform admins can read admin audit logs" ON "public"."admin_audit_logs" FOR SELECT USING ("public"."is_platform_admin"());



CREATE POLICY "Platform admins can read platform admins" ON "public"."platform_admins" FOR SELECT USING ("public"."is_platform_admin"());



CREATE POLICY "Profiles are editable by owner" ON "public"."profiles" FOR UPDATE USING (("id" = "auth"."uid"())) WITH CHECK (("id" = "auth"."uid"()));



CREATE POLICY "Profiles are visible to owner" ON "public"."profiles" FOR SELECT USING (("id" = "auth"."uid"()));



CREATE POLICY "Profiles can be inserted by owner" ON "public"."profiles" FOR INSERT WITH CHECK (("id" = "auth"."uid"()));



CREATE POLICY "Users can create their initial owner membership" ON "public"."workspace_members" FOR INSERT WITH CHECK ((("auth"."uid"() IS NOT NULL) AND ("user_id" = "auth"."uid"()) AND ("role" = 'Owner'::"text") AND ("status" = 'Active'::"text") AND "public"."is_workspace_creator"("workspace_id")));



CREATE POLICY "Workspace managers can create invited memberships" ON "public"."workspace_members" FOR INSERT WITH CHECK (("public"."is_workspace_manager"("workspace_id") AND ("status" = 'Invited'::"text") AND ("user_id" IS NULL) AND ("invited_email" IS NOT NULL)));



CREATE POLICY "Workspace managers can delete AI jobs" ON "public"."ai_jobs" FOR DELETE USING ("public"."is_workspace_manager"("workspace_id"));



CREATE POLICY "Workspace managers can delete calendar events" ON "public"."client_calendar_events" FOR DELETE USING ("public"."is_workspace_manager"("workspace_id"));



CREATE POLICY "Workspace managers can delete client activity" ON "public"."client_activity" FOR DELETE USING ("public"."is_workspace_manager"("workspace_id"));



CREATE POLICY "Workspace managers can delete client notes" ON "public"."client_notes" FOR DELETE USING ("public"."is_workspace_manager"("workspace_id"));



CREATE POLICY "Workspace managers can delete clients" ON "public"."clients" FOR DELETE USING ("public"."is_workspace_manager"("workspace_id"));



CREATE POLICY "Workspace managers can delete document tag links" ON "public"."document_tag_links" FOR DELETE USING ("public"."is_workspace_manager"("workspace_id"));



CREATE POLICY "Workspace managers can delete document tags" ON "public"."document_tags" FOR DELETE USING ("public"."is_workspace_manager"("workspace_id"));



CREATE POLICY "Workspace managers can delete documents" ON "public"."documents" FOR DELETE USING ("public"."is_workspace_manager"("workspace_id"));



CREATE POLICY "Workspace managers can delete estimate line items" ON "public"."estimate_line_items" FOR DELETE USING ("public"."is_workspace_manager"("workspace_id"));



CREATE POLICY "Workspace managers can delete estimates" ON "public"."estimates" FOR DELETE USING ("public"."is_workspace_manager"("workspace_id"));



CREATE POLICY "Workspace managers can delete expenses" ON "public"."expenses" FOR DELETE USING ("public"."is_workspace_manager"("workspace_id"));



CREATE POLICY "Workspace managers can delete inventory" ON "public"."inventory_items" FOR DELETE USING ("public"."is_workspace_manager"("workspace_id"));



CREATE POLICY "Workspace managers can delete inventory lots" ON "public"."inventory_lots" FOR DELETE USING ("public"."is_workspace_manager"("workspace_id"));



CREATE POLICY "Workspace managers can delete invoice line items" ON "public"."invoice_line_items" FOR DELETE USING ("public"."is_workspace_manager"("workspace_id"));



CREATE POLICY "Workspace managers can delete invoice payments" ON "public"."invoice_payments" FOR DELETE USING ("public"."is_workspace_manager"("workspace_id"));



CREATE POLICY "Workspace managers can delete invoices" ON "public"."invoices" FOR DELETE USING ("public"."is_workspace_manager"("workspace_id"));



CREATE POLICY "Workspace managers can delete job activity" ON "public"."job_activity" FOR DELETE USING ("public"."is_workspace_manager"("workspace_id"));



CREATE POLICY "Workspace managers can delete job materials" ON "public"."job_materials" FOR DELETE USING ("public"."is_workspace_manager"("workspace_id"));



CREATE POLICY "Workspace managers can delete jobs" ON "public"."jobs" FOR DELETE USING ("public"."is_workspace_manager"("workspace_id"));



CREATE POLICY "Workspace managers can delete material allocations" ON "public"."job_material_allocations" FOR DELETE USING ("public"."is_workspace_manager"("workspace_id"));



CREATE POLICY "Workspace managers can delete material catalog" ON "public"."material_catalog_items" FOR DELETE USING ("public"."is_workspace_manager"("workspace_id"));



CREATE POLICY "Workspace managers can delete route plans" ON "public"."route_plans" FOR DELETE USING ("public"."is_workspace_manager"("workspace_id"));



CREATE POLICY "Workspace managers can delete route stops" ON "public"."route_plan_stops" FOR DELETE USING ("public"."is_workspace_manager"("workspace_id"));



CREATE POLICY "Workspace managers can delete vendor SKUs" ON "public"."material_vendor_skus" FOR DELETE USING ("public"."is_workspace_manager"("workspace_id"));



CREATE POLICY "Workspace managers can manage memberships" ON "public"."workspace_members" FOR UPDATE USING ("public"."is_workspace_manager"("workspace_id")) WITH CHECK ("public"."is_workspace_manager"("workspace_id"));



CREATE POLICY "Workspace managers can remove memberships" ON "public"."workspace_members" FOR DELETE USING ("public"."is_workspace_manager"("workspace_id"));



CREATE POLICY "Workspace managers can update AI review drafts" ON "public"."ai_review_drafts" FOR UPDATE USING ("public"."is_workspace_manager"("workspace_id")) WITH CHECK ("public"."is_workspace_manager"("workspace_id"));



CREATE POLICY "Workspace managers can update material allocations" ON "public"."job_material_allocations" FOR UPDATE USING ("public"."is_workspace_manager"("workspace_id")) WITH CHECK ("public"."is_workspace_manager"("workspace_id"));



CREATE POLICY "Workspace members can create AI review drafts" ON "public"."ai_review_drafts" FOR INSERT WITH CHECK (("public"."is_workspace_member"("workspace_id") AND ("status" = 'Pending'::"text")));



CREATE POLICY "Workspace members can insert AI jobs" ON "public"."ai_jobs" FOR INSERT WITH CHECK ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can insert calendar events" ON "public"."client_calendar_events" FOR INSERT WITH CHECK ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can insert client activity" ON "public"."client_activity" FOR INSERT WITH CHECK ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can insert client notes" ON "public"."client_notes" FOR INSERT WITH CHECK ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can insert clients" ON "public"."clients" FOR INSERT WITH CHECK ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can insert document tag links" ON "public"."document_tag_links" FOR INSERT WITH CHECK ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can insert document tags" ON "public"."document_tags" FOR INSERT WITH CHECK ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can insert documents" ON "public"."documents" FOR INSERT WITH CHECK ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can insert draft material allocations" ON "public"."job_material_allocations" FOR INSERT WITH CHECK (("public"."is_workspace_member"("workspace_id") AND ("status" = 'Draft'::"text")));



CREATE POLICY "Workspace members can insert estimate line items" ON "public"."estimate_line_items" FOR INSERT WITH CHECK ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can insert estimates" ON "public"."estimates" FOR INSERT WITH CHECK ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can insert expenses" ON "public"."expenses" FOR INSERT WITH CHECK ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can insert inventory" ON "public"."inventory_items" FOR INSERT WITH CHECK ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can insert inventory lots" ON "public"."inventory_lots" FOR INSERT WITH CHECK ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can insert invoice line items" ON "public"."invoice_line_items" FOR INSERT WITH CHECK ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can insert invoice payments" ON "public"."invoice_payments" FOR INSERT WITH CHECK ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can insert invoices" ON "public"."invoices" FOR INSERT WITH CHECK ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can insert job activity" ON "public"."job_activity" FOR INSERT WITH CHECK ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can insert job materials" ON "public"."job_materials" FOR INSERT WITH CHECK ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can insert jobs" ON "public"."jobs" FOR INSERT WITH CHECK ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can insert material catalog" ON "public"."material_catalog_items" FOR INSERT WITH CHECK ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can insert route plans" ON "public"."route_plans" FOR INSERT WITH CHECK ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can insert route stops" ON "public"."route_plan_stops" FOR INSERT WITH CHECK ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can insert settings" ON "public"."workspace_settings" FOR INSERT WITH CHECK ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can insert vendor SKUs" ON "public"."material_vendor_skus" FOR INSERT WITH CHECK ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can read AI jobs" ON "public"."ai_jobs" FOR SELECT USING ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can read AI review drafts" ON "public"."ai_review_drafts" FOR SELECT USING ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can read calendar events" ON "public"."client_calendar_events" FOR SELECT USING ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can read client activity" ON "public"."client_activity" FOR SELECT USING ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can read client notes" ON "public"."client_notes" FOR SELECT USING ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can read clients" ON "public"."clients" FOR SELECT USING ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can read document tag links" ON "public"."document_tag_links" FOR SELECT USING ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can read document tags" ON "public"."document_tags" FOR SELECT USING ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can read documents" ON "public"."documents" FOR SELECT USING ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can read estimate line items" ON "public"."estimate_line_items" FOR SELECT USING ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can read estimates" ON "public"."estimates" FOR SELECT USING ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can read expenses" ON "public"."expenses" FOR SELECT USING ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can read inventory" ON "public"."inventory_items" FOR SELECT USING ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can read inventory lots" ON "public"."inventory_lots" FOR SELECT USING ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can read invoice line items" ON "public"."invoice_line_items" FOR SELECT USING ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can read invoice payments" ON "public"."invoice_payments" FOR SELECT USING ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can read invoices" ON "public"."invoices" FOR SELECT USING ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can read job activity" ON "public"."job_activity" FOR SELECT USING ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can read job materials" ON "public"."job_materials" FOR SELECT USING ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can read jobs" ON "public"."jobs" FOR SELECT USING ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can read material allocations" ON "public"."job_material_allocations" FOR SELECT USING ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can read material catalog" ON "public"."material_catalog_items" FOR SELECT USING ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can read review draft revisions" ON "public"."ai_review_draft_revisions" FOR SELECT USING ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can read route plans" ON "public"."route_plans" FOR SELECT USING ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can read route stops" ON "public"."route_plan_stops" FOR SELECT USING ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can read settings" ON "public"."workspace_settings" FOR SELECT USING ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can read vendor SKUs" ON "public"."material_vendor_skus" FOR SELECT USING ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can update AI jobs" ON "public"."ai_jobs" FOR UPDATE USING ("public"."is_workspace_member"("workspace_id")) WITH CHECK ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can update calendar events" ON "public"."client_calendar_events" FOR UPDATE USING ("public"."is_workspace_member"("workspace_id")) WITH CHECK ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can update client activity" ON "public"."client_activity" FOR UPDATE USING ("public"."is_workspace_member"("workspace_id")) WITH CHECK ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can update client notes" ON "public"."client_notes" FOR UPDATE USING ("public"."is_workspace_member"("workspace_id")) WITH CHECK ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can update clients" ON "public"."clients" FOR UPDATE USING ("public"."is_workspace_member"("workspace_id")) WITH CHECK ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can update document tag links" ON "public"."document_tag_links" FOR UPDATE USING ("public"."is_workspace_member"("workspace_id")) WITH CHECK ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can update document tags" ON "public"."document_tags" FOR UPDATE USING ("public"."is_workspace_member"("workspace_id")) WITH CHECK ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can update documents" ON "public"."documents" FOR UPDATE USING ("public"."is_workspace_member"("workspace_id")) WITH CHECK ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can update estimate line items" ON "public"."estimate_line_items" FOR UPDATE USING ("public"."is_workspace_member"("workspace_id")) WITH CHECK ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can update estimates" ON "public"."estimates" FOR UPDATE USING ("public"."is_workspace_member"("workspace_id")) WITH CHECK ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can update expenses" ON "public"."expenses" FOR UPDATE USING ("public"."is_workspace_member"("workspace_id")) WITH CHECK ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can update inventory" ON "public"."inventory_items" FOR UPDATE USING ("public"."is_workspace_member"("workspace_id")) WITH CHECK ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can update inventory lots" ON "public"."inventory_lots" FOR UPDATE USING ("public"."is_workspace_member"("workspace_id")) WITH CHECK ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can update invoice line items" ON "public"."invoice_line_items" FOR UPDATE USING ("public"."is_workspace_member"("workspace_id")) WITH CHECK ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can update invoice payments" ON "public"."invoice_payments" FOR UPDATE USING ("public"."is_workspace_member"("workspace_id")) WITH CHECK ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can update invoices" ON "public"."invoices" FOR UPDATE USING ("public"."is_workspace_member"("workspace_id")) WITH CHECK ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can update job activity" ON "public"."job_activity" FOR UPDATE USING ("public"."is_workspace_member"("workspace_id")) WITH CHECK ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can update job materials" ON "public"."job_materials" FOR UPDATE USING ("public"."is_workspace_member"("workspace_id")) WITH CHECK ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can update jobs" ON "public"."jobs" FOR UPDATE USING ("public"."is_workspace_member"("workspace_id")) WITH CHECK ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can update material catalog" ON "public"."material_catalog_items" FOR UPDATE USING ("public"."is_workspace_member"("workspace_id")) WITH CHECK ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can update route plans" ON "public"."route_plans" FOR UPDATE USING ("public"."is_workspace_member"("workspace_id")) WITH CHECK ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can update route stops" ON "public"."route_plan_stops" FOR UPDATE USING ("public"."is_workspace_member"("workspace_id")) WITH CHECK ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can update settings" ON "public"."workspace_settings" FOR UPDATE USING ("public"."is_workspace_member"("workspace_id")) WITH CHECK ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can update vendor SKUs" ON "public"."material_vendor_skus" FOR UPDATE USING ("public"."is_workspace_member"("workspace_id")) WITH CHECK ("public"."is_workspace_member"("workspace_id"));



CREATE POLICY "Workspace members can update workspaces" ON "public"."workspaces" FOR UPDATE USING ("public"."is_workspace_member"("id")) WITH CHECK ("public"."is_workspace_member"("id"));



CREATE POLICY "Workspace members can view memberships" ON "public"."workspace_members" FOR SELECT USING (("public"."is_workspace_member"("workspace_id") OR ("user_id" = "auth"."uid"())));



CREATE POLICY "Workspace members can view workspaces" ON "public"."workspaces" FOR SELECT USING ("public"."is_workspace_member"("id"));



CREATE POLICY "Workspace owners can delete settings" ON "public"."workspace_settings" FOR DELETE USING ("public"."is_workspace_owner"("workspace_id"));



CREATE POLICY "Workspace owners can delete workspaces" ON "public"."workspaces" FOR DELETE USING ("public"."is_workspace_owner"("id"));



ALTER TABLE "public"."admin_audit_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ai_jobs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ai_review_draft_revisions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ai_review_drafts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."client_activity" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."client_calendar_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."client_notes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."clients" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."document_tag_links" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."document_tags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."documents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."estimate_line_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."estimates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."expenses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."inventory_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."inventory_lots" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."invoice_line_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."invoice_payments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."invoices" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."job_activity" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."job_material_allocations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."job_materials" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."jobs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."material_catalog_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."material_vendor_skus" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."platform_admins" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."route_plan_stops" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."route_plans" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."workspace_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."workspace_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."workspaces" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."accept_workspace_invites_for_current_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."accept_workspace_invites_for_current_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."accept_workspace_invites_for_current_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."capture_ai_review_draft_revision"() TO "anon";
GRANT ALL ON FUNCTION "public"."capture_ai_review_draft_revision"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."capture_ai_review_draft_revision"() TO "service_role";



GRANT ALL ON TABLE "public"."job_material_allocations" TO "anon";
GRANT ALL ON TABLE "public"."job_material_allocations" TO "authenticated";
GRANT ALL ON TABLE "public"."job_material_allocations" TO "service_role";



REVOKE ALL ON FUNCTION "public"."create_material_allocation_draft"("target_workspace_id" "uuid", "target_job_id" "uuid", "allocation_mode" "text", "material_rows" "jsonb", "source_document_id" "uuid", "source_review_draft_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."create_material_allocation_draft"("target_workspace_id" "uuid", "target_job_id" "uuid", "allocation_mode" "text", "material_rows" "jsonb", "source_document_id" "uuid", "source_review_draft_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."create_material_allocation_draft"("target_workspace_id" "uuid", "target_job_id" "uuid", "allocation_mode" "text", "material_rows" "jsonb", "source_document_id" "uuid", "source_review_draft_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_material_allocation_draft"("target_workspace_id" "uuid", "target_job_id" "uuid", "allocation_mode" "text", "material_rows" "jsonb", "source_document_id" "uuid", "source_review_draft_id" "uuid") TO "service_role";



GRANT ALL ON TABLE "public"."workspaces" TO "anon";
GRANT ALL ON TABLE "public"."workspaces" TO "authenticated";
GRANT ALL ON TABLE "public"."workspaces" TO "service_role";



GRANT ALL ON FUNCTION "public"."create_workspace_with_owner"("workspace_id" "uuid", "workspace_name" "text", "workspace_type" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_workspace_with_owner"("workspace_id" "uuid", "workspace_name" "text", "workspace_type" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_workspace_with_owner"("workspace_id" "uuid", "workspace_name" "text", "workspace_type" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."ensure_material_catalog_item"() TO "anon";
GRANT ALL ON FUNCTION "public"."ensure_material_catalog_item"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."ensure_material_catalog_item"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_platform_admin_summary"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_platform_admin_summary"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_platform_admin_summary"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_platform_admin_summary"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_auth_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_auth_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_auth_user"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."has_workspace_role"("target_workspace_id" "uuid", "allowed_roles" "text"[]) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."has_workspace_role"("target_workspace_id" "uuid", "allowed_roles" "text"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."has_workspace_role"("target_workspace_id" "uuid", "allowed_roles" "text"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_workspace_role"("target_workspace_id" "uuid", "allowed_roles" "text"[]) TO "service_role";



REVOKE ALL ON FUNCTION "public"."is_platform_admin"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."is_platform_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_platform_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_platform_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_workspace_creator"("target_workspace_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_workspace_creator"("target_workspace_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_workspace_creator"("target_workspace_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."is_workspace_manager"("target_workspace_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."is_workspace_manager"("target_workspace_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_workspace_manager"("target_workspace_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_workspace_manager"("target_workspace_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_workspace_member"("target_workspace_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_workspace_member"("target_workspace_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_workspace_member"("target_workspace_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."is_workspace_owner"("target_workspace_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."is_workspace_owner"("target_workspace_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_workspace_owner"("target_workspace_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_workspace_owner"("target_workspace_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."storage_workspace_id"("object_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."storage_workspace_id"("object_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."storage_workspace_id"("object_name" "text") TO "service_role";



GRANT ALL ON TABLE "public"."invoices" TO "anon";
GRANT ALL ON TABLE "public"."invoices" TO "authenticated";
GRANT ALL ON TABLE "public"."invoices" TO "service_role";



GRANT ALL ON FUNCTION "public"."upsert_invoice_with_lines"("invoice_payload" "jsonb", "line_items_payload" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."upsert_invoice_with_lines"("invoice_payload" "jsonb", "line_items_payload" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."upsert_invoice_with_lines"("invoice_payload" "jsonb", "line_items_payload" "jsonb") TO "service_role";



GRANT ALL ON TABLE "public"."jobs" TO "anon";
GRANT ALL ON TABLE "public"."jobs" TO "authenticated";
GRANT ALL ON TABLE "public"."jobs" TO "service_role";



GRANT ALL ON FUNCTION "public"."upsert_job_with_materials"("job_payload" "jsonb", "materials_payload" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."upsert_job_with_materials"("job_payload" "jsonb", "materials_payload" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."upsert_job_with_materials"("job_payload" "jsonb", "materials_payload" "jsonb") TO "service_role";



GRANT ALL ON TABLE "public"."route_plans" TO "anon";
GRANT ALL ON TABLE "public"."route_plans" TO "authenticated";
GRANT ALL ON TABLE "public"."route_plans" TO "service_role";



GRANT ALL ON FUNCTION "public"."upsert_route_with_stops"("route_payload" "jsonb", "stops_payload" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."upsert_route_with_stops"("route_payload" "jsonb", "stops_payload" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."upsert_route_with_stops"("route_payload" "jsonb", "stops_payload" "jsonb") TO "service_role";



GRANT ALL ON TABLE "public"."admin_audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."admin_audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_audit_logs" TO "service_role";



GRANT ALL ON TABLE "public"."ai_jobs" TO "anon";
GRANT ALL ON TABLE "public"."ai_jobs" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_jobs" TO "service_role";



GRANT ALL ON TABLE "public"."ai_review_draft_revisions" TO "anon";
GRANT ALL ON TABLE "public"."ai_review_draft_revisions" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_review_draft_revisions" TO "service_role";



GRANT ALL ON TABLE "public"."ai_review_drafts" TO "anon";
GRANT ALL ON TABLE "public"."ai_review_drafts" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_review_drafts" TO "service_role";



GRANT ALL ON TABLE "public"."client_activity" TO "anon";
GRANT ALL ON TABLE "public"."client_activity" TO "authenticated";
GRANT ALL ON TABLE "public"."client_activity" TO "service_role";



GRANT ALL ON TABLE "public"."client_calendar_events" TO "anon";
GRANT ALL ON TABLE "public"."client_calendar_events" TO "authenticated";
GRANT ALL ON TABLE "public"."client_calendar_events" TO "service_role";



GRANT ALL ON TABLE "public"."client_notes" TO "anon";
GRANT ALL ON TABLE "public"."client_notes" TO "authenticated";
GRANT ALL ON TABLE "public"."client_notes" TO "service_role";



GRANT ALL ON TABLE "public"."clients" TO "anon";
GRANT ALL ON TABLE "public"."clients" TO "authenticated";
GRANT ALL ON TABLE "public"."clients" TO "service_role";



GRANT ALL ON TABLE "public"."document_tag_links" TO "anon";
GRANT ALL ON TABLE "public"."document_tag_links" TO "authenticated";
GRANT ALL ON TABLE "public"."document_tag_links" TO "service_role";



GRANT ALL ON TABLE "public"."document_tags" TO "anon";
GRANT ALL ON TABLE "public"."document_tags" TO "authenticated";
GRANT ALL ON TABLE "public"."document_tags" TO "service_role";



GRANT ALL ON TABLE "public"."documents" TO "anon";
GRANT ALL ON TABLE "public"."documents" TO "authenticated";
GRANT ALL ON TABLE "public"."documents" TO "service_role";



GRANT ALL ON TABLE "public"."estimate_line_items" TO "anon";
GRANT ALL ON TABLE "public"."estimate_line_items" TO "authenticated";
GRANT ALL ON TABLE "public"."estimate_line_items" TO "service_role";



GRANT ALL ON TABLE "public"."estimates" TO "anon";
GRANT ALL ON TABLE "public"."estimates" TO "authenticated";
GRANT ALL ON TABLE "public"."estimates" TO "service_role";



GRANT ALL ON TABLE "public"."expenses" TO "anon";
GRANT ALL ON TABLE "public"."expenses" TO "authenticated";
GRANT ALL ON TABLE "public"."expenses" TO "service_role";



GRANT ALL ON TABLE "public"."inventory_items" TO "anon";
GRANT ALL ON TABLE "public"."inventory_items" TO "authenticated";
GRANT ALL ON TABLE "public"."inventory_items" TO "service_role";



GRANT ALL ON TABLE "public"."inventory_lots" TO "anon";
GRANT ALL ON TABLE "public"."inventory_lots" TO "authenticated";
GRANT ALL ON TABLE "public"."inventory_lots" TO "service_role";



GRANT ALL ON TABLE "public"."invoice_line_items" TO "anon";
GRANT ALL ON TABLE "public"."invoice_line_items" TO "authenticated";
GRANT ALL ON TABLE "public"."invoice_line_items" TO "service_role";



GRANT ALL ON TABLE "public"."invoice_payments" TO "anon";
GRANT ALL ON TABLE "public"."invoice_payments" TO "authenticated";
GRANT ALL ON TABLE "public"."invoice_payments" TO "service_role";



GRANT ALL ON TABLE "public"."job_activity" TO "anon";
GRANT ALL ON TABLE "public"."job_activity" TO "authenticated";
GRANT ALL ON TABLE "public"."job_activity" TO "service_role";



GRANT ALL ON TABLE "public"."job_materials" TO "anon";
GRANT ALL ON TABLE "public"."job_materials" TO "authenticated";
GRANT ALL ON TABLE "public"."job_materials" TO "service_role";



GRANT ALL ON TABLE "public"."material_catalog_items" TO "anon";
GRANT ALL ON TABLE "public"."material_catalog_items" TO "authenticated";
GRANT ALL ON TABLE "public"."material_catalog_items" TO "service_role";



GRANT ALL ON TABLE "public"."material_vendor_skus" TO "anon";
GRANT ALL ON TABLE "public"."material_vendor_skus" TO "authenticated";
GRANT ALL ON TABLE "public"."material_vendor_skus" TO "service_role";



GRANT ALL ON TABLE "public"."platform_admins" TO "anon";
GRANT ALL ON TABLE "public"."platform_admins" TO "authenticated";
GRANT ALL ON TABLE "public"."platform_admins" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."route_plan_stops" TO "anon";
GRANT ALL ON TABLE "public"."route_plan_stops" TO "authenticated";
GRANT ALL ON TABLE "public"."route_plan_stops" TO "service_role";



GRANT ALL ON TABLE "public"."workspace_members" TO "anon";
GRANT ALL ON TABLE "public"."workspace_members" TO "authenticated";
GRANT ALL ON TABLE "public"."workspace_members" TO "service_role";



GRANT ALL ON TABLE "public"."workspace_settings" TO "anon";
GRANT ALL ON TABLE "public"."workspace_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."workspace_settings" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";
