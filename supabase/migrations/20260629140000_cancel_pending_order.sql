-- Cancel unpaid pending orders and restore items to cart (ORDER-04).

create or replace function public.cancel_pending_order(p_order_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_order record;
  v_restored integer := 0;
begin
  if v_user_id is null then
    return jsonb_build_object('ok', false, 'code', 'unauthenticated');
  end if;

  select id, user_id, status, payment_status
  into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'not_found');
  end if;

  if v_order.user_id <> v_user_id then
    return jsonb_build_object('ok', false, 'code', 'not_found');
  end if;

  if v_order.status <> 'pending_payment' then
    return jsonb_build_object('ok', false, 'code', 'invalid_status');
  end if;

  if v_order.payment_status in ('succeeded', 'waiting_for_capture') then
    return jsonb_build_object('ok', false, 'code', 'payment_in_progress');
  end if;

  update public.orders
  set
    status = 'cancelled',
    updated_at = now()
  where id = p_order_id;

  insert into public.cart_items (user_id, product_id)
  select
    v_user_id,
    oi.product_id
  from public.order_items oi
  inner join public.products p on p.id = oi.product_id
  where oi.order_id = p_order_id
    and p.status = 'published'::public.product_status
    and p.price_kopecks > 0
    and p.kind in (
      'material'::public.product_kind,
      'task'::public.product_kind,
      'section'::public.product_kind
    )
    and not public.has_product_access(oi.product_id)
  on conflict on constraint cart_items_user_product_unique do nothing;

  get diagnostics v_restored = row_count;

  return jsonb_build_object(
    'ok', true,
    'code', 'cancelled',
    'restored_items', v_restored
  );
end;
$$;

comment on function public.cancel_pending_order (uuid) is
  'Cancels a pending_payment order for the current user and restores eligible items to cart.';

revoke all on function public.cancel_pending_order (uuid) from public;
grant execute on function public.cancel_pending_order (uuid) to authenticated;
