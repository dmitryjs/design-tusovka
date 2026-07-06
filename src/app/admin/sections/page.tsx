import {
  AdminForbidden,
  AdminShell,
} from "@/components/admin/admin-shell";
import { SectionsManager } from "@/components/admin/section-form";
import { requireAdmin } from "@/lib/auth/admin";
import { listAdminSections } from "@/lib/admin/sections";

export const dynamic = "force-dynamic";

export default async function AdminSectionsPage() {
  const ctx = await requireAdmin("/admin/sections");

  if (ctx.role !== "admin") {
    return <AdminForbidden />;
  }

  const sections = await listAdminSections();

  return (
    <AdminShell
      title="Разделы"
      description="Создание, публикация и скрытие разделов каталога без правок в коде."
    >
      <SectionsManager sections={sections} />
    </AdminShell>
  );
}
