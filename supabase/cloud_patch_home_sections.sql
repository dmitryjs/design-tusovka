-- Patch: 6 home/catalog sections with updated titles and slugs
-- Safe to re-run (upsert on dev UUIDs e0000000-0000-4000-8000-00000000000[1-6])

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
on conflict (id) do update set
  kind = excluded.kind,
  status = excluded.status,
  slug = excluded.slug,
  title = excluded.title,
  description = excluded.description,
  price_kopecks = excluded.price_kopecks,
  published_at = excluded.published_at,
  updated_at = now();

insert into public.sections (product_id, position, what_you_get, for_whom)
values
  (
    'e0000000-0000-4000-8000-000000000001',
    0,
    '["Материалы по чтению задач", "Чеклист junior-навыков", "Практика на экранах"]'::jsonb,
    '["Новички в продуктовом дизайне", "Junior без структуры"]'::jsonb
  ),
  (
    'e0000000-0000-4000-8000-000000000002',
    1,
    '["Гайды по кейсам", "Шаблоны CV", "Чеклист перед тестовым"]'::jsonb,
    '["Дизайнеры на поиске работы", "Сборка портфолио с нуля"]'::jsonb
  ),
  (
    'e0000000-0000-4000-8000-000000000003',
    2,
    '["UX-аудит", "AI-промпты", "Метрики для дизайнера"]'::jsonb,
    '["Middle и senior", "Кто работает с продуктом и AI"]'::jsonb
  ),
  (
    'e0000000-0000-4000-8000-000000000004',
    3,
    '["Roadmap роста", "Чеклисты навыков", "Разборы кейсов"]'::jsonb,
    '["Junior на пути к middle", "Middle перед senior"]'::jsonb
  ),
  (
    'e0000000-0000-4000-8000-000000000005',
    4,
    '["Работа с метриками", "Коммуникация с командой", "Приоритизация задач"]'::jsonb,
    '["Middle в продуктовой команде", "Кто хочет больше влияния на продукт"]'::jsonb
  ),
  (
    'e0000000-0000-4000-8000-000000000006',
    5,
    '["Вайтборды", "Практические задания", "Шаблоны для разбора"]'::jsonb,
    '["Все уровни", "Кто учится через практику"]'::jsonb
  )
on conflict (product_id) do update set
  position = excluded.position,
  what_you_get = excluded.what_you_get,
  for_whom = excluded.for_whom,
  updated_at = now();
