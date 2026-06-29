-- Apply on Supabase Cloud SQL editor if get_material_h1_outline is missing.

create or replace function public.get_material_h1_outline(p_material_product_id uuid)
returns table (
  anchor_id text,
  title text,
  sort_order integer
)
language sql
stable
security definer
set search_path = public
as $$
  select
    'block-' || (elem.block->>'id') as anchor_id,
    trim(
      regexp_replace(coalesce(elem.block->'data'->>'text', ''), '<[^>]+>', '', 'g')
    ) as title,
    (row_number() over (order by elem.chapter_position, elem.block_ord))::integer - 1 as sort_order
  from (
    select
      mc.position as chapter_position,
      t.ordinality as block_ord,
      t.value as block
    from public.material_chapters mc
    inner join public.materials m on m.product_id = mc.material_product_id
    inner join public.products p on p.id = m.product_id
    cross join lateral jsonb_array_elements(
      case
        when jsonb_typeof(mc.content) = 'array' then mc.content
        else '[]'::jsonb
      end
    ) with ordinality as t(value, ordinality)
    where mc.material_product_id = p_material_product_id
      and p.status = 'published'::public.product_status
      and p.kind = 'material'::public.product_kind
  ) elem
  where elem.block->>'type' = 'heading1'
    and trim(
      regexp_replace(coalesce(elem.block->'data'->>'text', ''), '<[^>]+>', '', 'g')
    ) <> ''
  order by elem.chapter_position, elem.block_ord;
$$;

comment on function public.get_material_h1_outline (uuid) is
  'Returns H1 headings for a published material without exposing full chapter content.';

grant execute on function public.get_material_h1_outline (uuid) to anon, authenticated;
