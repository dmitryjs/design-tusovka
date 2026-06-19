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

## Запуск MVP (без Docker)

```bash
npm run dev
```

Требуется `.env.local` с ключами Supabase Cloud (см. `INTEGRATIONS.md`).

## Команды БД — Cloud

```bash
npm run db:push           # миграции в linked project
npm run db:types          # типы из cloud
```

## Команды БД — optional local (Docker)

```bash
npm run supabase:start
npm run db:local:reset
npm run db:local:lint
npm run db:types:local
npm run db:local:test
```

`db:lint`, `db:types`, `db:test` — алиасы на `db:local:*` (обратная совместимость).

Тестовый runner **не установлен** — `npm test` не использовать.

## Перед этапом

1. Прочитать `docs/STAGE_REPORT.md`.
2. `git status` — не перезаписывать чужие изменения.
3. Сверить задачу с `docs/` и `.cursor/rules/`.

## После этапа

1. Запустить `typecheck`, `lint`, `build`.
2. При изменении схемы cloud: `db:push`, `db:types`.
3. При изменении RLS: `db:local:test` (optional, Docker).
4. Обновить `docs/STAGE_REPORT.md`.
5. Проверить diff на секреты (не коммитить `.env.local`).

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
