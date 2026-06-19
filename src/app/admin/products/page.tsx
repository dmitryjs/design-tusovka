import Link from "next/link";

import {
  AdminEmptyState,
  AdminForbidden,
  AdminShell,
} from "@/components/admin/admin-shell";
import { ProductsTable } from "@/components/admin/products-table";
import { requireAdmin } from "@/lib/auth/admin";
import { listAdminProducts } from "@/lib/admin/products";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const ctx = await requireAdmin("/admin/products");

  if (ctx.role !== "admin") {
    return <AdminForbidden />;
  }

  let items: Awaited<ReturnType<typeof listAdminProducts>> = [];
  let error: string | null = null;

  try {
    items = await listAdminProducts();
  } catch (loadError) {
    error =
      loadError instanceof Error
        ? loadError.message
        : "Не удалось загрузить продукты";
  }

  return (
    <AdminShell
      title="Продукты"
      description="Материалы и задания каталога."
      actions={
        <Link href="/admin/products/new" className={buttonVariants()}>
          Создать продукт
        </Link>
      }
    >
      {error ? (
        <AdminEmptyState
          title="Ошибка загрузки"
          description={error}
        />
      ) : items.length === 0 ? (
        <AdminEmptyState
          title="Продуктов пока нет"
          description="Создайте первый материал или задание."
        />
      ) : (
        <ProductsTable items={items} />
      )}
    </AdminShell>
  );
}
