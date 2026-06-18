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

## Структура репозитория (фактическая, этап 2)

```
src/
  app/
    globals.css            # Tailwind v4 + shadcn tokens
    layout.tsx             # ru, Inter, header/main/footer
    page.tsx               # Демо дизайн-системы (временная)
  components/
    layout/
      container.tsx
      site-header.tsx
      site-footer.tsx
    ui/                    # shadcn: button, input, card, badge, separator, skeleton
  lib/
    utils.ts
components.json            # shadcn config
docs/                      # Продуктовая документация
.cursor/                   # Правила и skills
```

Целевые маршруты `(auth)`, `(app)`, `(admin)`, `api/` — на следующих этапах. См. план ниже.

### Планируемая структура (этапы 3+)

```
src/app/
  (auth)/
  (app)/library|cart|checkout|profile|materials|assignments|sections
  (admin)/
  support/
  legal/
  api/webhooks/
src/lib/supabase|payments|polza|cart|access|storage/
supabase/migrations/
```

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
