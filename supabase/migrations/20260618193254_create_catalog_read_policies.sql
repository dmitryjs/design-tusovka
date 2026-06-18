-- Stage 3.3.2: catalog RLS and safe public read

-- products

create policy products_select_published
  on public.products
  for select
  to anon, authenticated
  using (status = 'published'::public.product_status);

-- sections

create policy sections_select_published
  on public.sections
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.products p
      where p.id = sections.product_id
        and p.status = 'published'::public.product_status
    )
  );

-- materials

create policy materials_select_published
  on public.materials
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.products p
      where p.id = materials.product_id
        and p.status = 'published'::public.product_status
    )
  );

-- tasks

create policy tasks_select_published
  on public.tasks
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.products p
      where p.id = tasks.product_id
        and p.status = 'published'::public.product_status
    )
  );

-- tags (only linked to published products)

create policy tags_select_published
  on public.tags
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.product_tags pt
      inner join public.products p on p.id = pt.product_id
      where pt.tag_id = tags.id
        and p.status = 'published'::public.product_status
    )
  );

-- product_tags

create policy product_tags_select_published
  on public.product_tags
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.products p
      where p.id = product_tags.product_id
        and p.status = 'published'::public.product_status
    )
  );

-- section_updates

create policy section_updates_select_published
  on public.section_updates
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.products p
      where p.id = section_updates.product_id
        and p.status = 'published'::public.product_status
    )
    and exists (
      select 1
      from public.sections s
      inner join public.products sp on sp.id = s.product_id
      where s.product_id = section_updates.section_product_id
        and sp.status = 'published'::public.product_status
    )
  );

-- section_update_materials

create policy section_update_materials_select_published
  on public.section_update_materials
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.section_updates su
      inner join public.products p on p.id = su.product_id
      where su.product_id = section_update_materials.section_update_product_id
        and p.status = 'published'::public.product_status
    )
    and exists (
      select 1
      from public.materials m
      inner join public.products mp on mp.id = m.product_id
      where m.product_id = section_update_materials.material_product_id
        and mp.status = 'published'::public.product_status
    )
  );

-- material_chapters: full rows only with entitlement (content must not leak)

create policy material_chapters_select_entitled
  on public.material_chapters
  for select
  to authenticated
  using (public.has_product_access(material_product_id));

-- task_content: free published task or entitled

create policy task_content_select_free_or_entitled
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
        and (
          p.price_kopecks = 0
          or public.has_product_access(t.product_id)
        )
    )
  );

-- task_ai_criteria: same as task_content

create policy task_ai_criteria_select_free_or_entitled
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
        and (
          p.price_kopecks = 0
          or public.has_product_access(t.product_id)
        )
    )
  );

-- get_material_toc: published material outline without content

create or replace function public.get_material_toc(p_material_product_id uuid)
returns table (
  id uuid,
  material_product_id uuid,
  title text,
  "position" integer
)
language sql
stable
security definer
set search_path = public
as $$
  select
    mc.id,
    mc.material_product_id,
    mc.title,
    mc.position
  from public.material_chapters mc
  inner join public.materials m on m.product_id = mc.material_product_id
  inner join public.products p on p.id = m.product_id
  where mc.material_product_id = p_material_product_id
    and p.status = 'published'::public.product_status
    and p.kind = 'material'::public.product_kind
  order by mc.position;
$$;

comment on function public.get_material_toc (uuid) is
  'Returns chapter id, title and position for a published material. Does not expose content. Available to anon and authenticated without entitlement.';

grant execute on function public.get_material_toc (uuid) to anon, authenticated;
