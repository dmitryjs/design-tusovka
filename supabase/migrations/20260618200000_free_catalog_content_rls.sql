-- Free catalog content RLS for MVP
-- material_chapters: published free materials readable by anon/authenticated
-- paid material chapters: entitled authenticated only (no content leak)

grant select on table public.material_chapters to anon;

drop policy if exists material_chapters_select_entitled on public.material_chapters;

create policy material_chapters_select_free
  on public.material_chapters
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.materials m
      inner join public.products p on p.id = m.product_id
      where m.product_id = material_chapters.material_product_id
        and p.status = 'published'::public.product_status
        and p.kind = 'material'::public.product_kind
        and p.price_kopecks = 0
    )
  );

create policy material_chapters_select_entitled
  on public.material_chapters
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.materials m
      inner join public.products p on p.id = m.product_id
      where m.product_id = material_chapters.material_product_id
        and p.status = 'published'::public.product_status
        and p.kind = 'material'::public.product_kind
        and p.price_kopecks > 0
        and public.has_product_access(material_chapters.material_product_id)
    )
  );
