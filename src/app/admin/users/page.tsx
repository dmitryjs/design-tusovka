import {
  AdminEmptyState,
  AdminForbidden,
  AdminShell,
} from "@/components/admin/admin-shell";
import { UsersTable } from "@/components/admin/users-table";
import { requireAdmin } from "@/lib/auth/admin";
import { listAdminUsers } from "@/lib/admin/users";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const ctx = await requireAdmin("/admin/users");

  if (ctx.role !== "admin") {
    return <AdminForbidden />;
  }

  let users: Awaited<ReturnType<typeof listAdminUsers>> = [];
  let error: string | null = null;

  try {
    users = await listAdminUsers();
  } catch (loadError) {
    error =
      loadError instanceof Error ? loadError.message : "Не удалось загрузить пользователей";
  }

  return (
    <AdminShell
      title="Пользователи"
      description="Просмотр профилей, ручная выдача и отзыв доступа, деактивация."
    >
      {error ? (
        <AdminEmptyState title="Ошибка загрузки" description={error} />
      ) : users.length === 0 ? (
        <AdminEmptyState
          title="Пользователей пока нет"
          description="После регистрации профили появятся здесь автоматически."
        />
      ) : (
        <UsersTable users={users} />
      )}
    </AdminShell>
  );
}
