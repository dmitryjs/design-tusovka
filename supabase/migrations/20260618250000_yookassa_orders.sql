-- YooKassa payment fields and idempotent order fulfillment

alter table public.orders
  add column if not exists payment_provider text,
  add column if not exists provider_payment_id text,
  add column if not exists payment_status text,
  add column if not exists payment_confirmation_url text,
  add column if not exists paid_at timestamptz,
  add column if not exists payment_error text,
  add column if not exists idempotency_key text,
  add column if not exists entitlement_grant_error text;

create unique index if not exists orders_provider_payment_id_unique
  on public.orders (provider_payment_id)
  where provider_payment_id is not null;

create unique index if not exists orders_idempotency_key_unique
  on public.orders (idempotency_key)
  where idempotency_key is not null;

create index if not exists orders_provider_payment_id_idx
  on public.orders (provider_payment_id);

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

  update public.orders
  set entitlement_grant_error = null
  where id = p_order_id;

  return jsonb_build_object('ok', true, 'code', 'fulfilled');
end;
$$;

revoke all on function public.fulfill_paid_order (uuid) from public;
revoke all on function public.fulfill_paid_order (uuid) from authenticated;
revoke all on function public.fulfill_paid_order (uuid) from anon;
