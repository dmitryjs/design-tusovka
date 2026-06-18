---
name: feature-implementation
description: Реализация функциональности проекта «Дизайн Тусовка» по документации. Использовать при разработке новых фич и доработке существующих.
---

# Feature Implementation

## Перед кодом

1. Номер этапа → docs из таблицы ниже
2. Проверить invariants в `verify-project` skill
3. TBD не реализовывать: цены контента, криптопровайдер, email, юр. тексты

## Docs по этапам

| Этап | Фокус | Docs |
|------|-------|------|
| 2 | App, Inter, `#094BF5`, radii | `ARCHITECTURE.md`, ADR-005 |
| 3 | DB, Storage, RLS | `DATA_MODEL.md` |
| 4 | Auth, profile, settings | `USER_FLOWS` UF-01, AUTH-* |
| 5 | Главная=каталог, поиск, фильтры | `PRODUCT.md`, UF-02 |
| 6 | Страницы товаров, превью глав | ACCESS-06, UF-05 |
| 7 | Библиотека, заказы | UF-08 |
| 8 | Корзина guest merge, раздел/материал | CART-*, UF-03 |
| 9 | 0 ₽, «Получить бесплатно» | UF-04, ADR-011 |
| 10–11 | ЮKassa, СБП, крипто | `payment-integration` |
| 12 | Submission, Polza AI | TASK-03–05, UF-10 |
| 13 | Manual review checkout | TASK-06–09, UF-11 |
| 14 | Отзывы | REV-*, UF-12 |
| 15 | Admin, editor, dashboard | `ADMIN_REQUIREMENTS.md` |
| 16 | Email + in-app notifications | `INTEGRATIONS.md`, `PRODUCT.md` |
| 17 | Admin analytics + Metrica | `ANALYTICS.md` |
| 18 | Support, legal, cookie | UF-14 |

## UI

- RU интерфейс; ₽; CTA «Получить бесплатно»
- Карточки: обложка, тип, уровень, теги, цена, отзывы
- Задание: бейджи «AI бесплатно», «Эксперт платно»

## Запрещено в MVP

Подписки, промокоды, избранное, прогресс, чек-ины, стрики, черновики решений

## Сервер

Все цены, доступ, AI attempt count, cart rules — server-side
