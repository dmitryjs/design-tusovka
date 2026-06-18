---
name: database-change
description: Безопасное внесение изменений в схему и данные проекта «Дизайн Тусовка». Использовать при миграциях, изменении модели данных и работе с БД.
---

# Database Change

## Локальная среда

1. Docker running → `npm run supabase:start`
2. `npm run supabase:status` — URL и ключи в `.env.local` (не коммитить)
3. Новая миграция: `npx supabase migration new <name>`
4. Применить: `npm run db:reset`
5. `npm run db:lint`, `npm run db:types`
6. `npm run db:test` — pgTAP RLS tests (`supabase test db --local`); grants проверяются из миграций, не из test setup
7. `npm run supabase:stop`

См. ADR-018–023, `docs/INTEGRATIONS.md`.

## Сверка

`docs/DATA_MODEL.md`, `docs/BUSINESS_RULES.md`, ADR-009–013, ADR-018–023.

## Реализовано

**Каталог (3.2):** products + расширения, RLS enabled.

**Каталог RLS (3.3.2):**

- Published metadata: SELECT для anon/authenticated
- `material_chapters`: только authenticated + `has_product_access`
- `get_material_toc` — оглавление без content
- `task_content` / `task_ai_criteria`: free или entitled
- **Нет** client write policies на каталог

**Профили и доступ (3.3.1):** profiles, admin_users, entitlements, `has_product_access`, `update_my_profile`.

**API grants (3.3.4):** `GRANT SELECT` для PostgREST; `admin_users` без client access; task policies split free/entitled.

## Клиенту запрещено

- CRUD `profiles`, `entitlements`, `admin_users` (кроме RPC)
- INSERT/UPDATE/DELETE каталога
- Чтение `material_chapters.content` без entitlement (использовать `get_material_toc` для preview)

## Ещё не в БД

cart_items, orders, payments, submissions, product_reviews, Storage buckets.

## Миграции

Одна цель на файл; обновить `DATA_MODEL.md` и `db:types`.

## Не создавать в MVP

`learning_progress`, `subscriptions`, `promo_codes`, `audit_history`
