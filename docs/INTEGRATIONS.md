# Integrations

Внешние интеграции. API-поля фиксируются по **официальной документации** на этапах реализации.

## Локальная разработка (этап 3.1, **optional**)

| Параметр | Значение |
|----------|----------|
| CLI | `supabase` devDependency |
| Запуск | `npm run supabase:start` (Docker, **не обязателен** для MVP) |
| Статус | `npm run supabase:status` |
| Studio (local) | `http://127.0.0.1:54323` |
| API URL (local) | `http://127.0.0.1:54321` |

## Supabase Cloud (основной MVP-режим)

| Параметр | Где взять |
|----------|-----------|
| Project URL | Dashboard → Project Settings → API |
| anon key | Dashboard → API → `anon` / publishable |
| service role | Dashboard → API → `service_role` (**server-only**) |

Скопировать в `.env.local` (не коммитить):

- `NEXT_PUBLIC_SUPABASE_URL` — Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon / publishable key (client + server RLS reads)
- `SUPABASE_SERVICE_ROLE_KEY` — service role (только server routes/actions; обходит RLS)

**Не публиковать** ключи в git, документации или отчётах.

### CLI для облака

| Команда | Назначение |
|---------|------------|
| `supabase link` | Привязка к cloud project (один раз) |
| `npm run db:push` | Применить миграции из `supabase/migrations/` |
| `npm run db:types` | Типы из linked project |

### Optional local (Docker)

| Команда | Назначение |
|---------|------------|
| `npm run supabase:start` | Локальный стек |
| `npm run db:local:reset` | Миграции + seed локально |
| `npm run db:local:test` | pgTAP RLS tests |
| `npm run db:types:local` | Типы из local DB |

Основной запуск приложения: `npm run dev` — **без Docker**.

## Сводная таблица

| Сервис | Назначение | Этап | Статус |
|--------|------------|------|--------|
| Supabase Auth | email, Google OAuth, reset password | 4 | Утверждено |
| Supabase PostgreSQL | Данные, RLS | 3 | Утверждено |
| Supabase Storage | Файлы (см. ниже) | 3+ | Утверждено |
| Google OAuth | Вход | 4 | Через Supabase |
| ЮKassa | Карты и платежи | 10 | API на этапе 10 |
| СБП | QR-код | 10 | Через ЮKassa (по документации) |
| Криптопроцессинг | USDT, авто-подтверждение | 11 | **Провайдер TBD** |
| Polza AI | AI-проверка заданий | 12 | API на этапе 12 |
| Email-провайдер | Транзакционные письма | 16 | **Провайдер TBD** |
| Яндекс Метрика | Внешняя аналитика, Вебвизор | 17 | После cookie consent |
| Vercel | Хостинг | 20 | Утверждено |
| GitHub | Репозиторий | до этапа 2 | Инициализировать перед этапом 2 |

## Supabase Storage (утверждено)

| Назначение | Bucket |
|------------|--------|
| Обложки, изображения | public |
| PDF, вложения материалов | public или private по типу |
| Файлы решений, feedback | private |

Приватные файлы: signed URL только после серверной проверки `AccessGrant`.

### Env (имена без значений)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Платежи — ЮKassa / СБП (этап 10)

### Утверждено

- Оплата после auth + email confirmed.
- Базовые цены в **рублях**.
- Создание платежа на сервере; подтверждение webhook.
- СБП — **по QR-коду**.
- ИП на УСН «Доходы»; чеки 54-ФЗ через решение ЮKassa — **конфигурация по документации на этапе 10**.
- При задержке webhook — перепроверка статуса на сервере.
- Повторная выдача доступа при сбое; ошибка в админке.

### Зафиксировать на этапе 10

- REST API, webhook format, env names (shopId, secretKey и т.д. по документации).

## Криптопроцессинг (этап 11)

### Утверждено

- Автоматическое подтверждение (webhook).
- UI: рублевая цена + USDT по текущему курсу; курс **фиксируется** на срок счёта.

### TBD

- **Конкретный провайдер** и его API.

## Polza AI (этап 12)

### Утверждено (продукт)

- 1 PDF ≤20 МБ или до 10 PNG/JPG ≤10 МБ.
- Критерии задания списком без весов.
- Результат: разбор, итог, рекомендации без баллов.
- Техошибка не списывает попытку.

### Зафиксировать на этапе 12

- API URL, auth, request/response schema.
- Env: имя ключа API (по документации Polza).

## Email (этап 16)

### Утверждённые письма

- Регистрация (частично Supabase Auth)
- Подтверждение email (Supabase)
- Восстановление пароля (Supabase)
- Успешная покупка
- Ошибка оплаты
- Готовая проверка
- Требуется доработка

### TBD

- **Провайдер** для кастомных транзакционных шаблонов (покупка, проверки).

## Яндекс Метрика (этап 17)

- Запуск **только после** cookie consent.
- Ecommerce: purchase после серверного подтверждения.
- События: см. `ANALYTICS.md`.

- Загрузка через `Analytics` + `NEXT_PUBLIC_ANALYTICS_ENABLED` и cookie consent.

- `NEXT_PUBLIC_YANDEX_METRIKA_ID`
- `NEXT_PUBLIC_ANALYTICS_ENABLED`

## Webhooks

| Источник | Назначение |
|----------|------------|
| ЮKassa | Статус платежа заказа |
| Криптопроцессинг | Статус крипто-платежа |
| (оплата ручной проверки) | Тот же паттерн на этапе 13 |

Общие требования: подпись, `WebhookEvent`, идемпотентность, 2xx.

## TBD (интеграции)

- Криптопроцессинг — провайдер
- Email-провайдер
- Реальные ключи и аккаунты всех сервисов
