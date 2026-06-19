# Supabase Cloud — bootstrap каталога

Инструкция для запуска MVP-каталога «Дизайн Тусовка» в **Supabase Cloud** без Docker.

## Порядок запуска SQL

| Шаг | Файл | Когда |
|-----|------|-------|
| **1** | [`supabase/cloud_bootstrap.sql`](../supabase/cloud_bootstrap.sql) | Первым — схема, RLS, grants |
| **2** | [`supabase/dev_seed.sql`](../supabase/dev_seed.sql) | Вторым — демо-контент |

Оба файла выполняются в **Supabase Dashboard → SQL Editor → New query → Run**.

Повторный запуск безопасен: bootstrap использует `IF NOT EXISTS` / `OR REPLACE`; seed — `ON CONFLICT` (UUID `e0000000-*`).

## Где взять env

**Project Settings → API** в Supabase Dashboard. Скопировать в `.env.local` (не коммитить):

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-public-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-secret>
```

Имена переменных — в [`.env.example`](../.env.example).

## Запуск сайта

```bash
npm install
npm run dev
```

Открыть http://localhost:3000

Если меняли `.env.local` — **перезапустите** `npm run dev`.

## Проверка, что каталог работает

1. SQL Editor: `select count(*) from public.products where status = 'published';` — ожидается **> 0** (после seed: 16 строк, на главной 15: section/material/task).
2. Главная `/` — карточки разделов, материалов и заданий, фильтры и поиск.
3. Нет ошибки `Could not find the table 'public.products'`.
4. Бесплатные позиции показывают «Бесплатно», платные — цену в ₽.

## Что создаёт bootstrap

Таблицы, которые читает текущий код главной:

- `products`, `sections`, `materials`, `tasks`
- `tags`, `product_tags`
- `material_chapters`, `task_content`, `task_ai_criteria` (для будущих страниц)
- `section_updates`, `section_update_materials`
- `profiles`, `entitlements`, `admin_users` (фундамент auth, без UI)

Плюс RLS, read policies, API `GRANT SELECT`, RPC `get_material_toc`, `has_product_access`.

## Что не входит

Auth UI, корзина, оплата, Storage, админка — не настраиваются этими SQL.

## Альтернатива (optional)

Локальный Docker: `npm run supabase:start` → `npm run db:local:reset` (использует `supabase/migrations/` + `supabase/seed.sql`). Для MVP **не обязательно**.

## Пересборка cloud_bootstrap.sql

Если изменились миграции в `supabase/migrations/`:

```bash
node scripts/build-cloud-bootstrap.mjs
```
