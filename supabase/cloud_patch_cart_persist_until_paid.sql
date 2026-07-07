-- Patch: keep cart items until payment is confirmed (ORDER-04).
-- Safe to re-run. Run in Supabase SQL Editor after cart/orders + yookassa patches.
-- create_pending_order_from_cart no longer clears the cart; fulfill_paid_order
-- removes the paid products from the cart after entitlements are granted.

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

  -- Cart is intentionally NOT cleared here: items stay until the order is paid.
  return jsonb_build_object(
    'ok', true,
    'code', 'created',
    'order_id', v_order_id,
    'total_kopecks', v_total
  );
end;
$$;

grant execute on function public.create_pending_order_from_cart () to authenticated;

create or replace function public.fulfill_paid_order(p_order_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order record;
  v_item record;
  v_errors text[] := '{}';
begin
  select id, user_id, status
  into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'order_not_found');
  end if;

  if v_order.status not in ('pending_payment', 'paid') then
    return jsonb_build_object(
      'ok', false,
      'code', 'invalid_order_status',
      'status', v_order.status
    );
  end if;

  if v_order.status = 'pending_payment' then
    update public.orders
    set
      status = 'paid',
      paid_at = coalesce(paid_at, now()),
      payment_status = coalesce(payment_status, 'succeeded'),
      payment_error = null,
      updated_at = now()
    where id = p_order_id;
  end if;

  for v_item in
    select oi.product_id
    from public.order_items oi
    where oi.order_id = p_order_id
  loop
    begin
      insert into public.entitlements (
        user_id,
        product_id,
        source_type,
        source_id
      )
      values (
        v_order.user_id,
        v_item.product_id,
        'direct_order',
        p_order_id
      );
    exception
      when unique_violation then
        null;
      when others then
        v_errors := array_append(v_errors, sqlerrm);
    end;
  end loop;

  if coalesce(array_length(v_errors, 1), 0) > 0 then
    update public.orders
    set entitlement_grant_error = array_to_string(v_errors, '; ')
    where id = p_order_id;

    return jsonb_build_object(
      'ok', false,
      'code', 'entitlement_errors',
      'errors', to_jsonb(v_errors)
    );
  end if;

  -- Remove only the paid products from the buyer's cart after fulfillment.
  delete from public.cart_items c
  using public.order_items oi
  where oi.order_id = p_order_id
    and c.user_id = v_order.user_id
    and c.product_id = oi.product_id;

  update public.orders
  set entitlement_grant_error = null
  where id = p_order_id;

  return jsonb_build_object('ok', true, 'code', 'fulfilled');
end;
$$;

revoke all on function public.fulfill_paid_order (uuid) from public;
revoke all on function public.fulfill_paid_order (uuid) from authenticated;
revoke all on function public.fulfill_paid_order (uuid) from anon;
