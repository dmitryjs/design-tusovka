import {
  AdminEmptyState,
  AdminForbidden,
  AdminShell,
} from "@/components/admin/admin-shell";
import { AdminProductsToolbar } from "@/components/admin/admin-products-toolbar";
import { ProductsTable } from "@/components/admin/products-table";
import { requireAdmin } from "@/lib/auth/admin";
import { listAdminProducts } from "@/lib/admin/products";

export const dynamic = "force-dynamic";

type AdminProductsKind = "material" | "task";

function resolveKindFilter(kindParam: string | undefined): AdminProductsKind {
  return kindParam === "task" ? "task" : "material";
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const { kind: kindParam } = await searchParams;
  const kindFilter = resolveKindFilter(kindParam);

  const ctx = await requireAdmin(
    kindFilter === "task" ? "/admin/products?kind=task" : "/admin/products?kind=material",
  );

  if (ctx.role !== "admin") {
    return <AdminForbidden />;
  }

  let items: Awaited<ReturnType<typeof listAdminProducts>> = [];
  let error: string | null = null;

  try {
    const allItems = await listAdminProducts();
    items = allItems.filter((item) => item.kind === kindFilter);
  } catch (loadError) {
    error =
      loadError instanceof Error
        ? loadError.message
        : "Не удалось загрузить продукты";
  }

  const pageTitle = kindFilter === "task" ? "Задания" : "Материалы";
  const pageDescription =
    kindFilter === "task"
      ? "Задания каталога: создание, редактирование и импорт из JSON."
      : "Материалы каталога.";

  return (
    <AdminShell
      title={pageTitle}
      description={pageDescription}
      actions={<AdminProductsToolbar kind={kindFilter} />}
    >
      {error ? (
        <AdminEmptyState title="Ошибка загрузки" description={error} />
      ) : items.length === 0 ? (
        <AdminEmptyState
          title={kindFilter === "task" ? "Заданий пока нет" : "Материалов пока нет"}
          description={
            kindFilter === "task"
              ? "Создайте первое задание или импортируйте JSON."
              : "Создайте первый материал."
          }
        />
      ) : (
        <ProductsTable items={items} kind={kindFilter} />
      )}
    </AdminShell>
  );
}
