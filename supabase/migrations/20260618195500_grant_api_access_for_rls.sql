-- Stage 3.3.4: API grants for RLS (PostgREST)

grant usage on schema public to anon, authenticated;

-- Catalog metadata: RLS filters published rows
grant select on table public.products to anon, authenticated;
grant select on table public.sections to anon, authenticated;
grant select on table public.materials to anon, authenticated;
grant select on table public.tasks to anon, authenticated;
grant select on table public.tags to anon, authenticated;
grant select on table public.product_tags to anon, authenticated;
grant select on table public.section_updates to anon, authenticated;
grant select on table public.section_update_materials to anon, authenticated;
grant select on table public.task_content to anon, authenticated;
grant select on table public.task_ai_criteria to anon, authenticated;

-- User-scoped / entitled content: RLS enforces ownership or access
grant select on table public.profiles to authenticated;
grant select on table public.entitlements to authenticated;
grant select on table public.material_chapters to authenticated;

-- admin_users: no client grants (service role only)

-- RPC: has_product_access is for authenticated users only
revoke execute on function public.has_product_access (uuid) from anon;

-- get_material_toc, update_my_profile: granted in prior migrations

-- task policies: split free vs entitled so anon never invokes has_product_access
drop policy if exists task_content_select_free_or_entitled on public.task_content;

create policy task_content_select_free
  on public.task_content
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.tasks t
      inner join public.products p on p.id = t.product_id
      where t.product_id = task_content.task_product_id
        and p.status = 'published'::public.product_status
        and p.price_kopecks = 0
    )
  );

create policy task_content_select_entitled
  on public.task_content
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.tasks t
      inner join public.products p on p.id = t.product_id
      where t.product_id = task_content.task_product_id
        and p.status = 'published'::public.product_status
        and p.price_kopecks > 0
        and public.has_product_access(t.product_id)
    )
  );

drop policy if exists task_ai_criteria_select_free_or_entitled on public.task_ai_criteria;

create policy task_ai_criteria_select_free
  on public.task_ai_criteria
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.tasks t
      inner join public.products p on p.id = t.product_id
      where t.product_id = task_ai_criteria.task_product_id
        and p.status = 'published'::public.product_status
        and p.price_kopecks = 0
    )
  );

create policy task_ai_criteria_select_entitled
  on public.task_ai_criteria
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.tasks t
      inner join public.products p on p.id = t.product_id
      where t.product_id = task_ai_criteria.task_product_id
        and p.status = 'published'::public.product_status
        and p.price_kopecks > 0
        and public.has_product_access(t.product_id)
    )
  );
