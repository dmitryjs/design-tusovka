import {
  AdminEmptyState,
  AdminForbidden,
  AdminShell,
} from "@/components/admin/admin-shell";
import { ProductSalesTable } from "@/components/admin/product-sales-table";
import { ReportsExportPanel } from "@/components/admin/reports-export-panel";
import { getAdminProductSales } from "@/lib/admin/analytics";
import { requireAdmin } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const ctx = await requireAdmin("/admin/reports");

  if (ctx.role !== "admin") {
    return <AdminForbidden />;
  }

  let sales: Awaited<ReturnType<typeof getAdminProductSales>> = [];
  let error: string | null = null;

  try {
    sales = await getAdminProductSales();
  } catch (loadError) {
    error = loadError instanceof Error ? loadError.message : "Не удалось загрузить отчёты";
  }

  return (
    <AdminShell
      title="Отчёты"
      description="Экспорт пользователей, заказов и продаж в CSV."
    >
      <div className="space-y-8">
        <ReportsExportPanel />

        <section className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Продажи по товарам</h2>
            <p className="mt-1 text-sm text-neutral-600">
              Сводка по оплаченным заказам для быстрого просмотра.
            </p>
          </div>

          {error ? (
            <AdminEmptyState title="Ошибка загрузки" description={error} />
          ) : sales.length === 0 ? (
            <AdminEmptyState
              title="Данных для отчёта пока нет"
              description="После первых продаж таблица заполнится автоматически."
            />
          ) : (
            <ProductSalesTable rows={sales} />
          )}
        </section>
      </div>
    </AdminShell>
  );
}
