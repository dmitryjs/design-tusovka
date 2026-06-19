# Supabase Cloud — bootstrap каталога

Инструкция для запуска MVP-каталога «Дизайн Тусовка» в **Supabase Cloud** без Docker.

## Порядок запуска SQL

| Шаг | Файл | Когда |
|-----|------|-------|
| **1** | [`supabase/cloud_bootstrap.sql`](../supabase/cloud_bootstrap.sql) | Первым — схема, RLS, grants (включая доступ к бесплатному контенту) |
| **2** | [`supabase/dev_seed.sql`](../supabase/dev_seed.sql) | Вторым — демо-контент |
| **3** | [`supabase/cloud_patch_free_content_rls.sql`](../supabase/cloud_patch_free_content_rls.sql) | **Только если** bootstrap выполнялся **до** обновления RLS (см. ниже) |
| **4** | [`supabase/cloud_patch_auth_profiles.sql`](../supabase/cloud_patch_auth_profiles.sql) | Для auth: trigger профиля + `profiles_update_own` (если bootstrap старый) |
| **5** | [`supabase/cloud_patch_free_entitlements.sql`](../supabase/cloud_patch_free_entitlements.sql) | Для «Получить бесплатно» и библиотеки в `/profile` |
| **6** | [`supabase/cloud_patch_admin_role.sql`](../supabase/cloud_patch_admin_role.sql) | Для `/admin`: роль `profiles.role` |
| **7** | [`supabase/cloud_patch_cart_orders.sql`](../supabase/cloud_patch_cart_orders.sql) | Для корзины `/cart` и заказов |
| **8** | [`supabase/cloud_patch_yookassa_orders.sql`](../supabase/cloud_patch_yookassa_orders.sql) | Для ЮKassa: поля оплаты в `orders`, `fulfill_paid_order` |

Оба обязательных файла (шаги 1–2) выполняются в **Supabase Dashboard → SQL Editor → New query → Run**.

Повторный запуск безопасен: bootstrap использует `IF NOT EXISTS` / `OR REPLACE`; seed — `ON CONFLICT` (UUID `e0000000-*`).

### Когда нужен шаг 3 (patch)

Если проект уже был поднят на **старом** `cloud_bootstrap.sql` (без миграции `20260618200000`), бесплатные материалы показывают только заголовки глав. Выполните **один раз**:

[`supabase/cloud_patch_free_content_rls.sql`](../supabase/cloud_patch_free_content_rls.sql)

После patch перезапустите `npm run dev` и откройте бесплатный материал — должен быть виден текст глав.

**Новые проекты:** достаточно шагов 1–2 (актуальный bootstrap уже содержит patch).

### Auth (шаг 4)

Для входа/регистрации выполните [`supabase/cloud_patch_auth_profiles.sql`](../supabase/cloud_patch_auth_profiles.sql), если:

- после регистрации в `/profile` нет строки в `profiles`;
- нужна policy `profiles_update_own` (обновление своего профиля).

Актуальный `cloud_bootstrap.sql` уже включает `handle_new_user` и `profiles_select_own`; patch добавляет `profiles_update_own` и пересоздаёт trigger.

#### Настройки Supabase Dashboard → Authentication

1. **Providers → Email** — включён Email provider.
2. **URL Configuration**:
   - Site URL: `http://localhost:3000` (dev) или production URL
   - Redirect URLs: `http://localhost:3000/auth/callback` (+ production URL)
3. **Email confirmations** — по желанию команды (если включены, после sign-up нужно подтвердить email).

#### Env для auth

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Используется в redirect для sign-up и reset password (см. `.env.example`).

### Бесплатное получение и библиотека (шаг 5)

Выполните [`supabase/cloud_patch_free_entitlements.sql`](../supabase/cloud_patch_free_entitlements.sql) **один раз**, чтобы работали:

- кнопка «Получить бесплатно» на страницах бесплатных материалов и заданий;
- список полученных продуктов в `/profile`.

Проверка в SQL Editor:

```sql
select proname from pg_proc where proname = 'claim_free_product';
```

Ожидается одна строка.

### Admin-lite (шаг 6)

Выполните [`supabase/cloud_patch_admin_role.sql`](../supabase/cloud_patch_admin_role.sql), затем назначьте администратора вручную:

```sql
update public.profiles
set role = 'admin'
where id = (
  select id from auth.users where email = 'ВАШ_EMAIL' limit 1
);
```

Проверка:

```sql
select id, display_name, role from public.profiles where role = 'admin';
```

После этого откройте `/admin` под этим аккаунтом. Нужен `SUPABASE_SERVICE_ROLE_KEY` в `.env.local` для записи контента.

### Корзина и заказы (шаг 7)

Выполните [`supabase/cloud_patch_cart_orders.sql`](../supabase/cloud_patch_cart_orders.sql) для:

- таблиц `cart_items`, `orders`, `order_items`;
- RPC `add_to_cart`, `remove_from_cart`, `create_pending_order_from_cart`;
- страниц `/cart` и `/profile/orders`.

Проверка:

```sql
select proname from pg_proc
where proname in ('add_to_cart', 'remove_from_cart', 'create_pending_order_from_cart');
```

Ожидается 3 строки.

Ручная проверка:

1. Платный продукт → «Добавить в корзину» → `/cart`.
2. «Перейти к оплате» → заказ `pending_payment`, корзина пустая.
3. Entitlement **не** создаётся до реальной оплаты.

### ЮKassa (шаг 8)

Выполните [`supabase/cloud_patch_yookassa_orders.sql`](../supabase/cloud_patch_yookassa_orders.sql).

Подробная инструкция: [`docs/YOOKASSA_INTEGRATION.md`](YOOKASSA_INTEGRATION.md).

Проверка:

```sql
select proname from pg_proc where proname = 'fulfill_paid_order';
select column_name from information_schema.columns
where table_schema = 'public' and table_name = 'orders' and column_name = 'provider_payment_id';
```

## Где взять env

**Project Settings → API** в Supabase Dashboard. Скопировать в `.env.local` (не коммитить):

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-public-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-secret>
```

Для оплаты (server-only, см. [`docs/YOOKASSA_INTEGRATION.md`](YOOKASSA_INTEGRATION.md), деплой: [`docs/VERCEL_DEPLOY.md`](VERCEL_DEPLOY.md)):

```env
YOOKASSA_SHOP_ID=
YOOKASSA_SECRET_KEY=
YOOKASSA_RETURN_URL=
```

Имена переменных — в [`.env.example`](../.env.example).

## Запуск сайта

```bash
npm install
npm run dev
```

Открыть http://localhost:3000

Если меняли `.env.local` или SQL — **перезапустите** `npm run dev`.

## Проверка, что каталог работает

1. SQL Editor: `select count(*) from public.products where status = 'published';` — ожидается **> 0** (после seed: 16 строк, на главной 15: section/material/task).
2. Главная `/` — карточки разделов, материалов и заданий, фильтры и поиск.
3. Нет ошибки `Could not find the table 'public.products'`.
4. Бесплатные позиции показывают «Бесплатно», платные — цену в ₽.
5. `/materials/kak-chitat-produktovuyu-zadachu` — **3 главы с текстом** (бесплатный материал).
6. `/materials/junior-designer-2026` — **только заголовки глав**, без текста (платный).
7. `/tasks/razobrat-ekran-oplaty` — полный бриф и требования к сдаче.

### Проверка RLS в SQL Editor (опционально)

```sql
-- от имени anon через PostgREST это делает приложение; в SQL Editor — set role:
set local role anon;
select count(*) from public.material_chapters mc
join public.products p on p.id = mc.material_product_id
where p.slug = 'kak-chitat-produktovuyu-zadachu';
-- ожидается 3

select count(*) from public.material_chapters mc
join public.products p on p.id = mc.material_product_id
where p.slug = 'junior-designer-2026';
-- ожидается 0 для anon
reset role;
```

## Что создаёт bootstrap

Таблицы, которые читает текущий код каталога:

- `products`, `sections`, `materials`, `tasks`
- `tags`, `product_tags`
- `material_chapters`, `task_content`, `task_ai_criteria`
- `section_updates`, `section_update_materials`
- `profiles`, `entitlements`, `admin_users` (фундамент auth, без UI)

Плюс RLS, read policies, API `GRANT SELECT`, RPC `get_material_toc`, `has_product_access`.

### Доступ к контенту (RLS)

| Контент | anon / без покупки | С entitlement |
|---------|-------------------|---------------|
| Бесплатный материал (`price_kopecks = 0`) | полный текст глав | полный текст глав |
| Платный материал | только `get_material_toc` (заголовки) | полный текст глав |
| Бесплатное задание | `task_content` (бриф) | бриф |
| Платное задание | закрыто | `task_content` |

## Что не входит

Корзина, оплата, Storage, админка — не настраиваются этими SQL. Auth UI реализован в Next.js (`/auth/*`, `/profile`).

## Альтернатива (optional)

Локальный Docker: `npm run supabase:start` → `npm run db:local:reset` (использует `supabase/migrations/` + `supabase/seed.sql`). Для MVP **не обязательно**.

## Пересборка cloud_bootstrap.sql

Если изменились миграции в `supabase/migrations/`:

```bash
node scripts/build-cloud-bootstrap.mjs
```
