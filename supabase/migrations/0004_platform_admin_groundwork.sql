create table public.platform_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'Admin',
  created_at timestamptz not null default now(),
  constraint platform_admins_role_check check (role in ('Owner', 'Admin', 'Support')),
  constraint platform_admins_email_normalized_check check (email = lower(trim(email)))
);

alter table public.platform_admins enable row level security;

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.platform_admins
    where user_id = auth.uid()
  );
$$;

create policy "Platform admins can read platform admins"
  on public.platform_admins for select
  using (public.is_platform_admin());

create or replace function public.get_platform_admin_summary()
returns table (
  admin_email text,
  auth_user_count bigint,
  profile_count bigint,
  workspace_count bigint,
  client_count bigint,
  job_count bigint,
  invoice_count bigint,
  document_count bigint,
  route_plan_count bigint
)
language plpgsql
stable
security definer
set search_path = public, auth
as $$
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

revoke execute on function public.is_platform_admin() from public;
revoke execute on function public.get_platform_admin_summary() from public;
grant execute on function public.is_platform_admin() to authenticated;
grant execute on function public.get_platform_admin_summary() to authenticated;

/*
  One-time platform owner promotion helper.

  Replace the placeholder email before running manually in Supabase SQL Editor.
  Do not commit a real private email address here.

  with target_user as (
    select
      id,
      lower(email) as email
    from auth.users
    where lower(email) = lower('replace-me@example.com')
    limit 1
  ),
  profile_upsert as (
    insert into public.profiles (id, email, display_name)
    select id, email, email
    from target_user
    on conflict (id) do update
      set email = excluded.email,
          display_name = coalesce(public.profiles.display_name, excluded.display_name)
    returning id
  )
  insert into public.platform_admins (user_id, email, role)
  select target_user.id, target_user.email, 'Owner'
  from target_user
  on conflict (user_id) do update
    set email = excluded.email,
        role = 'Owner';
*/
