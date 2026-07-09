import { AdminForbidden, AdminShell } from "@/components/admin/admin-shell";
import { TaskImportForm } from "@/components/admin/task-import-form";
import { requireAdmin } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

export default async function AdminTaskImportPage() {
  const ctx = await requireAdmin("/admin/import/tasks");

  if (ctx.role !== "admin") {
    return <AdminForbidden />;
  }

  return (
    <AdminShell
      title="Импорт заданий"
      description="Массовая загрузка заданий из JSON: whiteboard, UX-аудит, продуктовые задачи и задания для развития дизайнеров."
    >
      <TaskImportForm />
    </AdminShell>
  );
}
