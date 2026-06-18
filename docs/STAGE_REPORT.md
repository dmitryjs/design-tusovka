# Отчёт по этапу

## Этап

**Этап 3.3.2 — Catalog RLS и безопасное публичное чтение**

**Статус: завершён**

## Что реализовано

- SELECT RLS policies для published каталога (metadata).
- Закрытый доступ к `material_chapters` (только entitlement).
- `task_content` / `task_ai_criteria` — free task или entitlement.
- RPC `get_material_toc(material_product_id)` — оглавление без `content`.
- Обновлены docs и ADR-021.

**Не создавалось:** Storage, cart, orders, payments, reviews, UI, Supabase client, seed, admin panel.

## Миграция

`supabase/migrations/20260618193254_create_catalog_read_policies.sql`

## Policies (SELECT)

| Policy | Таблица | Роли | Условие |
|--------|---------|------|---------|
| `products_select_published` | products | anon, authenticated | status = published |
| `sections_select_published` | sections | anon, authenticated | product published |
| `materials_select_published` | materials | anon, authenticated | product published |
| `tasks_select_published` | tasks | anon, authenticated | product published |
| `tags_select_published` | tags | anon, authenticated | linked to published product |
| `product_tags_select_published` | product_tags | anon, authenticated | product published |
| `section_updates_select_published` | section_updates | anon, authenticated | update + section published |
| `section_update_materials_select_published` | section_update_materials | anon, authenticated | update product published |
| `material_chapters_select_entitled` | material_chapters | authenticated | has_product_access |
| `task_content_select_free_or_entitled` | task_content | anon, authenticated | published + (free or entitled) |
| `task_ai_criteria_select_free_or_entitled` | task_ai_criteria | anon, authenticated | published + (free or entitled) |

## Функции

| Функция | Назначение |
|---------|------------|
| `get_material_toc(uuid)` | id, title, position для published material; SECURITY DEFINER; grant anon + authenticated |

## Таблицы без write policies

Все 11 таблиц каталога + profiles, entitlements, admin_users — **нет** client INSERT/UPDATE/DELETE policies.

## Риски утечки контента

| Риск | Митигация |
|------|-----------|
| `material_chapters.content` при public SELECT | Нет public policy; только entitlement |
| Preview оглавления | `get_material_toc` не выбирает `content` |
| Платная задача без покупки | `task_content` требует price=0 или `has_product_access` |
| Draft/hidden в каталоге | policies фильтруют `status = published` |

## Проверки

| Команда | Exit code |
|---------|-----------|
| `npm run db:reset` | 0 |
| `npm run db:lint` | 0 |
| `npm run db:types` | 0 |
| `npm run typecheck` | 0 |
| `npm run lint` | 0 |
| `npm run build` | 0 |

## Изменённые файлы

### Созданы

- `supabase/migrations/20260618193254_create_catalog_read_policies.sql`

### Изменены

- `src/types/database.types.ts`
- `docs/DATA_MODEL.md`, `docs/ARCHITECTURE.md`, `docs/DECISIONS.md`
- `.cursor/skills/database-change/SKILL.md`
- `docs/STAGE_REPORT.md`

## Git

Незакоммиченные изменения (миграция + docs + types).

## Откат

1. Удалить миграцию `20260618193254_...sql`.
2. `npm run db:reset` && `npm run db:types`.

## Рекомендуемый commit

```
feat(db): add catalog read RLS policies and material toc RPC
```
