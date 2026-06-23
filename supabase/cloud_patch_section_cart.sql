-- Step 11: разделы в корзине и checkout
-- Run in Supabase SQL Editor after cloud_patch_cart_orders.sql

-- Allow section products in cart and checkout

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

  if v_product.price_kopecks <= 0 then
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

    if v_item.price_kopecks <= 0 then
      return jsonb_build_object('ok', false, 'code', 'free_product');
    end if;

    if public.has_product_access(v_item.product_id) then
      return jsonb_build_object('ok', false, 'code', 'already_owned');
    end if;

    v_total := v_total + v_item.price_kopecks;
  end loop;

  insert into public.orders (user_id, status, total_kopecks)
  values (v_user_id, 'pending_payment', v_total)
  returning id into v_order_id;

  insert into public.order_items (order_id, product_id, title, price_kopecks)
  select
    v_order_id,
    p.id,
    p.title,
    p.price_kopecks
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
