---
name: database-change
description: Безопасное внесение изменений в схему и данные проекта «Дизайн Тусовка». Использовать при миграциях, изменении модели данных и работе с БД.
---

# Database Change

## Локальная среда

1. Docker running → `npm run supabase:start`
2. `npm run supabase:status` — URL и ключи в `.env.local` (не коммитить)
3. Новая миграция: `npx supabase migration new <name>`
4. Применить: `npm run db:reset` или `supabase migration up`
5. `npm run db:lint` — проверка схемы
6. `npm run db:types` — обновить `src/types/database.types.ts` (только stdout в файл; telemetry отключена)
7. Остановка: `npm run supabase:stop`

См. ADR-018, ADR-019, `docs/INTEGRATIONS.md`.

## Сверка

`docs/DATA_MODEL.md`, `docs/BUSINESS_RULES.md`, ADR-009–013, ADR-018, ADR-019.

## Реализовано (этап 3.2)

**Enums:** product_kind, product_status, material_format, designer_level.

**Таблицы:** products, sections, materials, material_chapters, tasks, task_content, task_ai_criteria, tags, product_tags, section_updates, section_update_materials.

**Паттерн:** все товары → `products` (kind, slug, price_kopecks, status); расширения 1:1.

**RLS:** включён на всех таблицах каталога; **политик нет** (этап 3.3).

## Ещё не в БД

- profiles, cart_items, orders, order_items, payments
- access_grants, access_grant_errors, webhook_events
- submissions, ai_reviews, manual_reviews, product_reviews
- Storage buckets

## Storage (план)

- **public-media** — обложки
- **private-files** — решения, feedback
- Signed URL — server-side после AccessGrant

## AccessGrant (план)

- Бессрочный; `ON CONFLICT DO NOTHING` для webhook
- Отзыв при refund (REF-04)

## Раздел: расчёт (план)

`section price_kopecks - SUM(paid material prices in section for user)`.

## Миграции

`supabase/migrations/`; одна цель на файл; обновить `DATA_MODEL.md` и `db:types` при изменении схемы.

## Не создавать в MVP

- `learning_progress`, `subscriptions`, `promo_codes`, `audit_history`
