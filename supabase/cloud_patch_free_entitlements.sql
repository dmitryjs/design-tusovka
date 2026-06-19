-- Free product entitlements: claim_free_product RPC
-- Run in Supabase SQL Editor AFTER cloud_bootstrap.sql (and dev_seed.sql if needed)
-- Required for "Получить бесплатно" and library in /profile

create or replace function public.claim_free_product(p_slug text)
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

  select
    p.id,
    p.slug,
    p.kind,
    p.status,
    p.price_kopecks
  into v_product
  from public.products p
  where p.slug = p_slug
    and p.status = 'published';

  if not found then
    return jsonb_build_object('ok', false, 'code', 'not_found');
  end if;

  if v_product.kind not in ('material', 'task') then
    return jsonb_build_object('ok', false, 'code', 'unsupported_kind');
  end if;

  if v_product.price_kopecks <> 0 then
    return jsonb_build_object('ok', false, 'code', 'not_free');
  end if;

  select e.id
  into v_existing_id
  from public.entitlements e
  where e.user_id = v_user_id
    and e.product_id = v_product.id
    and e.revoked_at is null
  limit 1;

  if found then
    return jsonb_build_object(
      'ok',
      true,
      'code',
      'already_claimed',
      'product_id',
      v_product.id,
      'slug',
      v_product.slug
    );
  end if;

  insert into public.entitlements (
    user_id,
    product_id,
    source_type,
    source_id
  )
  values (
    v_user_id,
    v_product.id,
    'zero_order',
    v_product.id
  );

  return jsonb_build_object(
    'ok',
    true,
    'code',
    'claimed',
    'product_id',
    v_product.id,
    'slug',
    v_product.slug
  );
exception
  when unique_violation then
    return jsonb_build_object(
      'ok',
      true,
      'code',
      'already_claimed',
      'product_id',
      v_product.id,
      'slug',
      v_product.slug
    );
end;
$$;

comment on function public.claim_free_product (text) is
  'Grants a zero_order entitlement for a published free material or task. Idempotent for active entitlements.';

revoke all on function public.claim_free_product (text) from public;
grant execute on function public.claim_free_product (text) to authenticated;

-- Refresh PostgREST schema cache so API sees the new RPC immediately
notify pgrst, 'reload schema';
