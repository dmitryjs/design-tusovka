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

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const { kind: kindParam } = await searchParams;
  const kindFilter =
    kindParam === "material" || kindParam === "task" ? kindParam : null;

  const ctx = await requireAdmin("/admin/products");

  if (ctx.role !== "admin") {
    return <AdminForbidden />;
  }

  let items: Awaited<ReturnType<typeof listAdminProducts>> = [];
  let error: string | null = null;

  try {
    items = await listAdminProducts();
    if (kindFilter) {
      items = items.filter((item) => item.kind === kindFilter);
    }
  } catch (loadError) {
    error =
      loadError instanceof Error
        ? loadError.message
        : "Не удалось загрузить продукты";
  }

  const pageTitle =
    kindFilter === "material"
      ? "Материалы"
      : kindFilter === "task"
        ? "Задания"
        : "Каталог";

  const pageDescription =
    kindFilter === "material"
      ? "Материалы каталога."
      : kindFilter === "task"
        ? "Задания каталога."
        : "Материалы и задания каталога.";

  return (
    <AdminShell
      title={pageTitle}
      description={pageDescription}
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
