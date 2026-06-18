begin;

create extension if not exists pgtap with schema extensions;

select plan(18);

do $setup$
declare
  v_section_product uuid := 'a0000000-0000-4000-8000-000000000001';
  v_material_product uuid := 'a0000000-0000-4000-8000-000000000002';
  v_draft_product uuid := 'a0000000-0000-4000-8000-000000000003';
  v_hidden_product uuid := 'a0000000-0000-4000-8000-000000000004';
  v_free_task_product uuid := 'a0000000-0000-4000-8000-000000000010';
  v_paid_task_product uuid := 'a0000000-0000-4000-8000-000000000011';
  v_chapter_1 uuid := 'b0000000-0000-4000-8000-000000000001';
  v_chapter_2 uuid := 'b0000000-0000-4000-8000-000000000002';
  v_user_a uuid := 'c0000000-0000-4000-8000-000000000001';
  v_user_b uuid := 'c0000000-0000-4000-8000-000000000002';
  v_source_id uuid := 'e0000000-0000-4000-8000-000000000001';
begin
  insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  values
    (v_user_a, 'user-a@test.local', crypt('password', gen_salt('bf')), now(), now(), now()),
    (v_user_b, 'user-b@test.local', crypt('password', gen_salt('bf')), now(), now(), now());

  insert into public.products (id, kind, status, slug, title, price_kopecks)
  values
    (v_section_product, 'section', 'published', 'test-section', 'Test Section', 0),
    (v_material_product, 'material', 'published', 'test-material', 'Test Material', 10000),
    (v_draft_product, 'material', 'draft', 'test-draft', 'Draft Material', 0),
    (v_hidden_product, 'material', 'hidden', 'test-hidden', 'Hidden Material', 0),
    (v_free_task_product, 'task', 'published', 'test-free-task', 'Free Task', 0),
    (v_paid_task_product, 'task', 'published', 'test-paid-task', 'Paid Task', 50000);

  insert into public.sections (product_id)
  values (v_section_product);

  insert into public.materials (product_id, section_product_id, format)
  values (v_material_product, v_section_product, 'mini_guide');

  insert into public.material_chapters (id, material_product_id, title, content, position)
  values
    (v_chapter_1, v_material_product, 'Chapter 1', '[{"type":"paragraph","text":"secret"}]'::jsonb, 0),
    (v_chapter_2, v_material_product, 'Chapter 2', '[{"type":"paragraph","text":"secret2"}]'::jsonb, 1);

  insert into public.tasks (product_id)
  values
    (v_free_task_product),
    (v_paid_task_product);

  insert into public.task_content (task_product_id, brief, submission_requirements)
  values
    (v_free_task_product, '["free brief"]'::jsonb, '["req"]'::jsonb),
    (v_paid_task_product, '["paid brief"]'::jsonb, '["req"]'::jsonb);

  insert into public.task_ai_criteria (task_product_id, title, position)
  values
    (v_free_task_product, 'Criterion', 0),
    (v_paid_task_product, 'Criterion', 0);

  insert into public.entitlements (user_id, product_id, source_type, source_id)
  values
    (v_user_a, v_material_product, 'manual', v_source_id),
    (v_user_a, v_paid_task_product, 'manual', 'e0000000-0000-4000-8000-000000000002'::uuid);

  insert into public.entitlements (user_id, product_id, source_type, source_id, revoked_at)
  values
    (v_user_b, v_material_product, 'manual', 'e0000000-0000-4000-8000-000000000003'::uuid, now());
end;
$setup$;

set local role anon;

select results_eq(
  $$ select count(*)::bigint from public.products where slug like 'test-%' $$,
  array[4::bigint],
  'anon sees only published products'
);

select is_empty(
  $$ select 1 from public.products where slug = 'test-draft' $$,
  'anon cannot read draft products'
);

select is_empty(
  $$ select 1 from public.products where slug = 'test-hidden' $$,
  'anon cannot read hidden products'
);

select results_eq(
  $$ select count(*)::bigint from public.get_material_toc('a0000000-0000-4000-8000-000000000002'::uuid) $$,
  array[2::bigint],
  'anon can read toc for published material'
);

select results_eq(
  $$
    select id, material_product_id, title, position
    from public.get_material_toc('a0000000-0000-4000-8000-000000000002'::uuid)
    order by position
  $$,
  $$
    values
      ('b0000000-0000-4000-8000-000000000001'::uuid, 'a0000000-0000-4000-8000-000000000002'::uuid, 'Chapter 1', 0),
      ('b0000000-0000-4000-8000-000000000002'::uuid, 'a0000000-0000-4000-8000-000000000002'::uuid, 'Chapter 2', 1)
  $$,
  'get_material_toc returns outline fields only'
);

select throws_ok(
  $$ select 1 from public.material_chapters $$,
  '42501'
);

reset role;
select set_config('request.jwt.claim.sub', 'c0000000-0000-4000-8000-000000000002', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select is_empty(
  $$ select 1 from public.material_chapters $$,
  'authenticated without entitlement cannot read material_chapters'
);

select set_config('request.jwt.claim.sub', 'c0000000-0000-4000-8000-000000000001', true);
set local role authenticated;

select results_eq(
  $$ select count(*)::bigint from public.material_chapters $$,
  array[2::bigint],
  'authenticated with entitlement can read material_chapters'
);

select set_config('request.jwt.claim.sub', 'c0000000-0000-4000-8000-000000000002', true);
set local role authenticated;

select is_empty(
  $$ select 1 from public.material_chapters $$,
  'revoked entitlement cannot read material_chapters'
);

reset role;
set local role anon;

select results_eq(
  $$ select count(*)::bigint from public.task_content where task_product_id = 'a0000000-0000-4000-8000-000000000010'::uuid $$,
  array[1::bigint],
  'anon can read free task content'
);

select is_empty(
  $$ select 1 from public.task_content where task_product_id = 'a0000000-0000-4000-8000-000000000011'::uuid $$,
  'anon cannot read paid task content without entitlement'
);

reset role;
select set_config('request.jwt.claim.sub', 'c0000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select results_eq(
  $$ select count(*)::bigint from public.task_content where task_product_id = 'a0000000-0000-4000-8000-000000000011'::uuid $$,
  array[1::bigint],
  'authenticated with entitlement can read paid task content'
);

select is_empty(
  $$ select 1 from public.profiles where id = 'c0000000-0000-4000-8000-000000000002'::uuid $$,
  'user A cannot read profile B'
);

select is_empty(
  $$ select 1 from public.entitlements where user_id = 'c0000000-0000-4000-8000-000000000002'::uuid $$,
  'user A cannot read entitlements of user B'
);

select results_eq(
  $$ select count(*)::bigint from public.task_ai_criteria where task_product_id = 'a0000000-0000-4000-8000-000000000010'::uuid $$,
  array[1::bigint],
  'anon can read free task ai criteria'
);

select throws_ok(
  $$ insert into public.products (kind, status, slug, title) values ('task', 'draft', 'hack-task', 'Hack') $$,
  '42501'
);

select throws_ok(
  $$ update public.products set title = 'Hacked' where slug = 'test-free-task' $$,
  '42501'
);

select throws_ok(
  $$ delete from public.products where slug = 'test-free-task' $$,
  '42501'
);

select * from finish();
rollback;
