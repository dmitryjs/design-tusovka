-- Patch: deduplicate section products (merge legacy slugs into canonical sections).
-- Safe to re-run. Run in Supabase SQL Editor after cloud_bootstrap + dev_seed.
-- Skips optional tables (product_reviews, cart_items, order_items, …) if not deployed yet.

insert into public.products (id, kind, status, slug, title, description, price_kopecks, published_at)
values
  (
    'e0000000-0000-4000-8000-000000000001',
    'section',
    'published',
    'product-thinking',
    'Продуктовое мышление',
    'Как читать задачу, формулировать гипотезы и принимать продуктовые решения в дизайне.',
    249000,
    now()
  ),
  (
    'e0000000-0000-4000-8000-000000000002',
    'section',
    'published',
    'job-and-portfolio',
    'Поиск работы и портфолио',
    'Как собирать, оформлять и защищать кейсы, когда цифр мало, а внимание рекрутера дорого.',
    249000,
    now()
  ),
  (
    'e0000000-0000-4000-8000-000000000003',
    'section',
    'published',
    'ai-design-engineering',
    'AI в дизайне и вайбкодинг',
    'AI-инструменты, промпты и практики для ускорения UX/UI и прототипирования.',
    249000,
    now()
  ),
  (
    'e0000000-0000-4000-8000-000000000004',
    'section',
    'published',
    'grade-growth',
    'Рост грейда',
    'Навыки и кейсы для перехода с junior на middle и с middle на senior.',
    249000,
    now()
  ),
  (
    'e0000000-0000-4000-8000-000000000005',
    'section',
    'published',
    'real-product-work',
    'Реальная работа в продукте',
    'Коммуникация с командой, приоритизация, метрики и ежедневные задачи product designer.',
    249000,
    now()
  ),
  (
    'e0000000-0000-4000-8000-000000000006',
    'section',
    'draft',
    'whiteboards-and-practice',
    'Вайтборды и практические задания',
    'Снято с витрины.',
    0,
    now()
  )
on conflict (slug) do update set
  kind = excluded.kind,
  status = excluded.status,
  title = excluded.title,
  description = excluded.description,
  price_kopecks = excluded.price_kopecks,
  published_at = excluded.published_at,
  updated_at = now();

insert into public.sections (product_id, position, what_you_get, for_whom)
select
  p.id,
  v.position,
  v.what_you_get,
  v.for_whom
from (
  values
    (
      'product-thinking',
      0,
      '["Материалы по чтению задач", "Чеклист junior-навыков", "Практика на экранах"]'::jsonb,
      '["Новички в продуктовом дизайне", "Junior без структуры"]'::jsonb
    ),
    (
      'job-and-portfolio',
      1,
      '["Гайды по кейсам", "Шаблоны CV", "Чеклист перед тестовым"]'::jsonb,
      '["Дизайнеры на поиске работы", "Сборка портфолио с нуля"]'::jsonb
    ),
    (
      'ai-design-engineering',
      2,
      '["UX-аудит", "AI-промпты", "Метрики для дизайнера"]'::jsonb,
      '["Middle и senior", "Кто работает с продуктом и AI"]'::jsonb
    ),
    (
      'grade-growth',
      3,
      '["Roadmap роста", "Чеклисты навыков", "Разборы кейсов"]'::jsonb,
      '["Junior на пути к middle", "Middle перед senior"]'::jsonb
    ),
    (
      'real-product-work',
      4,
      '["Работа с метриками", "Коммуникация с командой", "Приоритизация задач"]'::jsonb,
      '["Middle в продуктовой команде", "Кто хочет больше влияния на продукт"]'::jsonb
    ),
    (
      'whiteboards-and-practice',
      5,
      '["Вайтборды", "Практические задания", "Шаблоны для разбора"]'::jsonb,
      '["Все уровни", "Кто учится через практику"]'::jsonb
    )
) as v(slug, position, what_you_get, for_whom)
join public.products p on p.slug = v.slug and p.kind = 'section'
on conflict (product_id) do update set
  position = excluded.position,
  what_you_get = excluded.what_you_get,
  for_whom = excluded.for_whom,
  updated_at = now();

create temporary table section_slug_redirects (
  duplicate_slug text primary key,
  canonical_slug text not null
) on commit drop;

insert into section_slug_redirects (duplicate_slug, canonical_slug)
values
  ('theme-posik-raboti', 'job-and-portfolio'),
  ('section-resume-and-portfolio', 'job-and-portfolio'),
  ('resume-portfolio', 'job-and-portfolio'),
  ('job-search', 'job-and-portfolio'),
  ('portfolio-and-cases', 'job-and-portfolio'),
  ('start-product-design', 'product-thinking'),
  ('section-productovoe-mishlenie', 'product-thinking'),
  ('section-rost-graida', 'grade-growth'),
  ('section-ai-and-vibecoding', 'ai-design-engineering'),
  ('ux-product-ai', 'ai-design-engineering'),
  ('ai-design', 'ai-design-engineering'),
  ('section-realnaya-rabota-v-producte', 'real-product-work'),
  ('metrics-work', 'real-product-work')
on conflict (duplicate_slug) do nothing;

do $$
declare
  rec record;
  v_dup_id uuid;
  v_canon_id uuid;
  v_has_section_updates boolean := to_regclass('public.section_updates') is not null;
  v_has_section_update_materials boolean := to_regclass('public.section_update_materials') is not null;
  v_has_entitlements boolean := to_regclass('public.entitlements') is not null;
  v_has_cart_items boolean := to_regclass('public.cart_items') is not null;
  v_has_product_reviews boolean := to_regclass('public.product_reviews') is not null;
  v_has_order_items boolean := to_regclass('public.order_items') is not null;
begin
  for rec in
    select r.duplicate_slug, r.canonical_slug
    from section_slug_redirects r
  loop
    select id into v_dup_id
    from public.products
    where kind = 'section'
      and slug = rec.duplicate_slug
    limit 1;

    select id into v_canon_id
    from public.products
    where kind = 'section'
      and slug = rec.canonical_slug
    order by case when status = 'published' then 0 else 1 end, created_at
    limit 1;

    if v_dup_id is null or v_canon_id is null or v_dup_id = v_canon_id then
      continue;
    end if;

    update public.materials
    set section_product_id = v_canon_id,
        updated_at = now()
    where section_product_id = v_dup_id;

    if v_has_section_updates and v_has_section_update_materials then
      delete from public.section_update_materials sum
      using public.section_updates su_dup, public.section_updates su_canon
      where sum.section_update_product_id = su_dup.product_id
        and su_dup.section_product_id = v_dup_id
        and su_canon.section_product_id = v_canon_id
        and su_canon.release_number = su_dup.release_number
        and exists (
          select 1
          from public.section_update_materials sum2
          where sum2.section_update_product_id = su_canon.product_id
            and sum2.material_product_id = sum.material_product_id
        );

      update public.section_updates
      set section_product_id = v_canon_id,
          updated_at = now()
      where section_product_id = v_dup_id
        and not exists (
          select 1
          from public.section_updates su2
          where su2.section_product_id = v_canon_id
            and su2.release_number = section_updates.release_number
        );

      delete from public.section_updates
      where section_product_id = v_dup_id;
    elsif v_has_section_updates then
      delete from public.section_updates
      where section_product_id = v_dup_id;
    end if;

    if v_has_entitlements then
      delete from public.entitlements e_dup
      where e_dup.product_id = v_dup_id
        and exists (
          select 1
          from public.entitlements e_canon
          where e_canon.user_id = e_dup.user_id
            and e_canon.product_id = v_canon_id
            and e_canon.source_type = e_dup.source_type
            and e_canon.source_id = e_dup.source_id
        );

      update public.entitlements
      set product_id = v_canon_id
      where product_id = v_dup_id;
    end if;

    if v_has_cart_items then
      delete from public.cart_items c_dup
      where c_dup.product_id = v_dup_id
        and exists (
          select 1
          from public.cart_items c_canon
          where c_canon.user_id = c_dup.user_id
            and c_canon.product_id = v_canon_id
        );

      update public.cart_items
      set product_id = v_canon_id
      where product_id = v_dup_id;
    end if;

    if v_has_product_reviews then
      delete from public.product_reviews r_dup
      where r_dup.product_id = v_dup_id
        and exists (
          select 1
          from public.product_reviews r_canon
          where r_canon.user_id = r_dup.user_id
            and r_canon.product_id = v_canon_id
        );

      update public.product_reviews
      set product_id = v_canon_id,
          updated_at = now()
      where product_id = v_dup_id;
    end if;

    if v_has_order_items then
      delete from public.order_items oi_dup
      where oi_dup.product_id = v_dup_id
        and exists (
          select 1
          from public.order_items oi_canon
          where oi_canon.order_id = oi_dup.order_id
            and oi_canon.product_id = v_canon_id
        );

      update public.order_items
      set product_id = v_canon_id
      where product_id = v_dup_id;
    end if;

    delete from public.products
    where id = v_dup_id
      and kind = 'section';
  end loop;
end $$;

update public.products p
set status = 'hidden',
    updated_at = now()
where p.kind = 'section'
  and p.status = 'published'
  and p.slug in (select duplicate_slug from section_slug_redirects);
