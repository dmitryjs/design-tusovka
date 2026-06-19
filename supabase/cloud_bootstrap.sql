-- Supabase Cloud bootstrap - Design Tusovka MVP
-- Consolidates migrations 20260618185410 through 20260618195500
-- Run FIRST in Supabase Dashboard -> SQL Editor
-- Safe to re-run: IF NOT EXISTS / OR REPLACE / DROP IF EXISTS
-- Does NOT use DROP SCHEMA or destructive reset

create extension if not exists pgcrypto with schema extensions;

DO $$ BEGIN
  CREATE TYPE public.product_kind AS ENUM ('material', 'task', 'section', 'section_update');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.product_status AS ENUM ('draft', 'published', 'hidden');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.material_format AS ENUM ('mini_guide', 'full_guide', 'notes', 'checklist', 'template', 'cheat_sheet', 'lesson', 'practice');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.designer_level AS ENUM ('junior', 'middle', 'senior', 'all');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.entitlement_source_type AS ENUM ('direct_order', 'zero_order', 'section_order', 'section_update', 'manual', 'free_task_submission', 'all_materials_owned');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Stage 3.2: catalog and content schema

-- Shared helpers

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_valid_slug(slug text)
returns boolean
language sql
immutable
as $$
  select slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$';
$$;

create or replace function public.ensure_product_kind()
returns trigger
language plpgsql
as $$
begin
  if not exists (
    select 1
    from public.products p
    where p.id = new.product_id
      and p.kind = tg_argv[0]::public.product_kind
  ) then
    raise exception 'product % must have kind %', new.product_id, tg_argv[0];
  end if;

  return new;
end;
$$;

create or replace function public.ensure_section_update_material_same_section()
returns trigger
language plpgsql
as $$
declare
  v_section_product_id uuid;
begin
  select su.section_product_id
  into v_section_product_id
  from public.section_updates su
  where su.product_id = new.section_update_product_id;

  if not exists (
    select 1
    from public.materials m
    where m.product_id = new.material_product_id
      and m.section_product_id = v_section_product_id
  ) then
    raise exception 'material % does not belong to section % for update %',
      new.material_product_id,
      v_section_product_id,
      new.section_update_product_id;
  end if;

  return new;
end;
$$;

-- products

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  kind public.product_kind not null,
  status public.product_status not null default 'draft',
  slug text not null,
  title text not null,
  description text not null default '',
  cover_path text,
  price_kopecks integer not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_slug_unique unique (slug),
  constraint products_title_not_empty check (length(trim(title)) > 0),
  constraint products_slug_valid check (public.is_valid_slug(slug)),
  constraint products_price_non_negative check (price_kopecks >= 0)
);

create index if not exists products_kind_idx on public.products (kind);
create index if not exists products_status_idx on public.products (status);
create index if not exists products_published_at_idx on public.products (published_at);
create index if not exists products_price_kopecks_idx on public.products (price_kopecks);

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row
  execute function public.set_updated_at();

-- sections

create table if not exists public.sections (
  product_id uuid primary key references public.products (id) on delete cascade,
  position integer not null default 0,
  what_you_get jsonb not null default '[]'::jsonb,
  for_whom jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists sections_ensure_product_kind on public.sections;
create trigger sections_ensure_product_kind
  before insert or update on public.sections
  for each row
  execute function public.ensure_product_kind('section');

drop trigger if exists sections_set_updated_at on public.sections;
create trigger sections_set_updated_at
  before update on public.sections
  for each row
  execute function public.set_updated_at();

-- materials

create table if not exists public.materials (
  product_id uuid primary key references public.products (id) on delete cascade,
  section_product_id uuid not null references public.sections (product_id),
  format public.material_format not null,
  level public.designer_level not null default 'all',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists materials_section_product_id_idx on public.materials (section_product_id);

drop trigger if exists materials_ensure_product_kind on public.materials;
create trigger materials_ensure_product_kind
  before insert or update on public.materials
  for each row
  execute function public.ensure_product_kind('material');

drop trigger if exists materials_set_updated_at on public.materials;
create trigger materials_set_updated_at
  before update on public.materials
  for each row
  execute function public.set_updated_at();

-- material_chapters

create table if not exists public.material_chapters (
  id uuid primary key default gen_random_uuid(),
  material_product_id uuid not null references public.materials (product_id) on delete cascade,
  title text not null,
  content jsonb not null default '[]'::jsonb,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint material_chapters_title_not_empty check (length(trim(title)) > 0),
  constraint material_chapters_position_non_negative check (position >= 0),
  constraint material_chapters_material_position_unique unique (material_product_id, position)
);

create index if not exists material_chapters_material_product_id_position_idx
  on public.material_chapters (material_product_id, position);

drop trigger if exists material_chapters_set_updated_at on public.material_chapters;
create trigger material_chapters_set_updated_at
  before update on public.material_chapters
  for each row
  execute function public.set_updated_at();

-- tasks

create table if not exists public.tasks (
  product_id uuid primary key references public.products (id) on delete cascade,
  level public.designer_level not null default 'all',
  ai_review_available boolean not null default true,
  manual_review_available boolean not null default false,
  manual_review_price_kopecks integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tasks_manual_review_price_non_negative check (
    manual_review_price_kopecks is null or manual_review_price_kopecks >= 0
  )
);

drop trigger if exists tasks_ensure_product_kind on public.tasks;
create trigger tasks_ensure_product_kind
  before insert or update on public.tasks
  for each row
  execute function public.ensure_product_kind('task');

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
  before update on public.tasks
  for each row
  execute function public.set_updated_at();

-- task_content

create table if not exists public.task_content (
  task_product_id uuid primary key references public.tasks (product_id) on delete cascade,
  brief jsonb not null default '[]'::jsonb,
  submission_requirements jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists task_content_set_updated_at on public.task_content;
create trigger task_content_set_updated_at
  before update on public.task_content
  for each row
  execute function public.set_updated_at();

-- task_ai_criteria

create table if not exists public.task_ai_criteria (
  id uuid primary key default gen_random_uuid(),
  task_product_id uuid not null references public.tasks (product_id) on delete cascade,
  title text not null,
  description text not null default '',
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint task_ai_criteria_title_not_empty check (length(trim(title)) > 0),
  constraint task_ai_criteria_position_non_negative check (position >= 0),
  constraint task_ai_criteria_task_position_unique unique (task_product_id, position)
);

drop trigger if exists task_ai_criteria_set_updated_at on public.task_ai_criteria;
create trigger task_ai_criteria_set_updated_at
  before update on public.task_ai_criteria
  for each row
  execute function public.set_updated_at();

-- tags

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tags_slug_unique unique (slug),
  constraint tags_slug_valid check (public.is_valid_slug(slug)),
  constraint tags_name_not_empty check (length(trim(name)) > 0)
);

drop trigger if exists tags_set_updated_at on public.tags;
create trigger tags_set_updated_at
  before update on public.tags
  for each row
  execute function public.set_updated_at();

-- product_tags

create table if not exists public.product_tags (
  product_id uuid not null references public.products (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (product_id, tag_id)
);

create index if not exists product_tags_product_id_idx on public.product_tags (product_id);
create index if not exists product_tags_tag_id_idx on public.product_tags (tag_id);

-- section_updates

create table if not exists public.section_updates (
  product_id uuid primary key references public.products (id) on delete cascade,
  section_product_id uuid not null references public.sections (product_id) on delete cascade,
  release_number integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint section_updates_release_number_positive check (release_number > 0),
  constraint section_updates_section_release_unique unique (section_product_id, release_number)
);

drop trigger if exists section_updates_ensure_product_kind on public.section_updates;
create trigger section_updates_ensure_product_kind
  before insert or update on public.section_updates
  for each row
  execute function public.ensure_product_kind('section_update');

drop trigger if exists section_updates_set_updated_at on public.section_updates;
create trigger section_updates_set_updated_at
  before update on public.section_updates
  for each row
  execute function public.set_updated_at();

-- section_update_materials

create table if not exists public.section_update_materials (
  section_update_product_id uuid not null references public.section_updates (product_id) on delete cascade,
  material_product_id uuid not null references public.materials (product_id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (section_update_product_id, material_product_id)
);

drop trigger if exists section_update_materials_same_section on public.section_update_materials;
create trigger section_update_materials_same_section
  before insert or update on public.section_update_materials
  for each row
  execute function public.ensure_section_update_material_same_section();

-- RLS: enabled without policies (stage 3.3)

alter table public.products enable row level security;
alter table public.sections enable row level security;
alter table public.materials enable row level security;
alter table public.material_chapters enable row level security;
alter table public.tasks enable row level security;
alter table public.task_content enable row level security;
alter table public.task_ai_criteria enable row level security;
alter table public.tags enable row level security;
alter table public.product_tags enable row level security;
alter table public.section_updates enable row level security;
alter table public.section_update_materials enable row level security;


-- Stage 3.3.1: profiles and access foundation

-- profiles

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_path text,
  telegram_username text,
  designer_level public.designer_level not null default 'all',
  deactivated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

alter table public.profiles enable row level security;

drop policy if exists profiles_select_own on public.profiles;
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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- admin_users

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- entitlements

create table if not exists public.entitlements (
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

create index if not exists entitlements_active_user_product_idx
  on public.entitlements (user_id, product_id)
  where revoked_at is null;

create index if not exists entitlements_source_type_source_id_idx
  on public.entitlements (source_type, source_id);

create index if not exists entitlements_product_id_idx
  on public.entitlements (product_id);

alter table public.entitlements enable row level security;

drop policy if exists entitlements_select_own on public.entitlements;
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


-- Stage 3.3.2: catalog RLS and safe public read

-- products

drop policy if exists products_select_published on public.products;
create policy products_select_published
  on public.products
  for select
  to anon, authenticated
  using (status = 'published'::public.product_status);

-- sections

drop policy if exists sections_select_published on public.sections;
create policy sections_select_published
  on public.sections
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.products p
      where p.id = sections.product_id
        and p.status = 'published'::public.product_status
    )
  );

-- materials

drop policy if exists materials_select_published on public.materials;
create policy materials_select_published
  on public.materials
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.products p
      where p.id = materials.product_id
        and p.status = 'published'::public.product_status
    )
  );

-- tasks

drop policy if exists tasks_select_published on public.tasks;
create policy tasks_select_published
  on public.tasks
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.products p
      where p.id = tasks.product_id
        and p.status = 'published'::public.product_status
    )
  );

-- tags (only linked to published products)

drop policy if exists tags_select_published on public.tags;
create policy tags_select_published
  on public.tags
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.product_tags pt
      inner join public.products p on p.id = pt.product_id
      where pt.tag_id = tags.id
        and p.status = 'published'::public.product_status
    )
  );

-- product_tags

drop policy if exists product_tags_select_published on public.product_tags;
create policy product_tags_select_published
  on public.product_tags
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.products p
      where p.id = product_tags.product_id
        and p.status = 'published'::public.product_status
    )
  );

-- section_updates

drop policy if exists section_updates_select_published on public.section_updates;
create policy section_updates_select_published
  on public.section_updates
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.products p
      where p.id = section_updates.product_id
        and p.status = 'published'::public.product_status
    )
    and exists (
      select 1
      from public.sections s
      inner join public.products sp on sp.id = s.product_id
      where s.product_id = section_updates.section_product_id
        and sp.status = 'published'::public.product_status
    )
  );

-- section_update_materials

drop policy if exists section_update_materials_select_published on public.section_update_materials;
create policy section_update_materials_select_published
  on public.section_update_materials
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.section_updates su
      inner join public.products p on p.id = su.product_id
      where su.product_id = section_update_materials.section_update_product_id
        and p.status = 'published'::public.product_status
    )
    and exists (
      select 1
      from public.materials m
      inner join public.products mp on mp.id = m.product_id
      where m.product_id = section_update_materials.material_product_id
        and mp.status = 'published'::public.product_status
    )
  );

-- material_chapters: full rows only with entitlement (content must not leak)

drop policy if exists material_chapters_select_entitled on public.material_chapters;
create policy material_chapters_select_entitled
  on public.material_chapters
  for select
  to authenticated
  using (public.has_product_access(material_product_id));

-- task_content: free published task or entitled

drop policy if exists task_content_select_free_or_entitled on public.task_content;
create policy task_content_select_free_or_entitled
  on public.task_content
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.tasks t
      inner join public.products p on p.id = t.product_id
      where t.product_id = task_content.task_product_id
        and p.status = 'published'::public.product_status
        and (
          p.price_kopecks = 0
          or public.has_product_access(t.product_id)
        )
    )
  );

-- task_ai_criteria: same as task_content

drop policy if exists task_ai_criteria_select_free_or_entitled on public.task_ai_criteria;
create policy task_ai_criteria_select_free_or_entitled
  on public.task_ai_criteria
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.tasks t
      inner join public.products p on p.id = t.product_id
      where t.product_id = task_ai_criteria.task_product_id
        and p.status = 'published'::public.product_status
        and (
          p.price_kopecks = 0
          or public.has_product_access(t.product_id)
        )
    )
  );

-- get_material_toc: published material outline without content

create or replace function public.get_material_toc(p_material_product_id uuid)
returns table (
  id uuid,
  material_product_id uuid,
  title text,
  "position" integer
)
language sql
stable
security definer
set search_path = public
as $$
  select
    mc.id,
    mc.material_product_id,
    mc.title,
    mc.position
  from public.material_chapters mc
  inner join public.materials m on m.product_id = mc.material_product_id
  inner join public.products p on p.id = m.product_id
  where mc.material_product_id = p_material_product_id
    and p.status = 'published'::public.product_status
    and p.kind = 'material'::public.product_kind
  order by mc.position;
$$;

comment on function public.get_material_toc (uuid) is
  'Returns chapter id, title and position for a published material. Does not expose content. Available to anon and authenticated without entitlement.';

grant execute on function public.get_material_toc (uuid) to anon, authenticated;


-- Stage 3.3.4: API grants for RLS (PostgREST)

grant usage on schema public to anon, authenticated;

-- Catalog metadata: RLS filters published rows
grant select on table public.products to anon, authenticated;
grant select on table public.sections to anon, authenticated;
grant select on table public.materials to anon, authenticated;
grant select on table public.tasks to anon, authenticated;
grant select on table public.tags to anon, authenticated;
grant select on table public.product_tags to anon, authenticated;
grant select on table public.section_updates to anon, authenticated;
grant select on table public.section_update_materials to anon, authenticated;
grant select on table public.task_content to anon, authenticated;
grant select on table public.task_ai_criteria to anon, authenticated;

-- User-scoped / entitled content: RLS enforces ownership or access
grant select on table public.profiles to authenticated;
grant select on table public.entitlements to authenticated;
grant select on table public.material_chapters to authenticated;

-- admin_users: no client grants (service role only)

-- RPC: has_product_access is for authenticated users only
revoke execute on function public.has_product_access (uuid) from anon;

-- get_material_toc, update_my_profile: granted in prior migrations

-- task policies: split free vs entitled so anon never invokes has_product_access
drop policy if exists task_content_select_free_or_entitled on public.task_content;

drop policy if exists task_content_select_free on public.task_content;
create policy task_content_select_free
  on public.task_content
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.tasks t
      inner join public.products p on p.id = t.product_id
      where t.product_id = task_content.task_product_id
        and p.status = 'published'::public.product_status
        and p.price_kopecks = 0
    )
  );

drop policy if exists task_content_select_entitled on public.task_content;
create policy task_content_select_entitled
  on public.task_content
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.tasks t
      inner join public.products p on p.id = t.product_id
      where t.product_id = task_content.task_product_id
        and p.status = 'published'::public.product_status
        and p.price_kopecks > 0
        and public.has_product_access(t.product_id)
    )
  );

drop policy if exists task_ai_criteria_select_free_or_entitled on public.task_ai_criteria;

drop policy if exists task_ai_criteria_select_free on public.task_ai_criteria;
create policy task_ai_criteria_select_free
  on public.task_ai_criteria
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.tasks t
      inner join public.products p on p.id = t.product_id
      where t.product_id = task_ai_criteria.task_product_id
        and p.status = 'published'::public.product_status
        and p.price_kopecks = 0
    )
  );

drop policy if exists task_ai_criteria_select_entitled on public.task_ai_criteria;
create policy task_ai_criteria_select_entitled
  on public.task_ai_criteria
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.tasks t
      inner join public.products p on p.id = t.product_id
      where t.product_id = task_ai_criteria.task_product_id
        and p.status = 'published'::public.product_status
        and p.price_kopecks > 0
        and public.has_product_access(t.product_id)
    )
  );
