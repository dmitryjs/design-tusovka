import Link from "next/link";

import {
  AdminForbidden,
  AdminShell,
} from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth/admin";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const ctx = await requireAdmin("/admin");

  if (ctx.role !== "admin") {
    return <AdminForbidden />;
  }

  return (
    <AdminShell
      title="Админ-панель"
      description="Управление каталогом MVP без SQL."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/admin/products"
          className="rounded-xl border border-neutral-300 bg-card p-5 transition-colors hover:border-primary/30 hover:bg-neutral-50"
        >
          <h2 className="text-base font-semibold text-foreground">Продукты</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Материалы и задания: создание, цена, статус, контент.
          </p>
        </Link>
        <Link
          href="/admin/sections"
          className="rounded-xl border border-neutral-300 bg-card p-5 transition-colors hover:border-primary/30 hover:bg-neutral-50"
        >
          <h2 className="text-base font-semibold text-foreground">Разделы</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Секции каталога и их публикация.
          </p>
        </Link>
        <Link
          href="/admin/tags"
          className="rounded-xl border border-neutral-300 bg-card p-5 transition-colors hover:border-primary/30 hover:bg-neutral-50"
        >
          <h2 className="text-base font-semibold text-foreground">Теги</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Справочник тегов для продуктов.
          </p>
        </Link>
      </div>
      <p className="text-sm text-neutral-500">
        <Link href="/" className={buttonVariants({ variant: "link", size: "sm" })}>
          Открыть сайт
        </Link>
      </p>
    </AdminShell>
  );
}
