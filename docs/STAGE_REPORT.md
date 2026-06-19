# Отчёт по этапу

## Этап

**Запуск каталога на Supabase Cloud + bootstrap SQL**

**Статус: завершён, закоммичено**

## Результат

Главная `/` **загружается из Supabase Cloud**: карточки sections / materials / tasks, фильтры, поиск, цены. Ошибка `Could not find the table 'public.products'` устранена применением SQL в Cloud.

## SQL-файлы (выполнены в Supabase SQL Editor)

| Порядок | Файл | Назначение |
|---------|------|------------|
| 1 | `supabase/cloud_bootstrap.sql` | Схема, RLS, grants (migrations 3.2–3.3.4) |
| 2 | `supabase/dev_seed.sql` | Демо-контент (15 карточек на главной) |

Инструкция: `docs/SUPABASE_CLOUD_BOOTSTRAP.md`

## Supabase Cloud (основной режим)

- Env в `.env.local` (не в git): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- Клиенты: `src/lib/supabase/client.ts`, `server.ts`, `admin.ts`
- Docker/local — optional (`db:local:*`)

## Демо-контент

3 секции, 8 материалов, 4 задания, 12 тегов; уровни junior/middle/senior; free и paid.

## Проверки перед commit

| Команда | Exit code |
|---------|-----------|
| `npm run typecheck` | 0 |
| `npm run lint` | 0 |
| `npm run build` | 0 |
| `.env.local` в git | нет (`.gitignore`) |
| Секреты в репозитории | не обнаружены |

## Commit

```
chore: bootstrap cloud catalog data
```

## Изменённые файлы (в commit)

### SQL и скрипты

- `supabase/cloud_bootstrap.sql`
- `supabase/dev_seed.sql`
- `scripts/build-cloud-bootstrap.mjs`

### Supabase clients

- `src/lib/supabase/env.ts`, `client.ts`, `server.ts`, `admin.ts`

### Конфиг и docs

- `package.json`, `package-lock.json`
- `.env.example`
- `docs/SUPABASE_CLOUD_BOOTSTRAP.md`, `docs/MENTOR_REPORT.md`
- `docs/ARCHITECTURE.md`, `docs/INTEGRATIONS.md`, `docs/DECISIONS.md` (ADR-024)
- `.cursor/skills/*`, `.cursor/rules/security.mdc`

### UI (только сообщения empty/error, без новых фич)

- `src/components/catalog/catalog-home.tsx`

## Следующий шаг (не начинать здесь)

Auth UI, страницы товара, `git push` на GitHub.
