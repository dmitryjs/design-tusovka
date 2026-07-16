-- Allow claim_free_product for free sections; also grant section materials to library.

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
  v_material record;
  v_already boolean := false;
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

  if v_product.kind not in ('material', 'task', 'section') then
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
    v_already := true;
  else
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
  end if;

  if v_product.kind = 'section' then
    for v_material in
      select m.product_id
      from public.materials m
      inner join public.products p on p.id = m.product_id
      where m.section_product_id = v_product.id
        and p.status = 'published'
        and p.kind = 'material'
    loop
      if not exists (
        select 1
        from public.entitlements e
        where e.user_id = v_user_id
          and e.product_id = v_material.product_id
          and e.revoked_at is null
      ) then
        begin
          insert into public.entitlements (
            user_id,
            product_id,
            source_type,
            source_id
          )
          values (
            v_user_id,
            v_material.product_id,
            'zero_order',
            v_product.id
          );
        exception
          when unique_violation then
            null;
        end;
      end if;
    end loop;
  end if;

  return jsonb_build_object(
    'ok',
    true,
    'code',
    case when v_already then 'already_claimed' else 'claimed' end,
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
  'Grants a zero_order entitlement for a published free material, task, or section. Free sections also grant their published materials. Idempotent for active entitlements.';

revoke all on function public.claim_free_product (text) from public;
grant execute on function public.claim_free_product (text) to authenticated;

notify pgrst, 'reload schema';
