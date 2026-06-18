-- Stage 3.3.1: profiles and access foundation

-- Enum

create type public.entitlement_source_type as enum (
  'direct_order',
  'zero_order',
  'section_order',
  'section_update',
  'manual',
  'free_task_submission',
  'all_materials_owned'
);

-- profiles

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_path text,
  telegram_username text,
  designer_level public.designer_level not null default 'all',
  deactivated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

alter table public.profiles enable row level security;

create policy profiles_select_own
  on public.profiles
  for select
  to authenticated
  using (id = (select auth.uid()));

-- Profile creation on auth signup

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

  insert into public.profiles (id, display_name)
  values (new.id, v_display_name);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- admin_users

create table public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- entitlements

create table public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  source_type public.entitlement_source_type not null,
  source_id uuid not null,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  constraint entitlements_revoked_after_granted check (
    revoked_at is null or revoked_at >= granted_at
  ),
  constraint entitlements_user_product_source_unique unique (
    user_id,
    product_id,
    source_type,
    source_id
  )
);

create index entitlements_active_user_product_idx
  on public.entitlements (user_id, product_id)
  where revoked_at is null;

create index entitlements_source_type_source_id_idx
  on public.entitlements (source_type, source_id);

create index entitlements_product_id_idx
  on public.entitlements (product_id);

alter table public.entitlements enable row level security;

create policy entitlements_select_own
  on public.entitlements
  for select
  to authenticated
  using (user_id = (select auth.uid()));

-- has_product_access

create or replace function public.has_product_access(product_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1
    from public.entitlements e
    where e.user_id = (select auth.uid())
      and e.product_id = has_product_access.product_id
      and e.revoked_at is null
  );
$$;

comment on function public.has_product_access (uuid) is
  'Returns true if the current authenticated user has an active (non-revoked) entitlement to the product. Anonymous users always get false.';

grant execute on function public.has_product_access (uuid) to authenticated, anon;

-- update_my_profile

create or replace function public.update_my_profile(
  display_name text,
  avatar_path text,
  telegram_username text,
  designer_level public.designer_level
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := (select auth.uid());
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  update public.profiles
  set
    display_name = update_my_profile.display_name,
    avatar_path = update_my_profile.avatar_path,
    telegram_username = update_my_profile.telegram_username,
    designer_level = update_my_profile.designer_level
  where id = v_user_id;

  if not found then
    raise exception 'Profile not found';
  end if;
end;
$$;

grant execute on function public.update_my_profile (
  text,
  text,
  text,
  public.designer_level
) to authenticated;
