---
name: payment-integration
description: Интеграция платёжных сценариев в проекте «Дизайн Тусовка». Использовать при работе с оплатой, биллингом и платёжными провайдерами.
---

# Payment Integration

## Сценарии оплаты

1. **Корзина/checkout** — заказ целиком (материалы, задания, разделы, обновления разделов)
2. **0 ₽** — бесплатный заказ без платёжного API
3. **Ручная проверка** — оплата на финальном шаге отправки (не корзина)

## Условия

- Auth + email confirmed (PAY-01)
- Сумма из БД; рубли; промокодов нет
- При изменении цены на checkout — актуальная + уведомление

## Провайдеры

| Этап | Метод |
|------|-------|
| 10 | ЮKassa, СБП QR |
| 11 | Крипто (**провайдер TBD**), USDT rate frozen in payment row |

## Поток

1. Server: validate cart, recalc (включая вычет по разделу)
2. Create order + payment
3. User pays
4. Webhook → verify → idempotent → AccessGrant
5. UI: «Платёж подтверждается» if delayed; retry grant on failure → admin error queue

## Ошибка/отмена

- Корзина сохраняется
- Новый order на повторную попытку

## Чеки

ИП УСН «Доходы»; 54-ФЗ через ЮKassa — конфигурация по документации на этапе 10.

## Возвраты

Нет auto-UI; admin revokes AccessGrant manually after support decision; section — целиком.

## Analytics

Purchase event в Метрике — только после webhook (не success URL).

## Документация

Официальная API ЮKassa перед кодом; не выдумывать поля.
