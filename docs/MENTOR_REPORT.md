# Отчёт для наставника — «Дизайн Тусовка»

**Дата:** 2026-06-19  
**Репозиторий:** [github.com/dmitryjs/design-tusovka](https://github.com/dmitryjs/design-tusovka) (remote подключён, **push ещё не выполнен**)  
**Стек:** Next.js 16, React 19, TypeScript, Tailwind v4, shadcn/ui, Supabase (PostgreSQL + RLS)

---

## 1. Краткое резюме

Проект прошёл этапы **2–4 (частично)**: дизайн-система, полная схема каталога и доступов в БД, RLS + API grants, pgTAP-тесты, dev seed, главная страница с живым каталогом из Supabase. Идёт переход с **local Docker Supabase** на **Supabase Cloud** для ускорения MVP — изменения **в работе, не закоммичены**.

**Не начато:** auth UI, профиль, корзина, оплата, Storage, админка, деплой на Vercel.

---

## 2. Что готово (по этапам)

### Этап 2 — Дизайн-система ✅

- Inter, primary `#094BF5`, shadcn/ui (Button, Card, Badge, Input, Skeleton)
- Layout: header, footer, container
- `npm run typecheck` / `lint` / `build` проходят

### Этап 3.1 — Supabase CLI ✅ (local workflow)

- `supabase` в devDependencies, `config.toml`, npm scripts
- **Сейчас:** local — **optional**; основной режим переводится на Cloud (ADR-024, см. незакоммиченные изменения)

### Этап 3.2 — Схема каталога ✅

Миграция `create_catalog_content_schema`:

- `products` (section / material / task / section_update)
- `sections`, `materials`, `material_chapters`, `tasks`, `task_content`, `task_ai_criteria`
- `tags`, `product_tags`, `section_updates`, `section_update_materials`
- RLS enabled на всех таблицах каталога

### Этап 3.3.1 — Профили и доступ ✅

- `profiles`, `admin_users`, `entitlements`
- RPC: `has_product_access`, `update_my_profile`
- Trigger `handle_new_user` на `auth.users`

### Этап 3.3.2 — RLS каталога ✅

- Публичное чтение published metadata
- `material_chapters` — только с entitlement; preview через `get_material_toc`
- `task_content` / `task_ai_criteria` — free или entitled

### Этап 3.3.3 — RLS-тесты ✅

- 18 pgTAP-сценариев в `supabase/tests/database/01_catalog_rls.test.sql`
- `npm run db:local:test` (требует Docker)

### Этап 3.3.4 — API grants ✅

- `GRANT SELECT` для PostgREST (`anon` / `authenticated`)
- Fix: раздельные policies free/entitled для tasks (anon не вызывает `has_product_access`)

### Dev seed ✅

- `supabase/seed.sql`: 3 секции, 6 материалов, 3 задания, 10 тегов, главы, section update
- Применяется только при **local** `db:local:reset`; в Cloud seed **ещё не залит**

### UI каталога (частично этап 5) ✅

- Главная `/`: карточки sections / materials / tasks из Supabase
- Фильтры (Все / Материалы / Задания / Разделы), поиск по title/description
- Цена: «Бесплатно» / `X ₽`
- Состояния: loading, error, empty
- Server-side data layer: `src/lib/catalog/queries.ts`

### Supabase clients (в работе, не в git) 🔄

- `client.ts` — browser
- `server.ts` — server, anon key, RLS
- `admin.ts` — service role, `server-only`

---

## 3. Git и GitHub

| Параметр | Состояние |
|----------|-----------|
| Локальные коммиты | **8** (от `design: refine base design system` до `feat(ui): add catalog homepage`) |
| Незакоммиченные изменения | Переход на Supabase Cloud (~15 файлов) |
| Remote | `origin` → `https://github.com/dmitryjs/design-tusovka.git` |
| GitHub | Репозиторий **пустой**, `git push` **не выполнялся** |

### История коммитов

```
0928f28 feat(ui): add catalog homepage from Supabase
cddff3d chore(db): add local catalog seed
eee8980 test(db): add RLS verification and API grants
a6cde28 feat(db): add catalog read RLS policies and material toc RPC
a416771 feat(db): add profiles and entitlements foundation
7152758 feat(db): add catalog schema and Supabase CLI fixes
edd58fd chore: add local Supabase workflow
1606597 design: refine base design system
```

---

## 4. Проблемы и негативные моменты

### 4.1 Docker Desktop (критично для local, снято для MVP)

- **Симптом:** Docker Engine зависает на «Starting the Docker Engine…» без конца
- **Следствие:** `npm run supabase:start` и local БД недоступны
- **Реакция:** принято решение перейти на **Supabase Cloud** (ADR-024), Docker оставлен optional
- **Статус:** Cloud-миграция в коде готова, но **нужно** создать cloud project, `supabase link`, `db:push`, заполнить `.env.local`

### 4.2 Каталог на localhost показывал ошибку

- **Причина 1:** пустой или неполный `.env.local`
- **Причина 2:** dev-сервер не перезапускали после правки env
- **Причина 3:** local Supabase не работал из-за Docker
- **Сейчас:** после перехода на Cloud ошибка уйдёт только при корректных ключах и применённых миграциях в cloud

### 4.3 Несколько экземпляров `next dev`

- Запускали dev несколько раз → конфликт порта 3000 / 3001, сообщение «Another next dev server is already running»
- **Решение:** останавливать процесс на порту 3000 перед новым `npm run dev`

### 4.4 Cloud БД, скорее всего, пустая

- Миграции есть в репозитории, но **`supabase link` + `db:push` в cloud не подтверждены**
- Seed только в `seed.sql` для local reset
- **Следствие:** главная может показать «Каталог пока пуст» даже при рабочем API

### 4.5 Незавершённый коммит cloud-перехода

- Изменения Supabase Cloud **не закоммичены** — риск потери контекста при переключении веток
- Рекомендуемый commit: `chore: switch MVP workflow to Supabase Cloud`

### 4.6 GitHub не синхронизирован

- Код только локально; наставник/команда не видят репозиторий без `git push`

### 4.7 Безопасность (под контролем, но важно для наставника)

- ✅ RLS на всех user/catalog таблицах
- ✅ Service role вынесен в `admin.ts` + `server-only`
- ✅ `.env.local` в `.gitignore`
- ⚠️ Раньше в `.env.local` были local demo-ключи — заменены на placeholders; **нужны cloud-ключи от студента**

---

## 5. Что не сделано (по плану MVP)

| Область | Статус |
|---------|--------|
| Auth (email, Google) | ❌ |
| Профиль / настройки | ❌ |
| Страницы товара (material/task/section) | ❌ |
| Корзина (guest + merge) | ❌ |
| Заказы и оплата (ЮKassa и др.) | ❌ |
| Storage (обложки, файлы) | ❌ |
| Админка | ❌ |
| Деплой Vercel + production env | ❌ |
| Seed / контент в Supabase Cloud | ❌ (только SQL-файл local) |

---

## 6. Как запустить сейчас (для проверки наставником)

### Вариант A — Supabase Cloud (рекомендуется)

1. Создать проект в [Supabase Dashboard](https://supabase.com/dashboard)
2. В `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
   SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
   ```
3. `supabase link` → `npm run db:push`
4. Залить seed в cloud (SQL editor или адаптировать `seed.sql`)
5. `npm run dev` → http://localhost:3000

### Вариант B — Local (optional, нужен рабочий Docker)

1. Docker Desktop → Engine running
2. `npm run supabase:start`
3. Local keys в `.env.local` из `npm run supabase:status`
4. `npm run db:local:reset` → `npm run dev`

---

## 7. Проверки качества

| Проверка | Последний результат |
|----------|---------------------|
| `npm run typecheck` | ✅ exit 0 |
| `npm run lint` | ✅ exit 0 |
| `npm run build` | ✅ exit 0 |
| `npm run db:local:test` | ✅ 18/18 (когда Docker работал) |
| E2E / UI tests | ❌ не настроены |
| CI (GitHub Actions) | ❌ нет |

---

## 8. Документация в репозитории

- `docs/PRODUCT.md`, `BUSINESS_RULES.md`, `DATA_MODEL.md`, `ARCHITECTURE.md`
- `docs/DECISIONS.md` (ADR-001–024)
- `docs/INTEGRATIONS.md`, `docs/STAGE_REPORT.md`
- `.cursor/rules/`, `.cursor/skills/`

---

## 9. Рекомендуемые следующие шаги

1. Закоммитить cloud-переход и `git push` на GitHub
2. `supabase link` + `db:push` + seed в cloud
3. Проверить каталог на `/` с cloud env
4. Этап 4: Auth UI + Supabase Auth в client
5. Страницы товара (material / task / section)

---

## 10. Вопросы к наставнику (опционально)

- Подтвердить переход на Cloud вместо обязательного Docker для MVP
- Нужен ли отдельный staging project в Supabase
- Seed в cloud: ручной SQL vs scripted migration
