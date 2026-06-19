# Деплой на Vercel и тест ЮKassa webhook

Инструкция для production-like окружения MVP «Дизайн Тусовка».

## Предварительные условия

1. Репозиторий на GitHub с актуальным кодом.
2. Supabase Cloud с применёнными SQL patches (см. ниже).
3. Тестовый или боевой магазин ЮKassa (для оплаты).

## 1. Создание проекта на Vercel

1. [vercel.com](https://vercel.com) → **Add New** → **Project**.
2. Import Git Repository → выберите репозиторий.
3. **Framework Preset:** Next.js (авто).
4. **Root Directory:** корень репозитория.
5. **Build Command:** `npm run build` (по умолчанию).
6. **Output:** Next.js default.
7. Перед первым деплоем добавьте Environment Variables (раздел 2).
8. **Deploy**.

После деплоя запишите production URL, например `https://design-tusovka.vercel.app`.

## 2. Environment Variables на Vercel

**Добавьте переменные до первого деплоя** (или сразу после failed build) и сделайте **Redeploy**. Без `NEXT_PUBLIC_SUPABASE_URL` и `NEXT_PUBLIC_SUPABASE_ANON_KEY` сайт не сможет загрузить каталог.

Добавить в **Project → Settings → Environment Variables**.

| Переменная | Scope | Local | Production |
|------------|-------|-------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview | `https://<ref>.supabase.co` | то же |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview | anon key из Supabase | то же |
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview | service role key | то же |
| `NEXT_PUBLIC_SITE_URL` | Production | `http://localhost:3000` | `https://<your-domain>` |
| `YOOKASSA_SHOP_ID` | Production, Preview | test shopId (опционально) | shopId магазина |
| `YOOKASSA_SECRET_KEY` | Production, Preview | test secret (опционально) | secret key |
| `YOOKASSA_RETURN_URL` | Production, Preview | пусто или local tunnel URL | `https://<your-domain>/checkout/success` |

### Важно

- **`SUPABASE_SERVICE_ROLE_KEY`**, **`YOOKASSA_SECRET_KEY`**, **`YOOKASSA_SHOP_ID`** — только server-side, **без** префикса `NEXT_PUBLIC_`.
- `NEXT_PUBLIC_SITE_URL` на Production должен совпадать с публичным URL сайта (включая custom domain).
- После изменения `NEXT_PUBLIC_*` переменных нужен **redeploy** (они встраиваются при build).
- Локально скопируйте значения в `.env.local` (не коммитить). Шаблон: [`.env.example`](../.env.example).

## 3. Supabase Auth URL settings

**Supabase Dashboard → Authentication → URL Configuration**

| Поле | Local | Production |
|------|-------|------------|
| **Site URL** | `http://localhost:3000` | `https://<your-domain>` |
| **Redirect URLs** | `http://localhost:3000/auth/callback` | `https://<your-domain>/auth/callback` |

Для Vercel Preview добавьте также:

```
https://<project>-<branch>-<team>.vercel.app/auth/callback
```

или wildcard по политике команды (если используете preview).

Auth redirect в коде:

- sign-up / reset password → `{origin}/auth/callback?next=...` (`window.location.origin` в браузере);
- callback route → `/auth/callback` ([`src/app/auth/callback/route.ts`](../src/app/auth/callback/route.ts)).

## 4. ЮKassa: webhook и return URL

Подробнее: [`docs/YOOKASSA_INTEGRATION.md`](YOOKASSA_INTEGRATION.md).

**Личный кабинет ЮKassa → Интеграция → HTTP-уведомления**

| Параметр | Значение |
|----------|----------|
| URL | `https://<your-domain>/api/webhooks/yookassa` |
| События | `payment.succeeded`, `payment.canceled` |

**return_url** (в env или автоматически):

```
https://<your-domain>/checkout/success
```

Параметр `order_id` добавляется сервером при создании платежа.

### Настройки магазина в ЮKassa (юридические страницы)

Реквизиты ИП заполнены в [`src/lib/legal/seller-info.ts`](../src/lib/legal/seller-info.ts). Перед долгосрочной эксплуатацией рекомендуется юридическая проверка текстов оферты и политики конфиденциальности.

| Поле в ЛК ЮKassa | Значение (production) |
|------------------|------------------------|
| **Адрес сайта** | `https://design-tusovka.vercel.app` |
| **Ссылка на страницу с реквизитами** | `https://design-tusovka.vercel.app/requisites` |
| Публичная оферта | `https://design-tusovka.vercel.app/offer` |
| Политика конфиденциальности | `https://design-tusovka.vercel.app/privacy` |
| Оплата и возврат | `https://design-tusovka.vercel.app/payment-and-refund` |
| Поддержка | `https://design-tusovka.vercel.app/support` |
| Webhook | `https://design-tusovka.vercel.app/api/webhooks/yookassa` |
| Auth callback (Supabase) | `https://design-tusovka.vercel.app/auth/callback` |
| Return URL (оплата) | `https://design-tusovka.vercel.app/checkout/success` |

`NEXT_PUBLIC_SITE_URL` на Vercel должен совпадать с адресом сайта в ЮKassa.

Ссылки также доступны в футере сайта.

### Локальный тест webhook

ЮKassa требует HTTPS. Для local используйте туннель (ngrok, cloudflared):

```
https://<tunnel-host>/api/webhooks/yookassa
```

В `development` IP-проверка webhook отключена; в **production** на Vercel работает allowlist + обязательная GET-верификация платежа.

## 5. SQL patches (должны быть применены в Supabase)

Порядок из [`docs/SUPABASE_CLOUD_BOOTSTRAP.md`](SUPABASE_CLOUD_BOOTSTRAP.md):

| # | Файл | Назначение |
|---|------|------------|
| 1 | `supabase/cloud_bootstrap.sql` | Схема, RLS |
| 2 | `supabase/dev_seed.sql` | Демо-контент |
| 3–4 | patches auth/free content | при необходимости (старый bootstrap) |
| 5 | `supabase/cloud_patch_free_entitlements.sql` | «Получить бесплатно» |
| 6 | `supabase/cloud_patch_admin_role.sql` | `/admin` |
| 7 | `supabase/cloud_patch_cart_orders.sql` | корзина, заказы |
| 8 | `supabase/cloud_patch_yookassa_orders.sql` | поля оплаты, `fulfill_paid_order` |

Проверка:

```sql
select proname from pg_proc
where proname in (
  'claim_free_product',
  'add_to_cart',
  'create_pending_order_from_cart',
  'fulfill_paid_order'
);
```

Admin вручную:

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'ВАШ_EMAIL' limit 1);
```

## 6. Проверка production deploy

### Быстрый smoke (после деплоя)

| # | Сценарий | Ожидание |
|---|----------|----------|
| 1 | Открыть `/` | Главная, карточки каталога |
| 2 | `/catalog` | Список не пустой (после seed) |
| 3 | Sign-up / Sign-in | Вход, редирект в `/profile` |
| 4 | `/profile` | Email, библиотека |
| 5 | `/admin` под admin | Панель доступна |
| 6 | `/admin` без admin | «Нет доступа» |
| 7 | Бесплатный продукт → «Получить бесплатно» | В библиотеке |
| 8 | Платный продукт → корзина → `/cart` | Позиции, итог |
| 9 | Checkout **без** YooKassa env | Заказ создан, «Платежи не настроены» |
| 10 | Checkout **с** YooKassa env | Редирект на страницу ЮKassa |
| 11 | `/checkout/success?order_id=...` | «Платёж подтверждается», доступ **не** выдан |
| 12 | Webhook `payment.succeeded` | Заказ `paid`, продукты в `/profile` |
| 13 | Повторный webhook | Без дублей entitlements |
| 14 | Купленный продукт | Нельзя добавить в корзину |

### Команды CI (локально перед push)

```bash
npm run typecheck
npm run lint
npm run build
```

### Типичные проблемы

| Симптом | Решение |
|---------|---------|
| `Could not find table public.products` | Не применён bootstrap/seed |
| Auth redirect на localhost | Проверить Redirect URLs в Supabase + `NEXT_PUBLIC_SITE_URL` |
| «Платежи не настроены» | Добавить `YOOKASSA_*` на Vercel, redeploy |
| Webhook не приходит | HTTPS URL в ЛК ЮKassa, проверить логи Vercel Functions |
| Оплата прошла, доступа нет | Логи `/api/webhooks/yookassa`, `entitlement_grant_error` в `orders` |

## 7. Секреты и client components

Секретные переменные используются только в модулях с `import "server-only"`:

- `src/lib/supabase/admin.ts` — `SUPABASE_SERVICE_ROLE_KEY`
- `src/lib/payments/yookassa/*` — `YOOKASSA_SECRET_KEY`, `YOOKASSA_SHOP_ID`

Client components получают только публичные `NEXT_PUBLIC_*` через browser client Supabase.

## Связанные документы

- [`docs/SUPABASE_CLOUD_BOOTSTRAP.md`](SUPABASE_CLOUD_BOOTSTRAP.md) — SQL и Supabase
- [`docs/YOOKASSA_INTEGRATION.md`](YOOKASSA_INTEGRATION.md) — оплата и webhook
- [`docs/STAGE_REPORT.md`](STAGE_REPORT.md) — статус этапа
