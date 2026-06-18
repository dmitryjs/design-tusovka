-- Stage 3.2: catalog and content schema

create extension if not exists pgcrypto with schema extensions;

-- Enums

create type public.product_kind as enum (
  'material',
  'task',
  'section',
  'section_update'
);

create type public.product_status as enum (
  'draft',
  'published',
  'hidden'
);

create type public.material_format as enum (
  'mini_guide',
  'full_guide',
  'notes',
  'checklist',
  'template',
  'cheat_sheet',
  'lesson',
  'practice'
);

create type public.designer_level as enum (
  'junior',
  'middle',
  'senior',
  'all'
);

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

create table public.products (
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

create index products_kind_idx on public.products (kind);
create index products_status_idx on public.products (status);
create index products_published_at_idx on public.products (published_at);
create index products_price_kopecks_idx on public.products (price_kopecks);

create trigger products_set_updated_at
  before update on public.products
  for each row
  execute function public.set_updated_at();

-- sections

create table public.sections (
  product_id uuid primary key references public.products (id) on delete cascade,
  position integer not null default 0,
  what_you_get jsonb not null default '[]'::jsonb,
  for_whom jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger sections_ensure_product_kind
  before insert or update on public.sections
  for each row
  execute function public.ensure_product_kind('section');

create trigger sections_set_updated_at
  before update on public.sections
  for each row
  execute function public.set_updated_at();

-- materials

create table public.materials (
  product_id uuid primary key references public.products (id) on delete cascade,
  section_product_id uuid not null references public.sections (product_id),
  format public.material_format not null,
  level public.designer_level not null default 'all',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index materials_section_product_id_idx on public.materials (section_product_id);

create trigger materials_ensure_product_kind
  before insert or update on public.materials
  for each row
  execute function public.ensure_product_kind('material');

create trigger materials_set_updated_at
  before update on public.materials
  for each row
  execute function public.set_updated_at();

-- material_chapters

create table public.material_chapters (
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

create index material_chapters_material_product_id_position_idx
  on public.material_chapters (material_product_id, position);

create trigger material_chapters_set_updated_at
  before update on public.material_chapters
  for each row
  execute function public.set_updated_at();

-- tasks

create table public.tasks (
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

create trigger tasks_ensure_product_kind
  before insert or update on public.tasks
  for each row
  execute function public.ensure_product_kind('task');

create trigger tasks_set_updated_at
  before update on public.tasks
  for each row
  execute function public.set_updated_at();

-- task_content

create table public.task_content (
  task_product_id uuid primary key references public.tasks (product_id) on delete cascade,
  brief jsonb not null default '[]'::jsonb,
  submission_requirements jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger task_content_set_updated_at
  before update on public.task_content
  for each row
  execute function public.set_updated_at();

-- task_ai_criteria

create table public.task_ai_criteria (
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

create trigger task_ai_criteria_set_updated_at
  before update on public.task_ai_criteria
  for each row
  execute function public.set_updated_at();

-- tags

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tags_slug_unique unique (slug),
  constraint tags_slug_valid check (public.is_valid_slug(slug)),
  constraint tags_name_not_empty check (length(trim(name)) > 0)
);

create trigger tags_set_updated_at
  before update on public.tags
  for each row
  execute function public.set_updated_at();

-- product_tags

create table public.product_tags (
  product_id uuid not null references public.products (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (product_id, tag_id)
);

create index product_tags_product_id_idx on public.product_tags (product_id);
create index product_tags_tag_id_idx on public.product_tags (tag_id);

-- section_updates

create table public.section_updates (
  product_id uuid primary key references public.products (id) on delete cascade,
  section_product_id uuid not null references public.sections (product_id) on delete cascade,
  release_number integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint section_updates_release_number_positive check (release_number > 0),
  constraint section_updates_section_release_unique unique (section_product_id, release_number)
);

create trigger section_updates_ensure_product_kind
  before insert or update on public.section_updates
  for each row
  execute function public.ensure_product_kind('section_update');

create trigger section_updates_set_updated_at
  before update on public.section_updates
  for each row
  execute function public.set_updated_at();

-- section_update_materials

create table public.section_update_materials (
  section_update_product_id uuid not null references public.section_updates (product_id) on delete cascade,
  material_product_id uuid not null references public.materials (product_id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (section_update_product_id, material_product_id)
);

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
