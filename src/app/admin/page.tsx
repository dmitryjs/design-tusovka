import Link from "next/link";

import { AdminDashboard } from "@/components/admin/admin-dashboard";
import {
  AdminEmptyState,
  AdminForbidden,
  AdminShell,
} from "@/components/admin/admin-shell";
import { buttonVariants } from "@/components/ui/button";
import { getAdminDashboardOverview } from "@/lib/admin/analytics";
import { requireAdmin } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const ctx = await requireAdmin("/admin");

  if (ctx.role !== "admin") {
    return <AdminForbidden />;
  }

  let error: string | null = null;
  let overview: Awaited<ReturnType<typeof getAdminDashboardOverview>> | null = null;

  try {
    overview = await getAdminDashboardOverview();
  } catch (loadError) {
    error =
      loadError instanceof Error ? loadError.message : "Не удалось загрузить дашборд";
  }

  return (
    <AdminShell
      title="Дашборд"
      description="Ключевые метрики, контент, заказы и быстрые действия в одном месте."
      actions={
        <Link href="/" className={buttonVariants({ variant: "secondary", size: "sm" })}>
          Открыть сайт
        </Link>
      }
    >
      {error || !overview ? (
        <AdminEmptyState
          title="Не удалось загрузить дашборд"
          description={error ?? "Проверьте подключение к Supabase и service role key."}
        />
      ) : (
        <AdminDashboard data={overview} />
      )}
    </AdminShell>
  );
}
