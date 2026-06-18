create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
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

drop trigger if exists auth_users_create_profile on auth.users;
create trigger auth_users_create_profile
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

alter table public.documents
  add column if not exists uploaded_by uuid references public.profiles(id) on delete set null,
  add column if not exists status text not null default 'Metadata available';

create index if not exists documents_uploaded_by_idx
  on public.documents (uploaded_by);
create index if not exists documents_status_idx
  on public.documents (status);

insert into storage.buckets (id, name, public)
values ('workspace-documents', 'workspace-documents', false)
on conflict (id) do update
  set public = false;

/*
  Intended private storage path structure:
  workspaceId/userId/timestamp-filename

  File preview/download remains intentionally deferred. Metadata can be read
  through workspace document policies and platform admin server-only routes.
*/
