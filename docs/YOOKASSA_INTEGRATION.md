# Интеграция ЮKassa (MVP skeleton)

Подготовка приёма платежей без хранения данных карт. Реальные ключи — только в `.env.local` (не коммитить).

Официальная документация:

- [Процесс платежа](https://yookassa.ru/developers/payment-acceptance/getting-started/payment-process)
- [Формат API и идемпотентность](https://yookassa.ru/developers/using-api/interaction-format#idempotence)
- [Входящие уведомления (webhooks)](https://yookassa.ru/developers/using-api/webhooks)

## Переменные окружения

| Переменная | Где | Назначение |
|------------|-----|------------|
| `YOOKASSA_SHOP_ID` | server | shopId из ЛК ЮKassa |
| `YOOKASSA_SECRET_KEY` | server | секретный ключ API |
| `YOOKASSA_RETURN_URL` | server | URL возврата после оплаты (опционально; иначе `{NEXT_PUBLIC_SITE_URL}/checkout/success`) |
| `YOOKASSA_SEND_RECEIPT` | server | `true`/`1`/`yes` — включить фискальный чек (54-ФЗ). Требует настроенной фискализации магазина. По умолчанию выключено |
| `YOOKASSA_VAT_CODE` | server | код НДС позиций чека (1..6). По умолчанию `1` — «Без НДС» (НПД) |

`YOOKASSA_WEBHOOK_SECRET` **не используется**: по документации ЮKassa подлинность webhook проверяется через GET статуса платежа и/или IP-адрес отправителя.

## SQL patch

Выполнить **после** `cloud_patch_cart_orders.sql`:

[`supabase/cloud_patch_yookassa_orders.sql`](../supabase/cloud_patch_yookassa_orders.sql)

Добавляет поля оплаты в `orders` и RPC `fulfill_paid_order` (идемпотентная выдача `direct_order` entitlements).

## URL в личном кабинете ЮKassa

| Назначение | URL |
|------------|-----|
| HTTP-уведомления (webhook) | `https://ВАШ_ДОМЕН/api/webhooks/yookassa` |
| События | `payment.succeeded`, `payment.canceled` |
| return_url (в коде) | `https://ВАШ_ДОМЕН/checkout/success?order_id={uuid}` |

Для локальной разработки webhook недоступен без туннеля (ngrok и т.п.). В `development` проверка IP webhook отключена.

Production deploy: [`docs/VERCEL_DEPLOY.md`](VERCEL_DEPLOY.md).

## Поток

1. Пользователь оформляет корзину → `pending_payment` order.
2. Server action `startYookassaPaymentAction(orderId)`:
   - проверяет владельца и статус;
   - пересчитывает сумму по `order_items`;
   - формирует публичный номер заказа `DT-XXXXXXXX` (первые 8 символов `order.id`, primary key не меняется);
   - создаёт платёж `POST /v3/payments` с `Idempotence-Key`;
   - сохраняет `provider_payment_id`, `payment_confirmation_url`.

### Назначение платежа, metadata и чек

Формируется в `src/lib/payments/yookassa/create-payment.ts` (все данные — только server-side из `order_items` / `products`, ничего с клиента):

- **`description`**: `Оплата заказа DT-XXXXXXXX`.
- **`metadata`**: `order_id`, `order_number` (`DT-XXXXXXXX`), `user_id` (server-only, клиенту не отдаётся), `source: "design-tusovka"`.
- **`receipt.items`** (при `YOOKASSA_SEND_RECEIPT=true` и наличии email покупателя, см. `receipt.ts`) — по позиции на каждый `order_item`:
  - материал → `Доступ к материалу: {title}`;
  - раздел → `Доступ к разделу: {title}`;
  - задание → `Доступ к заданию: {title}`;
  - неизвестный тип → `Доступ к цифровому материалу: {title}`.
  - Описание обрезается до 128 символов; сумма позиций равна сумме платежа; `vat_code` по умолчанию `1` (без НДС), `payment_mode: full_payment`, `payment_subject: service`.

Публичный номер и хелперы чека: `order-number.ts`, `receipt.ts`.

Связь webhook с заказом — по `provider_payment_id`; `metadata.order_id` используется как **дополнительная** проверка (при несовпадении заказ помечается `failed`). Идемпотентность выдачи прав не меняется.
3. Редирект на `confirmation_url` ЮKassa.
4. После оплаты пользователь возвращается на `/checkout/success` — **без выдачи доступа**.
5. Webhook `payment.succeeded`:
   - проверка IP (prod);
   - `GET /v3/payments/{id}` — статус `succeeded`, `paid: true`;
   - сверка суммы с `orders.total_kopecks`;
   - `fulfill_paid_order` → `paid` + entitlements.

## Тестовый платёж

1. Создайте тестовый магазин в ЛК ЮKassa.
2. Заполните `YOOKASSA_*` в `.env.local`.
3. Выполните SQL patch.
4. Настройте webhook URL (туннель для local).
5. Создайте заказ из `/cart` → оплатите тестовой картой из документации ЮKassa.
6. Убедитесь, что webhook пришёл и заказ стал `paid`, продукты — в `/profile`.

## Ручные сценарии

| # | Сценарий | Ожидание |
|---|----------|----------|
| 1 | Checkout без env | Заказ создаётся, сообщение «Платежи не настроены» |
| 2 | Checkout с env | Редирект на ЮKassa |
| 3 | Сумма | Берётся с сервера из `order_items`, не с клиента |
| 4 | `/checkout/success` | «Платёж подтверждается», доступ не выдан |
| 5 | Webhook `payment.succeeded` | `paid`, entitlements, повторный webhook — без дублей |
| 6 | `/profile/orders` | Paid order виден |
| 7 | Купленный продукт | Нельзя добавить в корзину (`already_owned`) |

## Безопасность

- Секретный ключ и service role — только server-side.
- Клиент не передаёт сумму.
- Success page не подтверждает оплату.
- Ошибка выдачи доступа → `orders.entitlement_grant_error`.
