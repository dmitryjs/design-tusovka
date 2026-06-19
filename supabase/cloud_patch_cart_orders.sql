-- Cart and orders skeleton (MVP, no payment)

do $$ begin
  create type public.order_status as enum (
    'pending_payment',
    'paid',
    'cancelled',
    'failed'
  );
exception
  when duplicate_object then null;
end $$;

-- cart_items

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint cart_items_user_product_unique unique (user_id, product_id)
);

create index if not exists cart_items_user_id_idx
  on public.cart_items (user_id);

alter table public.cart_items enable row level security;

drop policy if exists cart_items_select_own on public.cart_items;
create policy cart_items_select_own
  on public.cart_items
  for select
  to authenticated
  using (user_id = (select auth.uid()));

-- orders

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  status public.order_status not null default 'pending_payment',
  total_kopecks integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_total_non_negative check (total_kopecks >= 0)
);

create index if not exists orders_user_id_created_at_idx
  on public.orders (user_id, created_at desc);

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row
  execute function public.set_updated_at();

alter table public.orders enable row level security;

drop policy if exists orders_select_own on public.orders;
create policy orders_select_own
  on public.orders
  for select
  to authenticated
  using (user_id = (select auth.uid()));

-- order_items

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid not null references public.products (id),
  title text not null,
  price_kopecks integer not null,
  created_at timestamptz not null default now(),
  constraint order_items_order_product_unique unique (order_id, product_id),
  constraint order_items_price_non_negative check (price_kopecks >= 0)
);

create index if not exists order_items_order_id_idx
  on public.order_items (order_id);

alter table public.order_items enable row level security;

drop policy if exists order_items_select_own on public.order_items;
create policy order_items_select_own
  on public.order_items
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.orders o
      where o.id = order_items.order_id
        and o.user_id = (select auth.uid())
    )
  );

-- RPC: add_to_cart

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

  if v_product.kind not in ('material', 'task') then
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

-- RPC: remove_from_cart

create or replace function public.remove_from_cart(p_cart_item_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_deleted integer;
begin
  if v_user_id is null then
    return jsonb_build_object('ok', false, 'code', 'unauthenticated');
  end if;

  delete from public.cart_items c
  where c.id = p_cart_item_id
    and c.user_id = v_user_id;

  get diagnostics v_deleted = row_count;

  if v_deleted = 0 then
    return jsonb_build_object('ok', false, 'code', 'not_found');
  end if;

  return jsonb_build_object('ok', true, 'code', 'removed');
end;
$$;

-- RPC: create_pending_order_from_cart

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

  -- Serialize checkout per user to prevent duplicate pending orders on double submit.
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

    if v_item.kind not in ('material', 'task') then
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

comment on function public.add_to_cart (text) is
  'Adds a published paid product to the current user cart. Idempotent.';

comment on function public.remove_from_cart (uuid) is
  'Removes a cart item owned by the current user.';

comment on function public.create_pending_order_from_cart () is
  'Creates a pending_payment order from the current user cart and clears the cart.';

revoke all on function public.add_to_cart (text) from public;
revoke all on function public.remove_from_cart (uuid) from public;
revoke all on function public.create_pending_order_from_cart () from public;

grant execute on function public.add_to_cart (text) to authenticated;
grant execute on function public.remove_from_cart (uuid) to authenticated;
grant execute on function public.create_pending_order_from_cart () to authenticated;

grant select on table public.cart_items to authenticated;
grant select on table public.orders to authenticated;
grant select on table public.order_items to authenticated;

revoke insert, update, delete on table public.cart_items from authenticated, anon;
revoke insert, update, delete on table public.orders from authenticated, anon;
revoke insert, update, delete on table public.order_items from authenticated, anon;

notify pgrst, 'reload schema';
