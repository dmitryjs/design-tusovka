import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BookOpen,
  Briefcase,
  FileBarChart,
  FileText,
  Layers,
  Star,
  Users,
} from "lucide-react";

import { AdminAlert, AdminEmptyState } from "@/components/admin/admin-shell";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { ProductSalesTable } from "@/components/admin/product-sales-table";
import { RecentOrdersTable } from "@/components/admin/recent-orders-table";
import { buttonVariants } from "@/components/ui/button";
import type { AdminDashboardOverview } from "@/lib/admin/analytics";
import { formatPrice } from "@/lib/catalog/format";
import { cn } from "@/lib/utils";

type AdminDashboardProps = {
  data: AdminDashboardOverview;
};

type QuickLink = {
  href: string;
  label: string;
  description: string;
  Icon: typeof FileText;
};

const QUICK_LINKS: QuickLink[] = [
  {
    href: "/admin/products",
    label: "Материалы",
    description: "Создание, цена, публикация",
    Icon: FileText,
  },
  {
    href: "/admin/products?kind=task",
    label: "Задания",
    description: "Бриф, критерии AI, цены",
    Icon: Briefcase,
  },
  {
    href: "/admin/sections",
    label: "Разделы",
    description: "Каталог и обновления",
    Icon: BookOpen,
  },
  {
    href: "/admin/users",
    label: "Пользователи",
    description: "Профили и доступы",
    Icon: Users,
  },
  {
    href: "/admin/reviews",
    label: "Отзывы",
    description: "Модерация оценок",
    Icon: Star,
  },
  {
    href: "/admin/analytics",
    label: "Статистика",
    description: "Подробные метрики",
    Icon: BarChart3,
  },
  {
    href: "/admin/reports",
    label: "Отчёты",
    description: "Экспорт CSV",
    Icon: FileBarChart,
  },
  {
    href: "/admin/tags",
    label: "Теги",
    description: "Справочник тегов",
    Icon: Layers,
  },
];

export function AdminDashboard({ data }: AdminDashboardProps) {
  const { stats, content, orders, topSales, recentOrders } = data;
  const hasAlerts = stats.grantErrors > 0 || orders.pendingPayment > 0 || orders.failed > 0;

  return (
    <div className="space-y-8">
      {hasAlerts ? (
        <section className="space-y-3">
          {stats.grantErrors > 0 ? (
            <AdminAlert variant="error">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
                  <span>
                    {stats.grantErrors} заказ(ов) с ошибкой выдачи доступа после оплаты — проверьте
                    вручную.
                  </span>
                </div>
                <Link href="/admin/analytics" className={buttonVariants({ variant: "secondary", size: "sm" })}>
                  Открыть статистику
                </Link>
              </div>
            </AdminAlert>
          ) : null}
          {orders.pendingPayment > 0 ? (
            <AdminAlert variant="error">
              {orders.pendingPayment} заказ(ов) ожидают оплаты.
            </AdminAlert>
          ) : null}
          {orders.failed > 0 ? (
            <AdminAlert variant="error">
              {orders.failed} заказ(ов) с ошибкой платежа.
            </AdminAlert>
          ) : null}
        </section>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Выручка" value={formatPrice(stats.revenueKopecks)} />
        <AdminStatCard
          label="Оплаченные заказы"
          value={String(stats.paidOrders)}
          hint={`Бесплатных: ${stats.freeOrders}`}
        />
        <AdminStatCard
          label="Пользователи"
          value={String(stats.totalUsers)}
          hint={`Активных: ${stats.activeUsers}`}
        />
        <AdminStatCard
          label="Конверсия в покупку"
          value={stats.conversionRate == null ? "—" : `${stats.conversionRate}%`}
          hint="Доля пользователей с оплаченным заказом"
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="Ожидают оплаты"
          value={String(orders.pendingPayment)}
        />
        <AdminStatCard
          label="Ошибки выдачи доступа"
          value={String(stats.grantErrors)}
          className={stats.grantErrors > 0 ? "border-destructive-border bg-destructive-bg/30" : undefined}
        />
        <AdminStatCard
          label="Отзывы"
          value={String(stats.visibleReviews)}
          hint={`Скрыто: ${stats.hiddenReviews}`}
        />
        <AdminStatCard
          label="Отменённые заказы"
          value={String(orders.cancelled)}
          hint={`С ошибкой: ${orders.failed}`}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="space-y-4 rounded-xl border border-neutral-200 bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-foreground">Контент</h2>
              <p className="mt-1 text-sm text-neutral-600">Статусы публикации по типам товаров.</p>
            </div>
          </div>
          <dl className="grid gap-4 sm:grid-cols-2">
            <ContentStatBlock
              title="Материалы"
              href="/admin/products"
              published={content.materialsPublished}
              draft={content.materialsDraft}
              hidden={content.materialsHidden}
            />
            <ContentStatBlock
              title="Задания"
              href="/admin/products?kind=task"
              published={content.tasksPublished}
              draft={content.tasksDraft}
              hidden={content.tasksHidden}
            />
            <ContentStatBlock
              title="Разделы"
              href="/admin/sections"
              published={content.sectionsPublished}
              draft={content.sectionsDraft}
              hidden={content.sectionsHidden}
            />
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-sm font-medium text-foreground">Теги</dt>
                <Link href="/admin/tags" className="text-xs font-medium text-primary hover:underline">
                  Управлять
                </Link>
              </div>
              <dd className="mt-2 text-2xl font-semibold text-foreground">{content.tagsCount}</dd>
            </div>
          </dl>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">Быстрые действия</h2>
          <ul className="space-y-2">
            {QUICK_LINKS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 transition-colors hover:border-primary/30 hover:bg-neutral-50"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-primary">
                    <item.Icon className="size-4" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-foreground">{item.label}</span>
                    <span className="block text-xs text-neutral-500">{item.description}</span>
                  </span>
                  <ArrowRight className="size-4 shrink-0 text-neutral-400" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">Популярные товары</h2>
            <p className="mt-1 text-sm text-neutral-600">Топ по выручке среди оплаченных заказов.</p>
          </div>
          <Link href="/admin/analytics" className="text-sm font-medium text-primary hover:underline">
            Вся статистика
          </Link>
        </div>
        {topSales.length === 0 ? (
          <AdminEmptyState
            title="Продаж пока нет"
            description="После первых оплат здесь появится рейтинг товаров."
          />
        ) : (
          <ProductSalesTable rows={topSales} />
        )}
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">Последние заказы</h2>
            <p className="mt-1 text-sm text-neutral-600">Недавние заказы и проблемы с доступом.</p>
          </div>
          <Link href="/admin/reports" className="text-sm font-medium text-primary hover:underline">
            Экспорт CSV
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <AdminEmptyState title="Заказов пока нет" description="История заказов пуста." />
        ) : (
          <RecentOrdersTable orders={recentOrders} />
        )}
      </section>
    </div>
  );
}

function ContentStatBlock({
  title,
  href,
  published,
  draft,
  hidden,
}: {
  title: string;
  href: string;
  published: number;
  draft: number;
  hidden: number;
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        <Link href={href} className="text-xs font-medium text-primary hover:underline">
          Открыть
        </Link>
      </div>
      <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div>
          <dt className="text-xs text-neutral-500">Опубл.</dt>
          <dd className="mt-0.5 text-lg font-semibold text-foreground">{published}</dd>
        </div>
        <div>
          <dt className="text-xs text-neutral-500">Чернов.</dt>
          <dd
            className={cn(
              "mt-0.5 text-lg font-semibold",
              draft > 0 ? "text-amber-700" : "text-foreground",
            )}
          >
            {draft}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-neutral-500">Скрыто</dt>
          <dd className="mt-0.5 text-lg font-semibold text-foreground">{hidden}</dd>
        </div>
      </dl>
    </div>
  );
}
