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

Опционально для локальной проверки UI:

```bash
npm run dev
```

Тестовый runner **не установлен** — `npm test` не использовать.

## Перед этапом

1. Прочитать `docs/STAGE_REPORT.md`.
2. `git status` — не перезаписывать чужие изменения.
3. Сверить задачу с `docs/` и `.cursor/rules/`.

## После этапа

1. Запустить `typecheck`, `lint`, `build`.
2. Обновить `docs/STAGE_REPORT.md`.
3. Проверить diff на секреты.

## Документация

- [ ] `PRODUCT.md`, `BUSINESS_RULES.md` актуальны
- [ ] `DATA_MODEL.md` согласован с миграциями (этап 3+)
- [ ] `ARCHITECTURE.md` отражает фактическую структуру `src/`

## Инварианты

- Email confirmed → оплата и отправка решения
- Webhook → AccessGrant
- Primary `#094BF5`, шрифт Inter
- Вне MVP: подписки, промокоды, прогресс, dark mode

## Production (19–20)

- RLS, webhook idempotency, cookie before Metrica
