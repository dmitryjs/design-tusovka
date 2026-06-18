# Отчёт по этапу

## Этап

**Этап 3.3.1 — Profiles и access foundation**

**Статус: завершён**

## Что реализовано

- Enum `entitlement_source_type` (7 значений).
- Таблицы: `profiles`, `admin_users`, `entitlements`.
- Trigger `on_auth_user_created` → `handle_new_user()` для email и Google OAuth.
- RPC `has_product_access(product_id)`, `update_my_profile(...)`.
- RLS policies на `profiles` и `entitlements` (read own); `admin_users` — RLS без policies.
- Обновлены `DATA_MODEL.md`, `ARCHITECTURE.md`, `DECISIONS.md` (ADR-020), `database-change` skill.

**Не создавалось:** каталоговые RLS, публичное чтение каталога, Storage, orders, cart, payments, reviews, auth UI, Supabase client.

## Миграция

| Параметр | Значение |
|----------|----------|
| Файл | `supabase/migrations/20260618191440_create_profiles_and_access_foundation.sql` |
| CLI | `npx supabase migration new create_profiles_and_access_foundation` |

## Таблицы

| Таблица | Назначение |
|---------|------------|
| `profiles` | Профиль пользователя (без email, без admin-флага) |
| `admin_users` | Список админов (только service role) |
| `entitlements` | Доступ user → product с источником |

## Enum

`entitlement_source_type`: direct_order, zero_order, section_order, section_update, manual, free_task_submission, all_materials_owned.

## Функции

| Функция | Тип | Назначение |
|---------|-----|------------|
| `handle_new_user()` | trigger, SECURITY DEFINER | Создание профиля при регистрации |
| `has_product_access(uuid)` | SQL, SECURITY INVOKER | Активный entitlement для `auth.uid()` |
| `update_my_profile(...)` | RPC, SECURITY DEFINER | Обновление своего профиля |

## Triggers

| Trigger | Таблица | Функция |
|---------|---------|---------|
| `profiles_set_updated_at` | profiles | `set_updated_at()` |
| `on_auth_user_created` | auth.users | `handle_new_user()` |

## RLS policies

| Таблица | Policy | Правило |
|---------|--------|---------|
| `profiles` | `profiles_select_own` | SELECT для authenticated, `id = auth.uid()` |
| `entitlements` | `entitlements_select_own` | SELECT для authenticated, `user_id = auth.uid()` |
| `admin_users` | — | RLS enabled, policies нет |
| Каталог (3.2) | — | без изменений |

## Проверки (до этапа)

| Команда | Результат | Код |
|---------|-----------|-----|
| `git status` | clean | 0 |
| `npm run db:reset` | Успех | 0 |
| `npm run db:lint` | Успех | 0 |
| `npm run db:types` | Успех | 0 |
| `npm run typecheck` | Успех | 0 |
| `npm run lint` | Успех | 0 |
| `npm run build` | Успех | 0 |
| `npm run supabase:status` | running | 0 |

## Проверки (после этапа)

| Команда | Код |
|---------|-----|
| `npm run db:reset` | 0 |
| `npm run db:lint` | 0 |
| `npm run db:types` | 0 |
| `npm run typecheck` | 0 |
| `npm run lint` | 0 |
| `npm run build` | 0 |

## Изменённые файлы

### Созданы

- `supabase/migrations/20260618191440_create_profiles_and_access_foundation.sql`

### Изменены

- `src/types/database.types.ts` (regenerated)
- `docs/DATA_MODEL.md`, `docs/ARCHITECTURE.md`, `docs/DECISIONS.md`
- `.cursor/skills/database-change/SKILL.md`
- `docs/STAGE_REPORT.md`

## Git (после этапа)

Незакоммиченные изменения: миграция, types, docs.

## Риски

- `handle_new_user` — SECURITY DEFINER: `search_path = public` зафиксирован; при расширении metadata проверять OAuth-провайдеров.
- Несколько entitlements на один `product_id` — норма; отзыв одного источника не снимает доступ, если есть другой активный.
- Пустая миграция `20260618185750` в истории — no-op, можно удалить отдельным chore.

## Откат

1. Удалить файл миграции `20260618191440_...sql`.
2. `npm run db:reset`.
3. `npm run db:types`.

## Следующий этап

**Этап 3.3.2** — RLS policies публичного чтения каталога (не начинать здесь).

## Рекомендуемый commit

```
feat(db): add profiles and entitlements foundation
```
