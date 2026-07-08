# Отчёт по этапу

## Этап

**Мобильный UX: хедер, bottom tabs, отзывы выключены, без горизонтального скролла**

**Статус: завершён**

## Результат

Мобильная оболочка приближена к приложению:

1. **Поиск** — fullscreen client overlay (не отдельный route `/search`): иконка в хедере открывается мгновенно без нового RSC-fetch; submit ведёт на `/?q=` или `/tasks?q=` как раньше. На `lg+` остаётся инлайн-поле.
2. **Хедер (mobile)** — только иконки: поиск, уведомления, корзина. Топ-меню и аватар убраны с мобилки.
3. **Bottom tab bar** — Материалы `/`, Задания `/tasks`, Библиотека `/profile/library`, Профиль `/profile` (иконка + подпись).
4. **Отзывы/оценки** временно скрыты везде флагом `PUBLIC_REVIEWS_UI_ENABLED = false` (`src/lib/reviews/feature.ts`): бейджи, секции отзывов, звёзды на карточках. Админка отзывов не тронута.
5. **Overflow** — `overflow-x: clip` на `html`/`body`, `max-w-[100vw]` на body, padding под tab bar; убраны `min-w` у карточек материалов.

## Изменённые файлы

| Файл | Изменение |
|------|-----------|
| `src/lib/navigation.ts` | `MAIN_NAV` + `MOBILE_TAB_NAV`, active states |
| `src/components/layout/header-search.tsx` | Mobile fullscreen search overlay |
| `src/components/layout/site-header-nav.tsx` | Desktop nav; mobile icons only |
| `src/components/layout/site-header.tsx` | Упрощённый mobile header |
| `src/components/layout/mobile-bottom-tab-bar.tsx` | Новый bottom tab bar |
| `src/components/layout/conditional-site-chrome.tsx` | Tab bar + padding; footer desktop-only |
| `src/components/layout/cart-preview-dropdown.tsx` | Hover-dropdown только desktop |
| `src/lib/reviews/feature.ts` | Флаг выключения публичных отзывов |
| `src/components/reviews/*`, cards, heroes consumers | Скрытие через флаг |
| `src/app/globals.css`, `layout.tsx` | Anti horizontal scroll |

## Проверки

- `npm run typecheck` — OK

---

## Этап

**ЮKassa: назначение платежа, metadata и позиции чека**

**Статус: завершён**

## Результат

Обогащены данные платежа ЮKassa без изменения payment flow, webhook, RLS и cart/order логики. Введён стабильный публичный номер заказа `DT-XXXXXXXX` (первые 8 символов `order.id`, primary key не меняется). Все данные берутся server-side из `order_items` / `products`, клиент не участвует.

- **`description`**: `Оплата заказа DT-XXXXXXXX` (формируется в `create-payment.ts`).
- **`metadata`**: `order_id`, `order_number`, `user_id` (server-only), `source: "design-tusovka"`.
- **Чек (`receipt.items`)**: по позиции на каждый `order_item` — «Доступ к материалу/разделу/заданию: {title}», для неизвестного типа «Доступ к цифровому материалу: {title}». Описание безопасно обрезается до 128 символов; `vat_code` по умолчанию `1` (без НДС, НПД). Чек включается флагом `YOOKASSA_SEND_RECEIPT` и только при наличии email покупателя (иначе не отправляется — платёж не ломается).

Webhook не менялся: связь по `provider_payment_id`, `metadata.order_id` — дополнительная проверка, идемпотентность сохранена.

## Изменённые файлы

| Файл | Изменение |
|------|-----------|
| `src/lib/payments/yookassa/order-number.ts` | Новый: `buildPublicOrderNumber` (`DT-XXXXXXXX`) |
| `src/lib/payments/yookassa/receipt.ts` | Новый: описания позиций чека, обрезка до 128, `buildReceipt` (env-gated) |
| `src/lib/payments/yookassa/create-payment.ts` | `description`, `metadata`, `receipt`; выборка `title`/`kind` из `order_items`/`products` |
| `src/lib/payments/yookassa/client.ts` | Проброс опционального `receipt` в `POST /v3/payments` |
| `src/lib/payments/yookassa/types.ts` | Типы `YookassaReceipt`, `YookassaReceiptItem`, `YookassaReceiptCustomer` |
| `.env.example` | `YOOKASSA_SEND_RECEIPT`, `YOOKASSA_VAT_CODE` (только имена) |
| `docs/YOOKASSA_INTEGRATION.md` | Описание назначения, metadata, чека и env |

## Проверки

- `npm run typecheck` — OK
- `npm run lint` — см. ниже
- `npm run build` — см. ниже

---

## Этап

**Юридические данные: переход с ИП на продавца-самозанятого (НПД)**

**Статус: завершён**

## Результат

Реквизиты и юридические страницы переведены с ИП на самозанятую — плательщика налога на профессиональный доход. ОГРНИП удалён из UI и централизованных данных. Оплата, webhook, Supabase, auth, cart и admin не менялись.

## Изменённые файлы

| Файл | Изменение |
|------|-----------|
| `src/lib/legal/seller-info.ts` | Новая структура: `sellerName`, `sellerStatus`, `sellerInn`, `sellerEmail`, `taxMode`, `receiptInfo`, `correspondenceAddress` |
| `src/app/requisites/page.tsx` | Реквизиты самозанятой, НПД, чек |
| `src/app/offer/page.tsx` | Продавец — НПД, без ИП/ОГРНИП, чеки и возвраты |
| `src/app/privacy/page.tsx` | Оператор — НПД, без ОГРНИП |
| `src/app/payment-and-refund/page.tsx` | Продавец, чеки НПД, возвраты |
| `src/app/support/page.tsx` | Продавец и контакты |
| `src/components/legal/legal-page-layout.tsx` | `LegalCorrespondenceAddress`, `sellerEmail` |
| `src/components/layout/site-footer.tsx` | ФИО, «Плательщик НПД», ИНН в футере |
| `docs/VERCEL_DEPLOY.md` | Ссылка на реквизиты НПД |

## Реквизиты продавца

Заполнены в `src/lib/legal/seller-info.ts`:

| Поле | Значение |
|------|----------|
| `sellerName` | Галкина Александра Германовна |
| `sellerInn` | 782003241079 |
| `sellerEmail` | designtusovka@yandex.ru |
| `correspondenceAddress` | по запросу через email поддержки |

Перед подключением оплат: магазин ЮKassa и `NEXT_PUBLIC_SITE_URL` должны совпадать с продавцом на сайте.

## Примечания

- ОГРНИП больше не используется: у самозанятого его нет.
- Чеки формируются по режиму НПД (не 54-ФЗ через кассу ИП).
- Данные Дмитрия Галкина и формулировки «ИП» удалены с юридических страниц.

## Проверки

- `npm run typecheck` — OK
- `npm run lint` — ошибки в admin/material (существовали до этапа; юридические файлы без новых замечаний)
- `npm run build` — OK

---

## Этап

**Страница раздела `/sections/[slug]` — новый layout**

**Статус: завершён**

## Результат

Страница раздела переработана по референсу: hero с обложкой и статистикой, roadmap, список материалов, sticky sidebar (покупка, что входит, что получите, для кого). Старый `section-detail.tsx` удалён. Slug-алиасы: `job-search`, `resume-portfolio`, `ai-design` и др. → каталожные разделы в БД. Legacy slug (`job-and-portfolio`, `ai-design-engineering`) редиректит на канонический page slug.

## Маршруты разделов

| URL | Раздел |
|-----|--------|
| `/sections/job-search` | Поиск работы |
| `/sections/resume-portfolio` | Резюме и портфолио |
| `/sections/grade-growth` | Рост грейда |
| `/sections/product-thinking` | Продуктовое мышление |
| `/sections/ai-design` | AI в дизайне |
| `/sections/real-product-work` | Реальная работа в продукте |
| `/sections/whiteboards-and-practice` | Вайтборды (каталог) |

## Проверки

`npm run typecheck`, `npm run build` — OK.

---

## Этап

**Страница материала `/materials/[slug]` — новая UX-структура**

**Статус: завершён**

## Результат

Страница материала переработана в формат preview/detail с двумя колонками: основная колонка (hero, обложка, текст, мета) и sticky-правая колонка (карточка доступа + содержание). Бизнес-логика доступа и CTA отделена от UI-компонентов. Оплата, webhook, RLS, схема Supabase, auth, cart и admin не менялись.

## Компоненты

| Компонент | Назначение |
|-----------|------------|
| `MaterialHero` | Breadcrumbs-контекст в hero: бейджи типа/уровня/раздела/цены, заголовок, описание, мета-строка |
| `MaterialCover` | Обложка 16:9 или placeholder по формату материала |
| `MaterialAccessCard` | Sticky CTA: claim / cart / read / library (client) |
| `MaterialTableOfContents` | Содержание в правой колонке; якоря при полном доступе |
| `MaterialContent` | Полный текст глав в основной колонке |
| `MaterialMeta` | Блок «Об этом материале» |
| `MaterialPreviewNotice` | Превью для платного некупленного материала |
| `MaterialDetailView` | Композиция страницы |
| `MaterialDetailLoading` | Skeleton двухколоночного layout |

## Данные (`detail-queries.ts`)

- Добавлены поля: `coverPath`, `updatedAt`, `hasFullAccess`
- Платный контент глав загружается через authenticated client только при `has_product_access`
- Бесплатный контент — через anon client (существующий RLS)
- `fetchTagsForProducts` принимает generic `SupabaseClient<Database>`

## CTA по состояниям

| Состояние | Primary | Secondary |
|-----------|---------|-----------|
| Гость + бесплатный | Войти, чтобы сохранить | Читать материал |
| Авторизован + бесплатный + не в библиотеке | Добавить в библиотеку | Читать материал |
| Авторизован + бесплатный + в библиотеке | Уже в библиотеке | Читать + Открыть в библиотеке |
| Гость + платный | Войти, чтобы купить | — |
| Авторизован + платный + нет доступа | Купить за {price} | — |
| Авторизован + платный + в корзине | Перейти в корзину | — |
| Авторизован + платный + куплен | Читать материал | Открыть в библиотеке |

Действия: `claimFreeProductAction`, `addToCartAction` — без новой логики.

## PDF-кнопка

**Не реализована** — в схеме БД нет поля для PDF-файла материала (`products.cover_path` только для обложки). Кнопка «Скачать PDF» скрыта до появления поля и signed URL flow.

## Не реализовано из-за отсутствия данных

- Время чтения глав / материала (нет поля в `material_chapters`)
- PDF download
- Блок автора, подписка, похожие материалы, отзывы — намеренно не добавлены

## Проверки

| Команда | Результат |
|---------|-----------|
| `npm run typecheck` | OK |
| `npm run lint` | OK (1 pre-existing warning в `section-covers.ts`) |
| `npm run build` | OK |

## Ручная проверка

1. Бесплатный материал как гость — hero, обложка, текст, CTA «Войти…», TOC с якорями
2. Бесплатный как авторизованный без claim — «Добавить в библиотеку»
3. Бесплатный после claim — «Уже в библиотеке», ссылка в `/profile`
4. Платный как гость — preview notice, TOC только названия, «Войти, чтобы купить»
5. Платный авторизованный — «Купить за …»
6. Платный в корзине — «Перейти в корзину»
7. Платный с entitlement — полный текст, «Читать материал»
8. PDF-кнопка отсутствует
9. Mobile — CTA после hero, TOC после контента
10. 404 для несуществующего slug

---

## Этап

**Production readiness polish перед модерацией ЮKassa**

**Статус: завершён**

## Результат

Проведена подготовка сайта к проверке ЮKassa и первым пользователям без изменений payment/webhook/auth/cart/admin. Юридические страницы заполнены реальными реквизитами ИП из `seller-info.ts`. Убраны видимые заглушки (`до N рабочих дней`, баннеры «Черновик»), исправлены устаревшие «скоро» на auth и странице заданий. Футер и production URLs проверены.

## Вердикт по модерации ЮKassa

**Можно отправлять на модерацию** при условии, что в Vercel заданы `NEXT_PUBLIC_SITE_URL=https://designtusovka.ru` и ключи ЮKassa, а в ЛК ЮKassa указаны URL из таблицы ниже.

Рекомендуется до долгосрочной эксплуатации (не блокер модерации):

- юридическая вычитка оферты и политики конфиденциальности;
- задать `supportResponseNote` в `seller-info.ts` (конкретный SLA ответа поддержки).

## Проверенные страницы

| Маршрут | Статус | Примечание |
|---------|--------|------------|
| `/requisites` | OK | ИП, ИНН, ОГРНИП, email, вид деятельности |
| `/offer` | OK | Оферта без баннера «черновик» |
| `/privacy` | OK | Политика без баннера «черновик» |
| `/payment-and-refund` | OK | Оплата, возврат, контакты |
| `/support` | OK | Email, темы обращений, срок ответа (нейтральная формулировка) |

## Placeholder’ы: что осталось

| Место | Статус | Действие вручную |
|-------|--------|------------------|
| `SELLER_INFO.supportResponseNote` (`null`) | TODO в коде | Задать срок, напр. «до 3 рабочих дней» |
| `you@example.com` в auth-формах | UI placeholder поля email | Не влияет на модерацию |
| `Google — скоро` на sign-in/sign-up | Функция не подключена | Не блокер ЮKassa |
| `docs/VERCEL_DEPLOY.md` — домены | Указан `designtusovka.ru` | Обновить, если сменится домен |
| `.env.example` — `designtusovka.ru` | Шаблон env | Обновить, если сменится домен |

**Не найдено** на сайте: `ФИО_ПРЕДПРИНИМАТЕЛЯ`, `ИНН_ПРЕДПРИНИМАТЕЛЯ`, `ОГРНИП_ПРЕДПРИНИМАТЕЛЯ`, `support@example.com`, `your-domain` в пользовательском UI.

## Production URLs

Источник: `src/lib/legal/seller-info.ts` → `PRODUCTION_URLS` (при `NEXT_PUBLIC_SITE_URL=https://designtusovka.ru`):

| Назначение | URL |
|------------|-----|
| Site | `https://designtusovka.ru` |
| Auth callback | `https://designtusovka.ru/auth/callback` |
| Checkout success | `https://designtusovka.ru/checkout/success` |
| Checkout fail | `https://designtusovka.ru/checkout/fail` |
| Webhook ЮKassa | `https://designtusovka.ru/api/webhooks/yookassa` |
| Реквизиты | `https://designtusovka.ru/requisites` |

## Футер

- 5 ссылок на legal pages: Реквизиты, Оферта, Конфиденциальность, Оплата и возврат, Поддержка
- Стиль: `text-xs text-neutral-400`, hover underline
- Mobile: `flex-wrap`, `gap-y-1` — не ломается

## Готовность к модерации (чеклист)

| Критерий | Статус |
|----------|--------|
| Понятно, что продаётся (цифровые материалы, гайды, задания) | OK |
| Реквизиты ИП | OK |
| Поддержка (email, страница) | OK |
| Условия оплаты и возврата | OK |
| Нет пустых критичных legal-страниц | OK |
| Payment logic / webhook не менялись | OK |

## Изменённые файлы (polish)

- `src/lib/legal/seller-info.ts` — `supportResponseNote`, `getSupportResponseText()`, `PRODUCTION_URLS`
- `src/app/offer/page.tsx`, `privacy/page.tsx` — убран `draftNotice`
- `src/app/payment-and-refund/page.tsx`, `support/page.tsx` — нейтральный срок ответа
- `src/components/auth/auth-page-shell.tsx` — актуальные пункты в сайдбаре
- `src/components/tasks/tasks-page.tsx` — описание без «скоро»
- `docs/VERCEL_DEPLOY.md` — актуальные production URL

## Проверки

| Команда | Результат |
|---------|-----------|
| `npm run typecheck` | 0 |
| `npm run lint` | 0 |
| `npm run build` | 0 |

---

## Предыдущий этап: Юридические страницы для ЮKassa

**Статус: завершён**

## Результат

Добавлены минимальные страницы для подключения ЮKassa: реквизиты, оферта, конфиденциальность, оплата и возврат, поддержка. Ссылки в футере — серые, малозаметные. Реквизиты ИП централизованы в `src/lib/legal/seller-info.ts`.

## Маршруты

| Маршрут | Назначение |
|---------|------------|
| `/requisites` | Реквизиты ИП, контакты, вид деятельности |
| `/offer` | Публичная оферта |
| `/privacy` | Политика конфиденциальности |
| `/payment-and-refund` | Оплата и возврат |
| `/support` | Поддержка |

## Файлы

- `src/components/legal/legal-page-layout.tsx` — общий layout юр. страниц
- `src/lib/legal/seller-info.ts` — реквизиты продавца
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
