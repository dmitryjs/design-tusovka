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
6. `npm run supabase:stop`

См. ADR-018–020, `docs/INTEGRATIONS.md`.

## Сверка

`docs/DATA_MODEL.md`, `docs/BUSINESS_RULES.md`, ADR-009–013, ADR-018–020.

## Реализовано

**Каталог (3.2):** products, sections, materials, material_chapters, tasks, task_content, task_ai_criteria, tags, product_tags, section_updates, section_update_materials. RLS enabled, **без policies**.

**Профили и доступ (3.3.1):**

- `profiles` — trigger на `auth.users`; read own; update только `update_my_profile`
- `admin_users` — RLS, без client policies
- `entitlements` — read own; insert/update/delete только server-side
- `has_product_access(product_id)`, `update_my_profile(...)`

**Enum:** `entitlement_source_type` (+ каталоговые enums).

## Клиенту запрещено

- Прямой CRUD `profiles`, `entitlements`, `admin_users`
- Любой доступ к каталогу через anon/authenticated (до 3.3.2)

## Ещё не в БД

cart_items, orders, payments, submissions, product_reviews, Storage buckets, каталоговые RLS policies.

## Storage (план)

- **public-media**, **private-files**; signed URL после entitlement check.

## Миграции

Одна цель на файл; обновить `DATA_MODEL.md` и `db:types`.

## Не создавать в MVP

`learning_progress`, `subscriptions`, `promo_codes`, `audit_history`
