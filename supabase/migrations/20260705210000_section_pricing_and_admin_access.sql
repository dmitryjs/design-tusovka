-- Patch: section list price (paid materials * 0.75) and admin full product access.
-- Safe to re-run. Run in Supabase SQL Editor.

create or replace function public.get_section_list_price_kopecks(p_section_product_id uuid)
returns integer
language sql
stable
security invoker
set search_path = public
as $$
  select coalesce(
    round(
      sum(p.price_kopecks) filter (where p.price_kopecks > 0) * 0.75
    ),
    0
  )::integer
  from public.materials m
  inner join public.products p on p.id = m.product_id
  where m.section_product_id = p_section_product_id
    and p.status = 'published'
    and p.kind = 'material';
$$;

comment on function public.get_section_list_price_kopecks (uuid) is
  'Published section price: 75% of the sum of paid material prices in the section.';

grant execute on function public.get_section_list_price_kopecks (uuid) to authenticated, anon;

create or replace function public.has_product_access(product_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles pr
    where pr.id = (select auth.uid())
      and pr.role = 'admin'
  )
  or exists (
    select 1
    from public.entitlements e
    where e.user_id = (select auth.uid())
      and e.product_id = has_product_access.product_id
      and e.revoked_at is null
  );
$$;

comment on function public.has_product_access (uuid) is
  'True when the current user is admin or has an active entitlement to the product.';

create or replace function public.add_to_cart(p_slug text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_product record;
  v_existing_id uuid;
  v_price_kopecks integer;
begin
  if v_user_id is null then
    return jsonb_build_object('ok', false, 'code', 'unauthenticated');
  end if;

  select p.id, p.slug, p.kind, p.status, p.price_kopecks, p.title
  into v_product
  from public.products p
  where p.slug = p_slug
    and p.status = 'published';

  if not found then
    return jsonb_build_object('ok', false, 'code', 'not_found');
  end if;

  if v_product.kind not in ('material', 'task', 'section') then
    return jsonb_build_object('ok', false, 'code', 'unsupported_kind');
  end if;

  if v_product.kind = 'section' then
    v_price_kopecks := public.get_section_list_price_kopecks(v_product.id);
  else
    v_price_kopecks := v_product.price_kopecks;
  end if;

  if v_price_kopecks <= 0 then
    return jsonb_build_object('ok', false, 'code', 'free_product');
  end if;

  if public.has_product_access(v_product.id) then
    return jsonb_build_object('ok', false, 'code', 'already_owned');
  end if;

  select c.id
  into v_existing_id
  from public.cart_items c
  where c.user_id = v_user_id
    and c.product_id = v_product.id
  limit 1;

  if found then
    return jsonb_build_object(
      'ok', true,
      'code', 'already_in_cart',
      'product_id', v_product.id,
      'slug', v_product.slug
    );
  end if;

  insert into public.cart_items (user_id, product_id)
  values (v_user_id, v_product.id);

  return jsonb_build_object(
    'ok', true,
    'code', 'added',
    'product_id', v_product.id,
    'slug', v_product.slug
  );
exception
  when unique_violation then
    return jsonb_build_object(
      'ok', true,
      'code', 'already_in_cart',
      'product_id', v_product.id,
      'slug', v_product.slug
    );
end;
$$;

create or replace function public.create_pending_order_from_cart()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_order_id uuid;
  v_total integer := 0;
  v_item record;
  v_price_kopecks integer;
begin
  if v_user_id is null then
    return jsonb_build_object('ok', false, 'code', 'unauthenticated');
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text, 0));

  if not exists (
    select 1 from public.cart_items c where c.user_id = v_user_id
  ) then
    return jsonb_build_object('ok', false, 'code', 'empty_cart');
  end if;

  for v_item in
    select
      c.product_id,
      p.title,
      p.price_kopecks,
      p.status,
      p.kind
    from public.cart_items c
    inner join public.products p on p.id = c.product_id
    where c.user_id = v_user_id
  loop
    if v_item.status <> 'published' then
      return jsonb_build_object('ok', false, 'code', 'product_unavailable');
    end if;

    if v_item.kind not in ('material', 'task', 'section') then
      return jsonb_build_object('ok', false, 'code', 'unsupported_kind');
    end if;

    if v_item.kind = 'section' then
      v_price_kopecks := public.get_section_list_price_kopecks(v_item.product_id);
    else
      v_price_kopecks := v_item.price_kopecks;
    end if;

    if v_price_kopecks <= 0 then
      return jsonb_build_object('ok', false, 'code', 'free_product');
    end if;

    if public.has_product_access(v_item.product_id) then
      return jsonb_build_object('ok', false, 'code', 'already_owned');
    end if;

    v_total := v_total + v_price_kopecks;
  end loop;

  insert into public.orders (user_id, status, total_kopecks)
  values (v_user_id, 'pending_payment', v_total)
  returning id into v_order_id;

  insert into public.order_items (order_id, product_id, title, price_kopecks)
  select
    v_order_id,
    p.id,
    p.title,
    case
      when p.kind = 'section' then public.get_section_list_price_kopecks(p.id)
      else p.price_kopecks
    end
  from public.cart_items c
  inner join public.products p on p.id = c.product_id
  where c.user_id = v_user_id;

  delete from public.cart_items c
  where c.user_id = v_user_id;

  return jsonb_build_object(
    'ok', true,
    'code', 'created',
    'order_id', v_order_id,
    'total_kopecks', v_total
  );
end;
$$;

grant execute on function public.add_to_cart (text) to authenticated;
grant execute on function public.create_pending_order_from_cart () to authenticated;
