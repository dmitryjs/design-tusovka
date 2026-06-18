# Отчёт по этапу

## Этап

**Этап 3.3.4 — API grants для RLS**

**Статус: завершён**

## Что реализовано

- Миграция постоянных `GRANT` для PostgREST/API: `supabase/migrations/20260618195500_grant_api_access_for_rls.sql`
- `REVOKE EXECUTE` на `has_product_access` от `anon`
- Разделение RLS-политик `task_content` / `task_ai_criteria` на free и entitled (fix: `anon` не вызывает `has_product_access` без SELECT на `entitlements`)
- Удалены временные grants из pgTAP setup; тест `anon` + `material_chapters` → `throws_ok(42501)`
- Обновлены docs, ADR-023, skills

**Не создавалось:** Storage, UI, auth pages, cart/orders/payments, новые таблицы.

## Зачем GRANT вместе с RLS

PostgREST (Supabase API) сначала проверяет **table privileges** роли (`anon` / `authenticated`). Без `GRANT SELECT` клиент получает `permission denied (42501)`, даже если RLS policy разрешила бы строки. RLS — второй слой фильтрации после успешного privilege check.

## Миграция

**Имя файла:** `20260618195500_grant_api_access_for_rls.sql`

### Table grants

| Grant | Роли |
|-------|------|
| `USAGE ON SCHEMA public` | `anon`, `authenticated` |
| `SELECT` на `products`, `sections`, `materials`, `tasks`, `tags`, `product_tags`, `section_updates`, `section_update_materials`, `task_content`, `task_ai_criteria` | `anon`, `authenticated` |
| `SELECT` на `profiles`, `entitlements`, `material_chapters` | `authenticated` only |

### Без client grants

- `admin_users` — нет grants для клиентских ролей
- `INSERT` / `UPDATE` / `DELETE` — нет на каталог, profiles, entitlements, admin_users

### RPC grants

| Функция | Роли | Источник |
|---------|------|----------|
| `get_material_toc(uuid)` | `anon`, `authenticated` | миграция 3.3.2 (не дублировалось) |
| `has_product_access(uuid)` | `authenticated` only | `REVOKE` от `anon` в 3.3.4 |
| `update_my_profile(...)` | `authenticated` only | миграция 3.3.1 (не дублировалось) |

### Policy fix (в той же миграции)

Единая policy `*_select_free_or_entitled` с `OR has_product_access(...)` заставляла PostgreSQL вызывать `has_product_access` для `anon` → ошибка на `entitlements`. Заменено на две политики:

- `task_content_select_free` / `task_ai_criteria_select_free` — `anon`, `authenticated`, `price_kopecks = 0`
- `task_content_select_entitled` / `task_ai_criteria_select_entitled` — `authenticated`, `price_kopecks > 0`, `has_product_access`

## Удалено из тестового setup

Из `supabase/tests/database/01_catalog_rls.test.sql` убрано:

```sql
grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon, authenticated;
```

Изменён сценарий #6: вместо `is_empty` для `anon` + `material_chapters` — `throws_ok(..., '42501')` (нет SELECT grant).

## Проверки

| Команда | Exit code |
|---------|-----------|
| `npm run db:reset` | 0 |
| `npm run db:lint` | 0 |
| `npm run db:types` | 0 |
| `npm run db:test` | 0 (18/18) |
| `npm run typecheck` | 0 |
| `npm run lint` | 0 |
| `npm run build` | 0 |

## Риски

- Новые таблицы с RLS потребуют явного `GRANT` в миграции — иначе API снова вернёт 42501.
- `throws_ok` на client writes ловит отсутствие INSERT/UPDATE grants — эквивалентно блокировке, но сообщение об ошибке отличается от RLS deny.
- Policy split для tasks — при добавлении новых путей доступа нужно не смешивать free и entitled в одной policy с `OR has_product_access`.

## Изменённые файлы

### Созданы

- `supabase/migrations/20260618195500_grant_api_access_for_rls.sql`
- `supabase/tests/database/01_catalog_rls.test.sql` (этап 3.3.3, без временных grants)

### Изменены

- `package.json` — `db:test` (этап 3.3.3)
- `docs/DATA_MODEL.md`, `docs/ARCHITECTURE.md`, `docs/DECISIONS.md` (ADR-023)
- `.cursor/skills/database-change/SKILL.md`, `.cursor/skills/verify-project/SKILL.md`
- `docs/STAGE_REPORT.md`

## Откат

1. Удалить миграцию `20260618195500_grant_api_access_for_rls.sql`.
2. `npm run db:reset` — вернутся policies 3.3.2 (combined free_or_entitled).
3. Вернуть временные grants в test setup (не рекомендуется — маскирует gap).
4. Документацию откатить по git.

## Рекомендуемый commit

Два коммита (3.3.3 + 3.3.4) или один объединённый:

```
test(db): add pgTAP RLS verification for catalog access
feat(db): grant API SELECT for RLS via PostgREST
```

Коммит **не выполнен** по инструкции этапа (ожидаются незакоммиченные изменения 3.3.3 + 3.3.4).

## Следующий шаг (не начинать здесь)

Supabase client в `src/lib/supabase/`, auth UI, Storage — этап 4+.
