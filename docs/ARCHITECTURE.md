# Architecture

Архитектура платформы «Дизайн Тусовка». Синхронизировано с этапом 1.1.

## Обзор

```mermaid
flowchart TB
  subgraph client [Client]
    Browser[Browser - RU locale]
    LocalCart[LocalStorage guest cart]
  end

  subgraph vercel [Vercel]
    Next[Next.js App Router]
    SA[Server Actions / API Routes]
  end

  subgraph supabase [Supabase]
    Auth[Auth]
    DB[(PostgreSQL + RLS)]
    Storage[Storage public + private]
  end

  subgraph external [External]
    Google[Google OAuth]
    YK[ЮKassa + СБП QR]
    Crypto[Crypto TBD]
    Polza[Polza AI]
    Email[Email TBD]
    Metrica[Яндекс Метрика]
  end

  Browser --> Next
  LocalCart -->|merge on login| SA
  Next --> SA
  SA --> Auth
  SA --> DB
  SA --> Storage
  Auth --> Google
  SA --> YK
  SA --> Crypto
  SA --> Polza
  SA --> Email
  Browser -->|after consent| Metrica
  YK -->|webhook| SA
  Crypto -->|webhook| SA
```

## Структура репозитория (фактическая, этап 3.3.2)

```
src/
  app/
    globals.css            # Tailwind v4 + shadcn tokens
    layout.tsx             # ru, Inter, header/main/footer
    page.tsx               # Каталог (Supabase Cloud)
  components/
    layout/
    ui/                    # shadcn
  lib/
    utils.ts
    supabase/
      env.ts               # public env (URL + anon)
      client.ts            # browser / client components
      server.ts            # server RLS reads (anon key)
      admin.ts             # server-only service role
    catalog/
  types/
    database.types.ts      # supabase gen types (public)
supabase/
  config.toml
  migrations/
  tests/database/        # pgTAP RLS tests (этап 3.3.3)
  seed.sql
components.json
docs/
.cursor/
```

### Планируемая структура (этапы 4+)

```
src/app/
  (auth)/
  (app)/library|cart|checkout|profile|materials|assignments|sections
  (admin)/
  api/webhooks/
src/lib/supabase|payments|polza|cart|access|storage/
```

## Схема БД

### Каталог (этап 3.2)

Миграция `create_catalog_content_schema`: **`products`** + расширения, RLS enabled.

### Профили и доступ (этап 3.3.1)

`profiles`, `admin_users`, `entitlements`, `has_product_access`, `update_my_profile`, trigger на `auth.users`.

### Каталог RLS (этап 3.3.2)

Миграция `create_catalog_read_policies`:

- SELECT policies для published metadata (`products`, `sections`, `materials`, `tasks`, `tags`, …)
- `material_chapters` — только с `has_product_access` (authenticated)
- `task_content` / `task_ai_criteria` — free task или entitlement
- RPC `get_material_toc` — оглавление без `content`

### RLS tests (этап 3.3.3)

`supabase test db --local` → `npm run db:test`. Файл `supabase/tests/database/01_catalog_rls.test.sql`.

### API grants (этап 3.3.4)

Миграция `20260618195500_grant_api_access_for_rls.sql`:

- `GRANT USAGE ON SCHEMA public` + `SELECT` на каталог для `anon`/`authenticated`
- `SELECT` на `profiles`, `entitlements`, `material_chapters` — только `authenticated`
- `admin_users` без client grants; client writes на каталог/profiles/entitlements — нет
- RPC: `has_product_access` — только `authenticated`; task policies разделены на free/entitled (anon не читает `entitlements` через RLS)

**Команды (cloud):** `db:push` | `db:types` | `npm run dev`.

**Optional local (Docker):** `supabase:*` | `db:local:reset` | `db:local:test` | `db:types:local`.

Корзина, заказы, платежи, Storage, auth UI — **не созданы**.

См. `DATA_MODEL.md`, ADR-019–024.

## Supabase Cloud (основной MVP-режим)

| Компонент | Источник |
|-----------|----------|
| PostgreSQL + RLS | Supabase Cloud |
| Auth | Supabase Cloud (этап 4+) |
| Storage | Supabase Cloud (этап 3+) |
| Env | `.env.local` — см. `INTEGRATIONS.md` |

### Клиенты (`src/lib/supabase/`)

| Модуль | Ключ | Где использовать |
|--------|------|------------------|
| `client.ts` | `NEXT_PUBLIC_*` | Client components, browser |
| `server.ts` | `NEXT_PUBLIC_*` (anon) | Server Components, RLS-aware reads |
| `admin.ts` | `SUPABASE_SERVICE_ROLE_KEY` | Server-only: webhooks, grants, admin (этап 4+) |

Service role **не** импортируется в client components.

### Запуск без Docker

```bash
npm run dev
```

Требуется `.env.local` с ключами Supabase Cloud. Миграции: `supabase link` → `npm run db:push`.

## Локальная разработка Supabase (optional)

| Компонент | Локальный адрес |
|-----------|-----------------|
| API (Project URL) | `http://127.0.0.1:54321` |
| PostgreSQL | `127.0.0.1:54322` |
| Studio | `http://127.0.0.1:54323` |
| Mailpit (Auth email) | `http://127.0.0.1:54324` |

**Требования:** Docker Desktop (WSL2 backend на Windows). **Не обязателен** для `npm run dev` при работе с Cloud.

**Команды:** `npm run supabase:start` | `db:local:reset` | `db:local:test`.

## Ключевые потоки

### Гостевая корзина → merge

1. Гость: `CartItem[]` в localStorage.
2. Login: Server Action merge → dedupe → sync to DB `cart_items`.
3. Правила CART-* на сервере при каждом изменении.

### Доступ к контенту

```mermaid
flowchart TD
  Request[Запрос контента] --> AuthZ{Авторизован?}
  AuthZ -->|Нет| Preview[Описание + оглавление]
  AuthZ -->|Да| Grant{AccessGrant или бесплатный?}
  Grant -->|Да| Full[Полный контент + signed URLs]
  Grant -->|Нет| Preview
```

### Раздел: цена с вычетом

При добавлении раздела в checkout сервер:

1. Список материалов раздела.
2. Сумма `OrderItem.price_rub` уже оплаченных пользователем материалов из этого раздела.
3. `section.price_rub - paid_sum` (min 0).

### Оплата ручной проверки

Отдельный от корзины маршрут checkout на финальном шаге `UF-11`; тот же webhook-паттерн ADR-003.

### Файлы

| Тип | Bucket | Доступ |
|-----|--------|--------|
| Обложки | public-media | CDN public |
| Вложения материалов | по политике | public или signed |
| Решения, feedback | private-files | signed после ACCESS-11 |

## Дизайн (токены)

- `--primary: #094BF5`
- Font: Inter (next/font)
- `--radius-card: 16px`
- `--radius-button: 12px`
- Badge: `rounded-full`

## Безопасность

См. `.cursor/rules/security.mdc` и `BUSINESS_RULES.md` SECU-*.

## Деплой

- Vercel + Supabase cloud
- GitHub — инициализация перед этапом 2
- Env в Vercel Dashboard

## Связанные документы

- `DATA_MODEL.md`, `DECISIONS.md`, `INTEGRATIONS.md`, `PRODUCT.md`
