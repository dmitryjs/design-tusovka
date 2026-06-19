# Отчёт по этапу

## Этап

**Юридические страницы для ЮKassa**

**Статус: завершён**

## Результат

Добавлены минимальные страницы для подключения ЮKassa: реквизиты, оферта, конфиденциальность, оплата и возврат, поддержка. Ссылки в футере — серые, малозаметные. Тексты с placeholder’ами помечены для замены перед боевыми платежами.

## Маршруты

| Маршрут | Назначение |
|---------|------------|
| `/requisites` | Реквизиты ИП, контакты, вид деятельности |
| `/offer` | Публичная оферта (черновик) |
| `/privacy` | Политика конфиденциальности (черновик) |
| `/payment-and-refund` | Оплата и возврат |
| `/support` | Поддержка |

## Файлы

- `src/components/legal/legal-page-layout.tsx` — общий layout юр. страниц
- `src/app/requisites|offer|privacy|payment-and-refund|support/page.tsx`
- `src/components/layout/site-footer.tsx` — ссылки в футере

## Проверки

| Команда | Результат |
|---------|-----------|
| `npm run typecheck` | 0 |
| `npm run lint` | 0 |
| `npm run build` | 0 |

---

## Предыдущий этап: Подготовка к деплою на Vercel

**Статус: завершён**

## Результат

Проект готов к production-like деплою: документированы env для Vercel, Supabase Auth redirects, webhook URL ЮKassa, smoke-checklist. URL-логика централизована в `src/lib/site-url.ts` (без hardcoded localhost в production).

## Документация

| Файл | Содержание |
|------|------------|
| `docs/VERCEL_DEPLOY.md` | Vercel project, env, Auth, webhook, SQL patches, smoke |
| `.env.example` | Шаблон local/production переменных |

## Env для Vercel

| Переменная | Тип |
|------------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public |
| `SUPABASE_SERVICE_ROLE_KEY` | server-only |
| `NEXT_PUBLIC_SITE_URL` | public |
| `YOOKASSA_SHOP_ID` | server-only |
| `YOOKASSA_SECRET_KEY` | server-only |
| `YOOKASSA_RETURN_URL` | server-only (опционально) |

Секреты не используются в client components (`server-only` модули).

## Production URLs

| Назначение | URL |
|------------|-----|
| Site | `https://<domain>` |
| Auth callback | `https://<domain>/auth/callback` |
| YooKassa return | `https://<domain>/checkout/success` |
| YooKassa webhook | `https://<domain>/api/webhooks/yookassa` |

## Проверки

| Команда | Результат |
|---------|-----------|
| `npm run typecheck` | 0 |
| `npm run lint` | 0 |
| `npm run build` | 0 |

## Smoke checklist

См. полный список в `docs/VERCEL_DEPLOY.md` §6.

---

## Предыдущий этап: Payment skeleton ЮKassa

**Статус: завершён**

Подготовлен безопасный каркас оплаты через ЮKassa: env, поля оплаты в `orders`, server-side создание платежа, webhook, идемпотентная выдача доступа **только после серверного подтверждения**. Без заполненных env приложение не падает — показывает «Платежи не настроены». Success page не выдаёт доступ.

## SQL patch

**Файл:** `supabase/cloud_patch_yookassa_orders.sql`

**Миграция local:** `supabase/migrations/20260618250000_yookassa_orders.sql`

**Поля `orders`:** `payment_provider`, `provider_payment_id`, `payment_status`, `payment_confirmation_url`, `paid_at`, `payment_error`, `idempotency_key`, `entitlement_grant_error`.

**RPC (service role only):** `fulfill_paid_order(p_order_id)` — идемпотентно `paid` + `direct_order` entitlements.

Инструкция: `docs/SUPABASE_CLOUD_BOOTSTRAP.md` (шаг 8), `docs/YOOKASSA_INTEGRATION.md`, `docs/VERCEL_DEPLOY.md`.

## Архитектура

| Слой | Файлы |
|------|-------|
| YooKassa API | `src/lib/payments/yookassa/config.ts`, `client.ts`, `create-payment.ts`, `webhook.ts` |
| Checkout | `src/lib/payments/checkout-order.ts` |
| Server actions | `src/app/actions/payments.ts` |
| Webhook | `src/app/api/webhooks/yookassa/route.ts` |
| Site URL | `src/lib/site-url.ts` |
| UI | `pay-order-button.tsx`, `checkout-status-panel.tsx`, обновлены `cart-view.tsx`, `orders-list.tsx` |

## Маршруты

| Маршрут | Назначение |
|---------|------------|
| `/checkout/success` | Возврат с ЮKassa, статус «Платёж подтверждается» / «Оплачено» (без выдачи доступа на странице) |
| `/checkout/fail` | Оплата не завершена |
| `POST /api/webhooks/yookassa` | Webhook `payment.succeeded` / `payment.canceled` |

## Env

| Переменная | Назначение |
|------------|------------|
| `YOOKASSA_SHOP_ID` | shopId (HTTP Basic Auth) |
| `YOOKASSA_SECRET_KEY` | секретный ключ API |
| `YOOKASSA_RETURN_URL` | return_url (опционально) |

`YOOKASSA_WEBHOOK_SECRET` не используется (по документации ЮKassa: проверка через GET платежа + IP).

## Безопасность

- Сумма пересчитывается на сервере из `order_items` с проверкой `products.price_kopecks`.
- Клиент передаёт только `orderId`.
- `Idempotence-Key` = `order.id` (стабилен), сохраняется до вызова API.
- Webhook: IP allowlist (prod, defense-in-depth), обязательный `GET /v3/payments/{id}`, сверка суммы по `order_items`.
- Повторный webhook / `fulfill_paid_order` не дублирует entitlements (`unique` + exception).
- Ошибка выдачи → `entitlement_grant_error`.
- Service role только server-side (обновление `orders`, RPC fulfill).

## Security review (перед коммитом)

**Дата:** 2026-06-19

| # | Проверка | Статус |
|---|----------|--------|
| 1 | `git status` | OK — payment/cart файлы в working tree |
| 2 | `.env.local` не в git | OK (`.env*`) |
| 3 | Реальные ключи в репо | не найдены |
| 4 | `YOOKASSA_SECRET_KEY` server-only | OK (`server-only` в config/client) |
| 5 | Клиент не передаёт сумму | OK — только `orderId` |
| 6 | Сумма с сервера | OK — `order_items` + сверка с `products.price_kopecks` |
| 7 | Платёж только владельцу | OK (`user_id` + RLS) |
| 8 | Только `pending_payment` | OK |
| 9–10 | Идемпотентность платежа | OK — `Idempotence-Key` = `order.id`, reuse pending via GET API |
| 11 | Success page без доступа | OK |
| 12–13 | Webhook + fulfill | OK — GET verify, sum, `fulfill_paid_order` |
| 14 | `payment.canceled` | OK → `failed` + `payment_canceled` |
| 15 | Ошибка выдачи | OK → `entitlement_grant_error` |
| 16 | Service role server-only | OK |
| 17–19 | RLS / policies / SQL | OK — без `using (true)`, без destructive |
| 20 | IP allowlist | OK — dev skip; prod + API verify (не ложная безопасность) |

**Найдено и исправлено:**

1. **Средний:** при сбое сохранения после API `Idempotence-Key` мог меняться → дубль платежа. Исправлено: ключ = `order.id`, сохранение до API.
2. **Средний:** повтор «Оплатить» мог вернуть устаревший `confirmation_url` отменённого платежа. Исправлено: GET статуса перед reuse.
3. **Низкий:** webhook сверял только `orders.total_kopecks`. Исправлено: сумма из `order_items`, проверка `metadata.order_id` / `provider_payment_id`.

**Остаточные риски (не блокируют коммит):**

- IP allowlist на кастомном прокси без доверенных заголовков — компенсируется обязательной GET-верификацией платежа.

**Вердикт:** можно коммитить после `cloud_patch_yookassa_orders.sql` в Supabase и ручного теста webhook (туннель).

## Сборка без Google Fonts

`next/font/google` заменён на системный font stack в `globals.css` (`Inter` как предпочтение ОС, без сетевой загрузки при build).

## Проверки (build)

| Команда | Результат |
|---------|-----------|
| `npm run typecheck` | 0 |
| `npm run lint` | 0 |
| `npm run build` | 0 |

## Ручные сценарии (оплата)

1. Выполнить `cloud_patch_yookassa_orders.sql`.
2. Без env: checkout → заказ создан, «Платежи не настроены».
3. С test env: checkout → редирект на ЮKassa.
4. `/checkout/success` после возврата → «Платёж подтверждается», доступ не выдан.
5. Webhook `payment.succeeded` → `paid`, продукты в `/profile`.
6. Повторный webhook → без дублей entitlements.
7. Купленный продукт → нельзя в корзину.

## Не реализовано

СБП, crypto, 54-ФЗ чеки, промокоды, возвраты, guest cart merge.
