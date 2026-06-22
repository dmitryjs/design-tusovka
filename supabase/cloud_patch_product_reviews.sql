-- Product reviews patch for Supabase Cloud
-- Run in SQL Editor AFTER cart/orders patches (or use: npm run db:push)
-- Required for reviews on /materials, /tasks, /sections and /admin/reviews

create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  rating smallint not null,
  body text not null,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_reviews_rating_range check (rating >= 1 and rating <= 5),
  constraint product_reviews_body_not_empty check (char_length(trim(body)) >= 1),
  constraint product_reviews_product_user_unique unique (product_id, user_id)
);

create index if not exists product_reviews_product_id_idx
  on public.product_reviews (product_id);

create index if not exists product_reviews_user_id_idx
  on public.product_reviews (user_id);

drop trigger if exists product_reviews_set_updated_at on public.product_reviews;
create trigger product_reviews_set_updated_at
  before update on public.product_reviews
  for each row execute function public.set_updated_at();

alter table public.product_reviews enable row level security;

drop policy if exists product_reviews_select_visible on public.product_reviews;
create policy product_reviews_select_visible
  on public.product_reviews
  for select
  to anon, authenticated
  using (not is_hidden);

drop policy if exists product_reviews_select_own on public.product_reviews;
create policy product_reviews_select_own
  on public.product_reviews
  for select
  to authenticated
  using (user_id = (select auth.uid()));

grant select on table public.product_reviews to anon, authenticated;

create or replace function public.can_review_product(p_product_id uuid)
returns boolean
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_kind public.product_kind;
begin
  if v_user_id is null then
    return false;
  end if;

  select p.kind
  into v_kind
  from public.products p
  where p.id = p_product_id
    and p.status = 'published';

  if not found then
    return false;
  end if;

  if v_kind = 'section' then
    return exists (
      select 1
      from public.entitlements e
      where e.user_id = v_user_id
        and e.product_id = p_product_id
        and e.source_type = 'section_order'
        and e.revoked_at is null
    );
  end if;

  if v_kind in ('material', 'task') then
    return public.has_product_access(p_product_id);
  end if;

  return false;
end;
$$;

grant execute on function public.can_review_product (uuid) to authenticated;

create or replace function public.get_product_review_stats(p_product_id uuid)
returns table (
  average_rating numeric,
  review_count bigint
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    coalesce(round(avg(r.rating)::numeric, 1), 0),
    count(*)::bigint
  from public.product_reviews r
  where r.product_id = p_product_id
    and not r.is_hidden;
$$;

grant execute on function public.get_product_review_stats (uuid) to anon, authenticated;

create or replace function public.list_product_reviews(p_product_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  return coalesce(
    (
      select jsonb_agg(row_to_json(t) order by t.created_at desc)
      from (
        select
          r.id,
          r.rating,
          r.body,
          r.created_at,
          r.updated_at,
          coalesce(nullif(trim(p.display_name), ''), 'Пользователь') as author_display_name,
          (v_user_id is not null and r.user_id = v_user_id) as is_own
        from public.product_reviews r
        left join public.profiles p on p.id = r.user_id
        where r.product_id = p_product_id
          and (not r.is_hidden or r.user_id = v_user_id)
      ) t
    ),
    '[]'::jsonb
  );
end;
$$;

grant execute on function public.list_product_reviews (uuid) to anon, authenticated;

create or replace function public.upsert_product_review(
  p_product_id uuid,
  p_rating smallint,
  p_body text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_body text := trim(p_body);
  v_review_id uuid;
begin
  if v_user_id is null then
    return jsonb_build_object('ok', false, 'code', 'unauthenticated');
  end if;

  if p_rating < 1 or p_rating > 5 then
    return jsonb_build_object('ok', false, 'code', 'invalid_rating');
  end if;

  if char_length(v_body) < 1 then
    return jsonb_build_object('ok', false, 'code', 'empty_body');
  end if;

  if char_length(v_body) > 5000 then
    return jsonb_build_object('ok', false, 'code', 'body_too_long');
  end if;

  if not public.can_review_product(p_product_id) then
    return jsonb_build_object('ok', false, 'code', 'not_entitled');
  end if;

  insert into public.product_reviews (product_id, user_id, rating, body)
  values (p_product_id, v_user_id, p_rating, v_body)
  on conflict (product_id, user_id) do update
    set
      rating = excluded.rating,
      body = excluded.body,
      is_hidden = false,
      updated_at = now()
  returning id into v_review_id;

  return jsonb_build_object(
    'ok', true,
    'code', 'saved',
    'review_id', v_review_id
  );
end;
$$;

grant execute on function public.upsert_product_review (uuid, smallint, text) to authenticated;

create or replace function public.delete_my_product_review(p_product_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_deleted int;
begin
  if v_user_id is null then
    return jsonb_build_object('ok', false, 'code', 'unauthenticated');
  end if;

  delete from public.product_reviews r
  where r.product_id = p_product_id
    and r.user_id = v_user_id;

  get diagnostics v_deleted = row_count;

  if v_deleted = 0 then
    return jsonb_build_object('ok', false, 'code', 'not_found');
  end if;

  return jsonb_build_object('ok', true, 'code', 'deleted');
end;
$$;

grant execute on function public.delete_my_product_review (uuid) to authenticated;
