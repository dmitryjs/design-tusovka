---
name: database-change
description: Безопасное внесение изменений в схему и данные проекта «Дизайн Тусовка». Использовать при миграциях, изменении модели данных и работе с БД.
---

# Database Change

## Локальная среда (этап 3.1)

1. Docker running → `npm run supabase:start`
2. `npm run supabase:status` — скопировать URL и ключи в `.env.local` (не коммитить)
3. Миграции: `supabase/migrations/` (этап 3.2+)
4. Сброс БД: `npm run db:reset` (применяет миграции + seed, когда появятся)
5. Остановка: `npm run supabase:stop`

См. `docs/DECISIONS.md` ADR-018, `docs/INTEGRATIONS.md`.

## Сверка

`docs/DATA_MODEL.md`, `docs/BUSINESS_RULES.md`, `docs/DECISIONS.md` ADR-009–013, ADR-018.

## Storage (утверждено)

- **public-media** — обложки, изображения
- **private-files** — решения, feedback, приватные вложения
- Signed URL — только server-side после `AccessGrant`

## Ключевые таблицы

- `materials` (section_id, type enum, price_rub, status)
- `sections`, `section_updates`
- `assignments` (без section_id; ai_criteria JSON)
- `orders`, `order_items` (item_type: material|assignment|section|section_update)
- `payments`, `access_grants` (unique user+grant)
- `submissions`, `ai_reviews`, `manual_reviews` (versions)
- `product_reviews` (unique user+product)
- `webhook_events`, `access_grant_errors`
- `cart_items` (guest merge)

## AccessGrant

- Бессрочный (без expires_at)
- `ON CONFLICT DO NOTHING` для идемпотентности webhook
- Отзыв при refund (REF-04)

## Раздел: расчёт

Функция/SQL: `section_price - SUM(paid material prices in section for user)`.

## RLS

- Каталог published — public read metadata
- Главы материала — только с grant или preview fields
- Admin — service role

## Не создавать в MVP

- `learning_progress`, `subscriptions`, `promo_codes`, `audit_history`

## Миграции

`supabase/migrations/`; одна цель на файл; обновить `DATA_MODEL.md` при изменении схемы.
