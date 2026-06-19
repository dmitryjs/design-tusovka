# Decisions

Архитектурные и продуктовые решения (ADR).

---

## ADR-001: Стек приложения

**Статус:** Принято

**Решение:** Next.js App Router, React, TypeScript strict, Tailwind, shadcn/ui, Supabase, Vercel, GitHub. Prisma — только при явной необходимости.

---

## ADR-002: Аутентификация через Supabase Auth

**Статус:** Принято

**Решение:** Email+пароль, Google OAuth, восстановление пароля, email confirmation. Identity linking для одного email.

---

## ADR-003: Подтверждение оплаты через webhook

**Статус:** Принято

**Решение:** `AccessGrant` в webhook-обработчике. UI «Платёж подтверждается» при задержке; повторная выдача при сбое.

---

## ADR-004: Расчёт цены на сервере

**Статус:** Принято

**Решение:** Цены в рублях в БД; snapshot в `OrderItem`. Для раздела — вычет фактически оплаченных материалов. Промокоды и подписки отсутствуют.

---

## ADR-005: Дизайн-система

**Статус:** Принято (обновлено после этапа 2)

**Решение:**

- shadcn/ui 4 + Tailwind CSS v4; токены в `src/app/globals.css`
- Полная спецификация: `docs/DESIGN_SYSTEM.md`
- Primary `#094BF5`, шрифт **Inter**; только светлая тема
- Радиусы: элементы управления **8 px**, карточки **12 px**, панели/modal **16 px**, бейджи **999 px**
- Кнопка default: 14 px / 500, padding 12×8 px, radius 8 px
- Минималистичный SaaS-стиль; карточки с границей без тени

---

## ADR-006: Платёжные провайдеры

**Статус:** Принято

**Решение:** ЮKassa + СБП QR (этап 10); криптопроцессинг с USDT и фиксацией курса (этап 11, **провайдер TBD**). ИП УСН «Доходы»; чеки 54-ФЗ через ЮKassa.

---

## ADR-007: AI-проверка Polza AI

**Статус:** Принято

**Решение:** Бесплатно, 1 попытка/задание/пользователь; форматы и критерии — см. `BUSINESS_RULES.md` TASK-03–05.

---

## ADR-008: Яндекс Метрика

**Статус:** Принято

**Решение:** Метрика + Вебвизор после cookie consent; внутренняя аналитика в админке.

---

## ADR-009: Товарная модель

**Статус:** Принято (этап 1.1)

**Решение:** Три типа товаров: Material, Assignment (вне разделов), Section (набор материалов + обновления). Задание ≠ материал в разделе.

---

## ADR-010: Бессрочный доступ

**Статус:** Принято

**Решение:** Покупка даёт бессрочный доступ; обновления купленных материалов бесплатны; новые материалы в разделе — платное обновление раздела.

---

## ADR-011: Бесплатные заказы

**Статус:** Принято

**Решение:** Заказ 0 ₽ через корзину; CTA «Получить бесплатно». Бесплатное задание в библиотеке — после первой отправки.

---

## ADR-012: Ручная проверка

**Статус:** Принято

**Решение:** Оплата на шаге отправки, не в корзине; очередь; в MVP — владелец в админке; версии проверок; 1 повторная отправка.

---

## ADR-013: Supabase Storage

**Статус:** Принято

**Решение:** Публичные и приватные bucket; приватные — signed URL после server-side auth.

---

## ADR-014: Админка MVP

**Статус:** Принято

**Решение:** Один администратор (владелец); без ролей и кабинета эксперта; блочный редактор материалов.

---

## ADR-015: Git

**Статус:** Принято

**Решение:** Инициализировать репозиторий **перед этапом 2**.

---

## ADR-016: Вне MVP

**Статус:** Принято

**Решение:** Нет подписок, промокодов, избранного, прогресса, чек-инов, стриков, истории изменений цен/материалов в админке.

---

## ADR-017: Инициализация фронтенда (этап 2)

**Статус:** Принято  
**Дата:** 2026-06-18

**Контекст:** Нужен технический каркас без бизнес-логики.

**Решение:**

| Параметр | Значение |
|----------|----------|
| Package manager | **npm** |
| Framework | **Next.js 16.2.9** App Router |
| Исходники | **`src/`** directory |
| React | **19.2.4** |
| TypeScript | **^5** (strict) |
| Tailwind CSS | **^4** (`@tailwindcss/postcss`) |
| UI | **shadcn/ui 4.11.0** (CLI), стиль `base-nova`, `@base-ui/react` |
| Шрифт | **Inter** (`next/font/google`, subsets latin + cyrillic) |
| Dark mode | **Отключён** в MVP (только светлая тема в `globals.css`) |
| React Compiler | **Не включён** |
| Alias | `@/*` → `src/*` |
| Инициализация | `create-next-app@16.2.9` в `next-tmp/`, перенос в корень (имя папки проекта не URL-safe для npm) |

**Последствия:**

- Нет `tailwind.config.*` — конфигурация через CSS `@theme` (Tailwind v4).
- Демо-страница на `src/app/page.tsx` заменится каталогом на этапе 5.
- `.env.example` в корне; `.env*` в `.gitignore` с исключением `!.env.example`.

---

## ADR-018: Локальная инфраструктура Supabase (этап 3.1)

**Статус:** Принято  
**Дата:** 2026-06-18

**Контекст:** Нужен локальный стек Supabase для миграций, RLS и разработки без облачного проекта на ранних этапах.

**Решение:**

| Параметр | Значение |
|----------|----------|
| CLI | **supabase** `^2.107.0` как **devDependency** (вызов через `npx` / npm scripts) |
| Инициализация | `supabase init` → `config.toml`, `project_id = Design_Tusovka` |
| Runtime | **Docker** + Docker Compose (локальный стек через `supabase start`) |
| PostgreSQL | major version **17** (в `config.toml`) |
| Порты | API **54321**, DB **54322**, Studio **54323**, Mailpit **54324** |
| npm scripts | `supabase:start`, `supabase:stop`, `supabase:status`, `db:reset` |
| Git | `supabase/config.toml` в репозитории; `supabase/.branches`, `supabase/.temp` в `.gitignore` |
| Секреты | Только в `.env.local`; значения из `supabase status`, не в документации и отчётах |

**Не входит в 3.1:** миграции, таблицы, RLS, Storage buckets, клиенты в `src/lib/supabase/`.

**Последствия:**

- Этап 3.2 добавляет `supabase/migrations/` и схему по `DATA_MODEL.md`.
- **ADR-024:** основной MVP-режим переведён на Supabase Cloud; local Docker — optional.

---

## ADR-024: Supabase Cloud как основной MVP-режим

**Статус:** Принято  
**Дата:** 2026-06-19

**Контекст:** Local Supabase через Docker блокирует разработку; для ускоренного MVP нужен cloud-first workflow без обязательного Docker.

**Решение:**

| Параметр | Значение |
|----------|----------|
| Основная БД | **Supabase Cloud** |
| Запуск UI | `npm run dev` — без Docker |
| Env | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| Клиенты | `client.ts` (browser), `server.ts` (anon, RLS), `admin.ts` (service role, `server-only`) |
| Миграции | `supabase link` + `npm run db:push` |
| Типы | `npm run db:types` (`--linked`) |
| Local optional | `supabase:start`, `db:local:*` — для pgTAP и seed |

**Безопасность:** RLS не отключается; service role только server-side; секреты не в git.

**Не менялось:** SQL-миграции, RLS policies, бизнес-логика каталога.

---

## ADR-019: Схема каталога и контента (этап 3.2)

**Статус:** Принято  
**Дата:** 2026-06-18

**Контекст:** Нужна первая миграция БД без коммерции, auth UI и Storage.

**Решение:**

| Параметр | Значение |
|----------|----------|
| Миграция | `20260618185410_create_catalog_content_schema.sql` |
| Модель товара | Единая таблица **`products`** + расширения по `kind` |
| Задания | Таблица **`tasks`** (не `assignments`) |
| Цена | **`price_kopecks`** в `products`; бесплатно = `0` |
| Контент материала | **`material_chapters`** (jsonb blocks) |
| Критерии AI | **`task_ai_criteria`** (отдельные строки с position) |
| Теги | **`tags`** + **`product_tags`** |
| Slug | lowercase, `[a-z0-9-]+`, unique |
| RLS | **ENABLED** на всех таблицах каталога; **политики — этап 3.3** |
| Seed | `supabase/seed.sql` пустой |
| Types | `npm run db:types` → `src/types/database.types.ts` |

**Не входит:** entitlements, cart, orders, payments, reviews, profiles, admin tables, Storage buckets, RLS policies.

**Последствия:**

- Этап 3.3 добавляет RLS для публичного каталога.
- Заказы и `access_grants` ссылаются на `products.id` на следующих этапах.

---

## ADR-020: Профили и фундамент доступов (этап 3.3.1)

**Статус:** Принято  
**Дата:** 2026-06-18

**Контекст:** Нужны профиль пользователя и модель доступа к товарам до заказов и каталоговых RLS.

**Решение:**

| Параметр | Значение |
|----------|----------|
| Миграция | `20260618191440_create_profiles_and_access_foundation.sql` |
| Профиль | `profiles` ← `auth.users`; email не дублируется |
| Регистрация | Trigger `on_auth_user_created` / `handle_new_user()` (SECURITY DEFINER) |
| Админ | `admin_users` отдельно от `profiles`; без клиентских policies |
| Доступ | `entitlements` с `entitlement_source_type`; unique по источнику |
| Проверка доступа | `has_product_access(product_id)` — только `auth.uid()`, invoker |
| Профиль RPC | `update_my_profile(...)` — SECURITY DEFINER, только authenticated |
| Клиент | Прямой insert/update/delete profiles и entitlements **запрещён** |

**Не входит:** каталоговые RLS, публичное чтение, orders, cart, payments, Storage, auth UI.

**Последствия:**

- Этап 3.3.2 — RLS для published каталога.
- Выдача entitlements — server/webhook на этапах заказов.

---

## ADR-021: Catalog RLS и безопасное публичное чтение (этап 3.3.2)

**Статус:** Принято  
**Дата:** 2026-06-18

**Контекст:** Каталог заблокирован RLS без policies; нужно публичное чтение metadata без утечки платного контента.

**Решение:**

| Параметр | Значение |
|----------|----------|
| Миграция | `20260618193254_create_catalog_read_policies.sql` |
| Публичный read | `products` и расширения только при `status = published` |
| `material_chapters` | **Нет** public SELECT; full row только при `has_product_access` |
| Оглавление | `get_material_toc(uuid)` — без `content`, SECURITY DEFINER |
| Task content | Free (`price_kopecks = 0`) или `has_product_access` |
| Client writes | **Нет** INSERT/UPDATE/DELETE policies на каталог |

**Риск утечки:** SELECT на `material_chapters` без entitlement открывает `content` — поэтому отдельная policy и TOC-RPC.

**Не входит:** Storage, orders, cart, UI, seed.

---

## ADR-022: RLS verification tests (этап 3.3.3)

**Статус:** Принято  
**Дата:** 2026-06-18

**Контекст:** RLS policies из 3.3.2 нужно автоматически проверять на утечки контента.

**Решение:**

| Параметр | Значение |
|----------|----------|
| Runner | **Supabase CLI** `supabase test db --local` (pgTAP / pg_prove) |
| Путь | `supabase/tests/database/*.test.sql` |
| npm script | `db:test` |
| Данные | Только внутри `BEGIN…ROLLBACK` теста |
| Grants в тесте | **Нет** — grants только в миграциях (3.3.4) |

**Покрытые сценарии:** published metadata, draft/hidden deny, toc, chapters entitlement, free/paid tasks, profile/entitlement isolation, catalog write deny.

**Не покрыто:** Storage, admin writes, performance.

---

## ADR-023: API grants для RLS через PostgREST (этап 3.3.4)

**Статус:** Принято  
**Дата:** 2026-06-18

**Контекст:** RLS policies из 3.3.2 не работают через Supabase API без table-level `GRANT`; тесты 3.3.3 выявили gap (временные grants в setup).

**Решение:**

| Параметр | Значение |
|----------|----------|
| Миграция | `20260618195500_grant_api_access_for_rls.sql` |
| Принцип | Минимальные `SELECT` grants + RLS как второй слой |
| `anon` + `authenticated` | Каталог metadata + `task_content` / `task_ai_criteria` |
| `authenticated` only | `profiles`, `entitlements`, `material_chapters` |
| Без grants | `admin_users`; все client writes |
| RPC | `has_product_access` — `REVOKE` от `anon` |
| Policy fix | `task_content` / `task_ai_criteria` — две политики (free vs entitled), чтобы `anon` не вызывал `has_product_access` (нет SELECT на `entitlements`) |

**Почему GRANT + RLS:** PostgREST проверяет privileges роли до RLS; без `GRANT SELECT` клиент получает `permission denied`, а не пустой результат policy.

**Тесты:** setup больше не выдаёт `GRANT SELECT ON ALL TABLES`; `anon` на `material_chapters` — `throws_ok(42501)`.

**Не входит:** Storage, UI, auth pages, cart, orders, payments.

---

## Ожидающие решения (TBD)

| Тема | Когда |
|------|-------|
| Криптопроцессинг (провайдер) | Этап 11 |
| Email-провайдер | Этап 16 |
| Конкретные цены товаров и ручной проверки | Контент |
| Юридические тексты | Этап 18 |
| Конфигурация чеков 54-ФЗ в ЮKassa | Этап 10 |
| Ключи и аккаунты интеграций | Соответствующие этапы |
