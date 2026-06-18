---
name: verify-project
description: Проверка состояния проекта «Дизайн Тусовка» перед и после изменений. Использовать при верификации структуры, документации и готовности к разработке.
---

# Verify Project

## Команды проверки (этап 2+)

```bash
npm run typecheck
npm run lint
npm run build
```

## Команды БД (этап 3.1+)

```bash
npm run supabase:status   # Docker + локальный стек
npm run db:reset          # миграции + seed
npm run db:lint           # схема без ошибок (exit 0)
npm run db:types          # src/types/database.types.ts (exit 0)
npm run db:test           # pgTAP RLS + grants из миграций (этап 3.3.3+)
```

`db:lint`, `db:types`, `db:test` — с `SUPABASE_TELEMETRY_DISABLED=1` через `cross-env`.

Тестовый runner **не установлен** — `npm test` не использовать.

## Перед этапом

1. Прочитать `docs/STAGE_REPORT.md`.
2. `git status` — не перезаписывать чужие изменения.
3. Сверить задачу с `docs/` и `.cursor/rules/`.

## После этапа

1. Запустить `typecheck`, `lint`, `build`.
2. При изменении схемы: `db:reset`, `db:lint`, `db:types`.
3. При изменении RLS или grants: `db:test`.
4. Обновить `docs/STAGE_REPORT.md`.
5. Проверить diff на секреты.

## Документация

- [ ] `PRODUCT.md`, `BUSINESS_RULES.md` актуальны
- [ ] `DATA_MODEL.md` согласован с миграциями
- [ ] `ARCHITECTURE.md` отражает `src/` и `supabase/`

## Инварианты

- Email confirmed → оплата и отправка решения
- Webhook → AccessGrant (когда таблицы появятся)
- Primary `#094BF5`, шрифт Inter
- Цены в БД — **копейки** (`price_kopecks`)
- Вне MVP: подписки, промокоды, прогресс, dark mode

## Production (19–20)

- RLS policies, webhook idempotency, cookie before Metrica
