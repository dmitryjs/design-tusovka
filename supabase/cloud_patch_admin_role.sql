-- Admin role on profiles
-- Run in Supabase SQL Editor AFTER cloud_bootstrap.sql
-- Then assign admin manually (see docs/SUPABASE_CLOUD_BOOTSTRAP.md)

do $$ begin
  create type public.profile_role as enum ('user', 'admin');
exception
  when duplicate_object then null;
end $$;

alter table public.profiles
  add column if not exists role public.profile_role not null default 'user';

create or replace function public.profiles_guard_role_column()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' and new.role is distinct from old.role then
    if nullif(current_setting('request.jwt.claims', true), '') is not null then
      raise exception 'profile role cannot be changed by users';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_guard_role_column on public.profiles;
create trigger profiles_guard_role_column
  before update on public.profiles
  for each row
  execute function public.profiles_guard_role_column();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_display_name text;
begin
  v_display_name := nullif(
    trim(
      coalesce(
        new.raw_user_meta_data ->> 'display_name',
        new.raw_user_meta_data ->> 'full_name',
        new.raw_user_meta_data ->> 'name',
        ''
      )
    ),
    ''
  );

  insert into public.profiles (id, display_name, role)
  values (new.id, v_display_name, 'user');

  return new;
end;
$$;

notify pgrst, 'reload schema';
