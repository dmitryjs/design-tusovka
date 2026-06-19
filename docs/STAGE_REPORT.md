# Отчёт по этапу

## Этап

**Admin-lite: управление контентом MVP**

**Статус: завершён**

## Результат

Пользователь с ролью `admin` может открыть `/admin` и управлять материалами, заданиями, разделами и тегами без SQL. Гость перенаправляется на вход, обычный пользователь видит 403.

## Добавленные маршруты

| Маршрут | Назначение |
|---------|------------|
| `/admin` | Обзор и ссылки |
| `/admin/products` | Список материалов и заданий |
| `/admin/products/new` | Создание продукта |
| `/admin/products/[id]` | Редактирование продукта |
| `/admin/sections` | Список и CRUD разделов |
| `/admin/tags` | Список и CRUD тегов |

## Архитектура

| Слой | Файлы |
|------|-------|
| Auth | `src/lib/auth/session.ts`, `src/lib/auth/admin.ts` |
| Бизнес-логика | `src/lib/admin/products.ts`, `sections.ts`, `tags.ts`, `validation.ts` |
| Server actions | `src/app/actions/admin/*` |
| UI | `src/components/admin/*` |

Запись в БД — через `SUPABASE_SERVICE_ROLE_KEY` (server-only) после `assertAdmin()`. RLS для публичного каталога не менялся.

## SQL patch

**Файл:** `supabase/cloud_patch_admin_role.sql`

**Содержимое:**

- enum `profile_role` (`user`, `admin`);
- колонка `profiles.role` default `user`;
- trigger: пользователь не может сменить `role` сам;
- обновление `handle_new_user` для `role = user`.

**Миграция local:** `supabase/migrations/20260618230000_profiles_admin_role.sql`

### Назначить admin вручную

В Supabase SQL Editor (после patch), подставьте email:

```sql
update public.profiles
set role = 'admin'
where id = (
  select id from auth.users where email = 'you@example.com' limit 1
);
```

## Таблицы (чтение / запись admin)

| Таблица | Операции |
|---------|----------|
| `profiles` | read (`role` для проверки) |
| `products` | read, insert, update |
| `materials`, `material_chapters` | read, insert, update, delete (главы) |
| `tasks`, `task_content` | read, insert, update, upsert |
| `sections` | read, insert, update |
| `tags`, `product_tags` | read, insert, update, replace tags |

## Проверки

| Команда | Результат |
|---------|-----------|
| `npm run typecheck` | ожидается 0 |
| `npm run lint` | ожидается 0 |
| `npm run build` | ожидается 0 |

## Ручные сценарии

1. Выполнить `cloud_patch_admin_role.sql`.
2. Назначить себе `role = admin` через SQL.
3. Гость → `/admin` → redirect на sign-in.
4. Обычный user → `/admin` → «Нет доступа».
5. Admin → создать бесплатный материал (`published`, 0 ₽) → виден на главной.
6. Admin → платный материал → на сайте preview без текста глав.
7. Admin → редактировать материал → изменения на сайте.
8. Admin → создать тег и раздел.
9. `SUPABASE_SERVICE_ROLE_KEY` задан в `.env.local`.

## Не реализовано

Оплата, корзина, Storage, upload, rich editor, AI, ручная проверка, удаление продуктов.
