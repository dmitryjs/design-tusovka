# Отчёт по этапу

## Этап

**Этап 3.1 — Локальная инфраструктура Supabase**

**Статус: завершён**

## Что реализовано

- Проверен Docker: Engine running, WSL2 backend (Docker 29.5.3, Compose v5.1.4).
- Установлен **Supabase CLI** `^2.107.0` как devDependency.
- Выполнены `npx supabase init` и `npx supabase start` — локальный стек поднят в Docker.
- Добавлены npm-скрипты: `supabase:start`, `supabase:stop`, `supabase:status`, `db:reset`.
- Обновлены `docs/ARCHITECTURE.md`, `docs/DECISIONS.md` (ADR-018), `docs/INTEGRATIONS.md`, `.cursor/skills/database-change/SKILL.md`.
- В корневой `.gitignore` добавлены `supabase/.branches` и `supabase/.temp`.
- Проверки проекта и Supabase — успешно.

**Не выполнялось (по scope этапа):** таблицы, миграции, Storage buckets, RLS, авторизация, клиенты `src/lib/supabase/`.

## Изменённые файлы

### Созданы

| Файл | Назначение |
|------|------------|
| `supabase/config.toml` | Конфигурация локального стека (API 54321, DB 54322, PG 17) |
| `supabase/.gitignore` | Игнор `.branches`, `.temp`, локальных env |
| `supabase/snippets/` | Пустая папка CLI (шаблоны SQL — на будущее) |

### Изменены

| Файл | Изменение |
|------|-----------|
| `package.json` | devDependency `supabase`, npm scripts |
| `package-lock.json` | Lockfile после установки CLI |
| `.gitignore` | `supabase/.branches`, `supabase/.temp` |
| `docs/ARCHITECTURE.md` | Структура `supabase/`, локальные порты и команды |
| `docs/DECISIONS.md` | ADR-018: локальная инфраструктура |
| `docs/INTEGRATIONS.md` | Раздел локальной разработки, маппинг env |
| `.cursor/skills/database-change/SKILL.md` | Чек-лист локальной среды |

### Удалены

- Нет

## База данных

Локальный PostgreSQL 17 в Docker (стандартный образ Supabase). Пользовательские таблицы, RLS и миграции **не создавались**.

## Переменные окружения

`.env.example` без изменений. Для локальной работы после `supabase start` значения копируются из `npm run supabase:status` в `.env.local`:

| Переменная | Источник в `supabase status` |
|------------|------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL / API_URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret key |

Ключи, JWT secret, пароли и connection strings **не фиксируются** в этом отчёте и не должны попадать в git.

## Зависимости

| Пакет | Версия | Тип |
|-------|--------|-----|
| `supabase` | `^2.107.0` | devDependency |

## Проверки

### Docker

| Команда | Результат | Код |
|---------|-----------|-----|
| `docker --version` | 29.5.3 | 0 |
| `docker compose version` | v5.1.4 | 0 |

### Supabase

| Команда | Результат | Код |
|---------|-----------|-----|
| `npx supabase init` | Успех | 0 |
| `npx supabase start` | Успех (первый запуск, загрузка образов) | 0 |
| `npx supabase status` | Стек running; Studio на `http://127.0.0.1:54323` | 0 |
| `npm run supabase:status` | Успех | 0 |

Остановленные по умолчанию сервисы: `imgproxy`, `pooler` (pooler disabled в `config.toml`) — ожидаемо.

### Проект

| Команда | Результат | Код |
|---------|-----------|-----|
| `npm run typecheck` | Успех | 0 |
| `npm run lint` | Успех | 0 |
| `npm run build` | Успех | 0 |

### Git после этапа

| Команда | Результат |
|---------|-----------|
| `git status` | Изменения не закоммичены (см. diff) |
| `git diff` | 8 изменённых файлов + untracked `supabase/` |

## Версии среды

| Компонент | Версия |
|-----------|--------|
| Node.js | v24.12.0 |
| npm | 11.6.2 |
| Docker | 29.5.3 |
| Docker Compose | v5.1.4 |
| Supabase CLI | 2.107.0 |
| PostgreSQL (локально) | 17 |

## npm scripts

| Скрипт | Команда |
|--------|---------|
| `supabase:start` | `supabase start` |
| `supabase:stop` | `supabase stop` |
| `supabase:status` | `supabase status` |
| `db:reset` | `supabase db reset` |

## Локальные endpoints (без секретов)

| Сервис | URL |
|--------|-----|
| API | `http://127.0.0.1:54321` |
| REST | `http://127.0.0.1:54321/rest/v1` |
| GraphQL | `http://127.0.0.1:54321/graphql/v1` |
| PostgreSQL | `127.0.0.1:54322` |
| Studio | `http://127.0.0.1:54323` |
| Mailpit | `http://127.0.0.1:54324` |

## .gitignore

- `supabase/.branches`, `supabase/.temp` — в корневом `.gitignore` и `supabase/.gitignore`.
- `supabase/config.toml` — **коммитится**.
- `supabase/migrations/` — появится на этапе 3.2, коммитится.

## Что проверено вручную

- Docker Engine доступен из PowerShell.
- `supabase start` завершился без ошибок после загрузки образов.
- `supabase status` возвращает running-сервисы и локальные URL.
- `.temp` и `.branches` игнорируются git.

## Что не проверено

- `npm run db:reset` (нет миграций и `seed.sql`).
- `npm run supabase:stop` / повторный `start` после stop.
- Интеграция Next.js с Supabase (этап 4+).
- Облачный Supabase-проект.

## Риски

- Первый `supabase start` долгий из‑за pull образов (~6+ GB).
- `supabase status` может логировать timeout PostHog telemetry — на работу стека не влияет.
- `build` может падать офлайн из‑за `next/font/google` (Inter) — как на этапе 3.1 (блокер).

## Неопределённости

- Нет.

## Откат

1. `npm run supabase:stop` — остановить контейнеры.
2. Удалить `supabase/`, откатить изменения в `package.json`, docs, `.gitignore`.
3. `npm uninstall supabase`.

## Следующий этап

**Этап 3.2** — SQL-миграции по `DATA_MODEL.md`, RLS, Storage buckets (`public-media`, `private-files`).

## Рекомендуемый коммит

```
chore: add local Supabase CLI and Docker workflow
```
