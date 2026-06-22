import {
  AdminEmptyState,
  AdminForbidden,
  AdminShell,
} from "@/components/admin/admin-shell";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { ProductSalesTable } from "@/components/admin/product-sales-table";
import { RecentOrdersTable } from "@/components/admin/recent-orders-table";
import { formatPrice } from "@/lib/catalog/format";
import {
  getAdminDashboardStats,
  getAdminProductSales,
  getAdminRecentOrders,
} from "@/lib/admin/analytics";import { requireAdmin } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const ctx = await requireAdmin("/admin/analytics");

  if (ctx.role !== "admin") {
    return <AdminForbidden />;
  }

  let error: string | null = null;
  let stats: Awaited<ReturnType<typeof getAdminDashboardStats>> | null = null;
  let sales: Awaited<ReturnType<typeof getAdminProductSales>> = [];
  let recentOrders: Awaited<ReturnType<typeof getAdminRecentOrders>> = [];

  try {
    [stats, sales, recentOrders] = await Promise.all([
      getAdminDashboardStats(),
      getAdminProductSales(),
      getAdminRecentOrders(8),
    ]);
  } catch (loadError) {
    error =
      loadError instanceof Error ? loadError.message : "Не удалось загрузить статистику";
  }

  if (error || !stats) {
    return (
      <AdminShell title="Статистика" description="Ключевые метрики платформы.">
        <AdminEmptyState title="Ошибка загрузки" description={error ?? "Неизвестная ошибка"} />
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title="Статистика"
      description="Выручка, заказы, пользователи и популярные товары."
    >
      <div className="space-y-8">
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

        <section className="grid gap-4 sm:grid-cols-3">
          <AdminStatCard
            label="Ошибки выдачи доступа"
            value={String(stats.grantErrors)}
            hint="Заказы с entitlement_grant_error"
          />
          <AdminStatCard
            label="Отзывы опубликованы"
            value={String(stats.visibleReviews)}
          />
          <AdminStatCard
            label="Отзывы скрыты"
            value={String(stats.hiddenReviews)}
          />
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Популярные товары</h2>
            <p className="mt-1 text-sm text-neutral-600">По выручке среди оплаченных заказов.</p>
          </div>
          {sales.length === 0 ? (
            <AdminEmptyState
              title="Продаж пока нет"
              description="После первых оплат здесь появится рейтинг товаров."
            />
          ) : (
            <ProductSalesTable rows={sales.slice(0, 10)} />
          )}
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Последние заказы</h2>
            <p className="mt-1 text-sm text-neutral-600">Недавние заказы и ошибки выдачи доступа.</p>
          </div>
          {recentOrders.length === 0 ? (
            <AdminEmptyState title="Заказов пока нет" description="История заказов пуста." />
          ) : (
            <RecentOrdersTable orders={recentOrders} />
          )}
        </section>
      </div>
    </AdminShell>
  );
}
