-- Allow users to remove cancelled or failed orders from their history.

create or replace function public.delete_my_order(p_order_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_order record;
begin
  if v_user_id is null then
    return jsonb_build_object('ok', false, 'code', 'unauthenticated');
  end if;

  select id, user_id, status
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

  if v_order.status not in ('cancelled', 'failed') then
    return jsonb_build_object('ok', false, 'code', 'invalid_status');
  end if;

  delete from public.orders
  where id = p_order_id;

  return jsonb_build_object('ok', true, 'code', 'deleted');
end;
$$;

comment on function public.delete_my_order (uuid) is
  'Deletes a cancelled or failed order from the current user history.';

revoke all on function public.delete_my_order (uuid) from public;
grant execute on function public.delete_my_order (uuid) to authenticated;
