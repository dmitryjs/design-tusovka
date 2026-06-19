-- Dev seed for Supabase Cloud — «Дизайн Тусовка»
-- Run SECOND in SQL Editor (after cloud_bootstrap.sql)
-- UUID prefix e0000000-* — only dev/demo rows; safe to re-run (upsert)
-- Does NOT delete user data or non-dev rows

-- Sections (6)
insert into public.products (id, kind, status, slug, title, description, price_kopecks, published_at)
values
  (
    'e0000000-0000-4000-8000-000000000001',
    'section',
    'published',
    'product-thinking',
    'Продуктовое мышление',
    'Как читать задачу, формулировать гипотезы и принимать продуктовые решения в дизайне.',
    0,
    now()
  ),
  (
    'e0000000-0000-4000-8000-000000000002',
    'section',
    'published',
    'job-and-portfolio',
    'Поиск работы и портфолио',
    'Как собирать, оформлять и защищать кейсы, когда цифр мало, а внимание рекрутера дорого.',
    0,
    now()
  ),
  (
    'e0000000-0000-4000-8000-000000000003',
    'section',
    'published',
    'ai-design-engineering',
    'AI и дизайн-инженерия',
    'Практики UX/UI, продуктовые гипотезы и AI-инструменты для дизайнера в 2026.',
    0,
    now()
  ),
  (
    'e0000000-0000-4000-8000-000000000004',
    'section',
    'published',
    'grade-growth',
    'Рост грейда',
    'Навыки и кейсы для перехода с junior на middle и с middle на senior.',
    0,
    now()
  ),
  (
    'e0000000-0000-4000-8000-000000000005',
    'section',
    'published',
    'real-product-work',
    'Реальная работа в продукте',
    'Коммуникация с командой, приоритизация, метрики и ежедневные задачи product designer.',
    0,
    now()
  ),
  (
    'e0000000-0000-4000-8000-000000000006',
    'section',
    'published',
    'whiteboards-and-practice',
    'Вайтборды и практические задания',
    'Интерактивные вайтборды и практические задания для отработки навыков на реальных сценариях.',
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

-- Materials (8): mini_guide, full_guide, checklist, template + levels + prices
insert into public.products (id, kind, status, slug, title, description, price_kopecks, published_at)
values
  (
    'e0000000-0000-4000-8000-000000000011',
    'material',
    'published',
    'kak-chitat-produktovuyu-zadachu',
    'Как читать продуктовую задачу',
    'Разбор полей задачи, скрытых допущений и вопросов до первого макета.',
    0,
    now()
  ),
  (
    'e0000000-0000-4000-8000-000000000012',
    'material',
    'published',
    'junior-designer-2026',
    'Что должен уметь junior designer в 2026',
    'Минимум навыков: Figma, коммуникация с разработкой и продуктом, базовый UX.',
    149000,
    now()
  ),
  (
    'e0000000-0000-4000-8000-000000000013',
    'material',
    'published',
    'kak-dokazat-rezultat-bez-metrik',
    'Как доказать результат, когда нет метрик',
    'Как описывать влияние дизайна без A/B и «красивых» цифр в портфолио.',
    99000,
    now()
  ),
  (
    'e0000000-0000-4000-8000-000000000014',
    'material',
    'published',
    'kak-oformit-keis-bez-tsifr',
    'Как оформить кейс без красивых цифр',
    'Структура кейса и формулировки, которые убеждают без +47% CR.',
    129000,
    now()
  ),
  (
    'e0000000-0000-4000-8000-000000000015',
    'material',
    'published',
    'checklist-pered-testovym',
    'Чеклист перед отправкой тестового',
    'Что проверить в макете и тексте, чтобы тестовое не улетело с опечаткой.',
    79000,
    now()
  ),
  (
    'e0000000-0000-4000-8000-000000000016',
    'material',
    'published',
    'ux-audit-za-30-minut',
    'UX-аудит за 30 минут',
    'Протокол быстрого аудита экрана: проблемы, гипотезы, приоритеты.',
    119000,
    now()
  ),
  (
    'e0000000-0000-4000-8000-000000000017',
    'material',
    'published',
    'cv-dlya-product-designer',
    'CV и сопроводительное для product designer',
    'Шаблон CV, структура письма и типичные ошибки при отклике на вакансии.',
    89000,
    now()
  ),
  (
    'e0000000-0000-4000-8000-000000000018',
    'material',
    'published',
    'ai-prompty-dlya-ux',
    'AI-промпты для UX-исследования',
    'Готовые промпты для синтеза интервью, CJM и формулировки гипотез. Бесплатный мини-гайд.',
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

insert into public.materials (product_id, section_product_id, format, level)
values
  ('e0000000-0000-4000-8000-000000000011', 'e0000000-0000-4000-8000-000000000001', 'mini_guide', 'junior'),
  ('e0000000-0000-4000-8000-000000000012', 'e0000000-0000-4000-8000-000000000001', 'cheat_sheet', 'junior'),
  ('e0000000-0000-4000-8000-000000000013', 'e0000000-0000-4000-8000-000000000002', 'full_guide', 'middle'),
  ('e0000000-0000-4000-8000-000000000014', 'e0000000-0000-4000-8000-000000000002', 'template', 'middle'),
  ('e0000000-0000-4000-8000-000000000015', 'e0000000-0000-4000-8000-000000000002', 'checklist', 'junior'),
  ('e0000000-0000-4000-8000-000000000016', 'e0000000-0000-4000-8000-000000000003', 'practice', 'middle'),
  ('e0000000-0000-4000-8000-000000000017', 'e0000000-0000-4000-8000-000000000002', 'template', 'middle'),
  ('e0000000-0000-4000-8000-000000000018', 'e0000000-0000-4000-8000-000000000003', 'mini_guide', 'senior')
on conflict (product_id) do update set
  section_product_id = excluded.section_product_id,
  format = excluded.format,
  level = excluded.level,
  updated_at = now();

-- Chapters (sample content for materials)
insert into public.material_chapters (id, material_product_id, title, content, position)
values
  (
    'e0000000-0000-4000-8000-000000000101',
    'e0000000-0000-4000-8000-000000000011',
    'Контекст и цель',
    '[{"type":"paragraph","text":"Выпишите бизнес-цель и ограничение по сроку до первого пикселя."}]'::jsonb,
    0
  ),
  (
    'e0000000-0000-4000-8000-000000000102',
    'e0000000-0000-4000-8000-000000000011',
    'Вопросы до макета',
    '[{"type":"paragraph","text":"Кто пользователь, что успех, что нельзя менять в текущем флоу."}]'::jsonb,
    1
  ),
  (
    'e0000000-0000-4000-8000-000000000103',
    'e0000000-0000-4000-8000-000000000011',
    'Чеклист перед стартом',
    '[{"type":"paragraph","text":"Зафиксируйте метрику успеха, риски и критерии «готово» до открытия Figma."}]'::jsonb,
    2
  ),
  (
    'e0000000-0000-4000-8000-000000000111',
    'e0000000-0000-4000-8000-000000000012',
    'Hard skills',
    '[{"type":"paragraph","text":"Auto Layout, компоненты, варианты, типографика и сетка."}]'::jsonb,
    0
  ),
  (
    'e0000000-0000-4000-8000-000000000112',
    'e0000000-0000-4000-8000-000000000012',
    'Soft skills',
    '[{"type":"paragraph","text":"Коммуникация с продуктом и разработкой, фиксация решений, работа с фидбеком."}]'::jsonb,
    1
  ),
  (
    'e0000000-0000-4000-8000-000000000121',
    'e0000000-0000-4000-8000-000000000013',
    'Качественные сигналы',
    '[{"type":"paragraph","text":"Интервью, саппорт и записи сессий вместо метрик на старте."}]'::jsonb,
    0
  ),
  (
    'e0000000-0000-4000-8000-000000000131',
    'e0000000-0000-4000-8000-000000000014',
    'Скелет кейса',
    '[{"type":"paragraph","text":"Контекст, роль, ограничения, процесс, решение, выводы."}]'::jsonb,
    0
  ),
  (
    'e0000000-0000-4000-8000-000000000141',
    'e0000000-0000-4000-8000-000000000015',
    'Перед экспортом',
    '[{"type":"paragraph","text":"Сетка, контраст, состояния кнопок, пустые экраны."}]'::jsonb,
    0
  ),
  (
    'e0000000-0000-4000-8000-000000000151',
    'e0000000-0000-4000-8000-000000000016',
    'Таймбокс 30 минут',
    '[{"type":"paragraph","text":"5 мин цель, 10 эвристики, 10 проблемы, 5 приоритеты."}]'::jsonb,
    0
  ),
  (
    'e0000000-0000-4000-8000-000000000161',
    'e0000000-0000-4000-8000-000000000017',
    'Структура CV',
    '[{"type":"paragraph","text":"Опыт, 3 сильных кейса, навыки, ссылки — без простыни на две страницы."}]'::jsonb,
    0
  ),
  (
    'e0000000-0000-4000-8000-000000000171',
    'e0000000-0000-4000-8000-000000000018',
    'Промпт для синтеза интервью',
    '[{"type":"paragraph","text":"Шаблон: контекст, цитаты, паттерны, гипотезы, next steps."}]'::jsonb,
    0
  )
on conflict (id) do update set
  material_product_id = excluded.material_product_id,
  title = excluded.title,
  content = excluded.content,
  position = excluded.position,
  updated_at = now();

-- Tasks (4): free + paid, junior/middle/senior
insert into public.products (id, kind, status, slug, title, description, price_kopecks, published_at)
values
  (
    'e0000000-0000-4000-8000-000000000021',
    'task',
    'published',
    'razobrat-ekran-oplaty',
    'Разобрать экран оплаты',
    'Найдите UX-проблемы на экране оплаты и предложите улучшения с аргументацией.',
    0,
    now()
  ),
  (
    'e0000000-0000-4000-8000-000000000022',
    'task',
    'published',
    'uluchshit-onboarding',
    'Улучшить onboarding',
    'Пересоберите первые три шага онбординга B2C-сервиса.',
    199000,
    now()
  ),
  (
    'e0000000-0000-4000-8000-000000000023',
    'task',
    'published',
    'sobrat-strukturu-keisa',
    'Собрать структуру кейса',
    'Заполните структуру кейса по шаблону тусовки без финальной полировки.',
    149000,
    now()
  ),
  (
    'e0000000-0000-4000-8000-000000000024',
    'task',
    'published',
    'proverit-ui-kit',
    'Проверить UI-kit в Figma',
    'Аудит компонентов UI-kit: состояния, отступы, нейминг, доступность.',
    99000,
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

insert into public.tasks (product_id, level, ai_review_available, manual_review_available, manual_review_price_kopecks)
values
  ('e0000000-0000-4000-8000-000000000021', 'junior', true, false, null),
  ('e0000000-0000-4000-8000-000000000022', 'middle', true, true, 499000),
  ('e0000000-0000-4000-8000-000000000023', 'middle', true, false, null),
  ('e0000000-0000-4000-8000-000000000024', 'senior', true, false, null)
on conflict (product_id) do update set
  level = excluded.level,
  ai_review_available = excluded.ai_review_available,
  manual_review_available = excluded.manual_review_available,
  manual_review_price_kopecks = excluded.manual_review_price_kopecks,
  updated_at = now();

insert into public.task_content (task_product_id, brief, submission_requirements)
values
  (
    'e0000000-0000-4000-8000-000000000021',
    '["Скрин экрана оплаты", "3 проблемы UX с приоритетом", "1 гипотеза улучшения с метрикой", "Аргументация для стейкхолдеров"]'::jsonb,
    '["Figma или PDF с аннотациями", "Резюме до 500 слов", "Список допущений по контексту продукта"]'::jsonb
  ),
  (
    'e0000000-0000-4000-8000-000000000022',
    '["Выберите B2C onboarding", "Разберите 3 шага", "Предложите упрощение"]'::jsonb,
    '["Прототип Figma", "Метрики успеха флоу"]'::jsonb
  ),
  (
    'e0000000-0000-4000-8000-000000000023',
    '["Реальный проект", "Структура: контекст, роль, процесс, результат"]'::jsonb,
    '["Notion или Google Doc"]'::jsonb
  ),
  (
    'e0000000-0000-4000-8000-000000000024',
    '["Откройте UI-kit", "Проверьте 5 компонентов", "Список несоответствий"]'::jsonb,
    '["Таблица находок", "Скрины до/после если есть фиксы"]'::jsonb
  )
on conflict (task_product_id) do update set
  brief = excluded.brief,
  submission_requirements = excluded.submission_requirements,
  updated_at = now();

insert into public.task_ai_criteria (id, task_product_id, title, description, position)
values
  (
    'e0000000-0000-4000-8000-000000000201',
    'e0000000-0000-4000-8000-000000000021',
    'Проблемы конкретны',
    'Каждая проблема привязана к элементу UI.',
    0
  ),
  (
    'e0000000-0000-4000-8000-000000000202',
    'e0000000-0000-4000-8000-000000000021',
    'Гипотеза проверяема',
    'Гипотезу можно проверить метрикой или тестом.',
    1
  ),
  (
    'e0000000-0000-4000-8000-000000000211',
    'e0000000-0000-4000-8000-000000000022',
    'Флоу логичен',
    'Шаги ведут к aha-моменту без дублирования.',
    0
  ),
  (
    'e0000000-0000-4000-8000-000000000221',
    'e0000000-0000-4000-8000-000000000023',
    'Структура полная',
    'Есть контекст, роль, процесс и выводы.',
    0
  ),
  (
    'e0000000-0000-4000-8000-000000000231',
    'e0000000-0000-4000-8000-000000000024',
    'Компоненты консистентны',
    'Отступы, состояния и нейминг согласованы.',
    0
  )
on conflict (id) do update set
  task_product_id = excluded.task_product_id,
  title = excluded.title,
  description = excluded.description,
  position = excluded.position,
  updated_at = now();

-- Tags (12)
insert into public.tags (id, slug, name)
values
  ('e0000000-0000-4000-8000-000000000301', 'portfolio', 'Портфолио'),
  ('e0000000-0000-4000-8000-000000000302', 'case-study', 'Кейс'),
  ('e0000000-0000-4000-8000-000000000303', 'metrics', 'Метрики'),
  ('e0000000-0000-4000-8000-000000000304', 'junior', 'Junior'),
  ('e0000000-0000-4000-8000-000000000305', 'ux-audit', 'UX-аудит'),
  ('e0000000-0000-4000-8000-000000000306', 'onboarding', 'Onboarding'),
  ('e0000000-0000-4000-8000-000000000307', 'product-thinking', 'Продуктовое мышление'),
  ('e0000000-0000-4000-8000-000000000308', 'career', 'Карьера'),
  ('e0000000-0000-4000-8000-000000000309', 'checklist', 'Чеклист'),
  ('e0000000-0000-4000-8000-000000000310', 'ai', 'AI'),
  ('e0000000-0000-4000-8000-000000000311', 'ux-ui', 'UX/UI'),
  ('e0000000-0000-4000-8000-000000000312', 'cv', 'CV')
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  updated_at = now();

-- product_tags
insert into public.product_tags (product_id, tag_id)
values
  ('e0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000304'),
  ('e0000000-0000-4000-8000-000000000002', 'e0000000-0000-4000-8000-000000000301'),
  ('e0000000-0000-4000-8000-000000000002', 'e0000000-0000-4000-8000-000000000308'),
  ('e0000000-0000-4000-8000-000000000003', 'e0000000-0000-4000-8000-000000000310'),
  ('e0000000-0000-4000-8000-000000000003', 'e0000000-0000-4000-8000-000000000311'),
  ('e0000000-0000-4000-8000-000000000011', 'e0000000-0000-4000-8000-000000000307'),
  ('e0000000-0000-4000-8000-000000000012', 'e0000000-0000-4000-8000-000000000304'),
  ('e0000000-0000-4000-8000-000000000013', 'e0000000-0000-4000-8000-000000000302'),
  ('e0000000-0000-4000-8000-000000000013', 'e0000000-0000-4000-8000-000000000303'),
  ('e0000000-0000-4000-8000-000000000014', 'e0000000-0000-4000-8000-000000000302'),
  ('e0000000-0000-4000-8000-000000000015', 'e0000000-0000-4000-8000-000000000309'),
  ('e0000000-0000-4000-8000-000000000016', 'e0000000-0000-4000-8000-000000000305'),
  ('e0000000-0000-4000-8000-000000000016', 'e0000000-0000-4000-8000-000000000311'),
  ('e0000000-0000-4000-8000-000000000017', 'e0000000-0000-4000-8000-000000000312'),
  ('e0000000-0000-4000-8000-000000000017', 'e0000000-0000-4000-8000-000000000308'),
  ('e0000000-0000-4000-8000-000000000018', 'e0000000-0000-4000-8000-000000000310'),
  ('e0000000-0000-4000-8000-000000000021', 'e0000000-0000-4000-8000-000000000305'),
  ('e0000000-0000-4000-8000-000000000022', 'e0000000-0000-4000-8000-000000000306'),
  ('e0000000-0000-4000-8000-000000000023', 'e0000000-0000-4000-8000-000000000301'),
  ('e0000000-0000-4000-8000-000000000024', 'e0000000-0000-4000-8000-000000000311')
on conflict (product_id, tag_id) do nothing;

-- Section update (1)
insert into public.products (id, kind, status, slug, title, description, price_kopecks, published_at)
values
  (
    'e0000000-0000-4000-8000-000000000031',
    'section_update',
    'published',
    'product-thinking-release-1',
    'Обновление: продуктовое мышление — выпуск 1',
    'Добавлены материалы про чтение задачи и junior-навыки.',
    0,
    now()
  )
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  status = excluded.status,
  updated_at = now();

insert into public.section_updates (product_id, section_product_id, release_number)
values
  ('e0000000-0000-4000-8000-000000000031', 'e0000000-0000-4000-8000-000000000001', 1)
on conflict (product_id) do update set
  section_product_id = excluded.section_product_id,
  release_number = excluded.release_number,
  updated_at = now();

insert into public.section_update_materials (section_update_product_id, material_product_id)
values
  ('e0000000-0000-4000-8000-000000000031', 'e0000000-0000-4000-8000-000000000011'),
  ('e0000000-0000-4000-8000-000000000031', 'e0000000-0000-4000-8000-000000000012')
on conflict (section_update_product_id, material_product_id) do nothing;
