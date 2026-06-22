import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { getLevelLabel } from "@/lib/catalog/format";
import type { AdminUserListItem } from "@/lib/admin/users";
import { cn } from "@/lib/utils";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export function UsersTable({ users }: { users: AdminUserListItem[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-600">
          <tr>
            <th className="px-4 py-3 font-medium">Пользователь</th>
            <th className="px-4 py-3 font-medium">Уровень</th>
            <th className="px-4 py-3 font-medium">Доступы</th>
            <th className="px-4 py-3 font-medium">Заказы</th>
            <th className="px-4 py-3 font-medium">Статус</th>
            <th className="px-4 py-3 font-medium">Регистрация</th>
            <th className="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-neutral-100 last:border-0">
              <td className="px-4 py-3">
                <div className="space-y-1">
                  <p className="font-medium text-foreground">
                    {user.displayName?.trim() || "Без имени"}
                  </p>
                  <p className="text-neutral-600">{user.email}</p>
                </div>
              </td>
              <td className="px-4 py-3 text-neutral-700">
                {user.designerLevel !== "all"
                  ? getLevelLabel(user.designerLevel)
                  : "—"}
              </td>
              <td className="px-4 py-3 tabular-nums">{user.entitlementsCount}</td>
              <td className="px-4 py-3 tabular-nums">{user.ordersCount}</td>
              <td className="px-4 py-3">
                <Badge
                  variant="secondary"
                  className={cn(
                    "border-0",
                    user.deactivatedAt
                      ? "bg-neutral-100 text-neutral-600"
                      : "bg-emerald-50 text-emerald-700",
                  )}
                >
                  {user.deactivatedAt ? "Деактивирован" : "Активен"}
                </Badge>
              </td>
              <td className="px-4 py-3 text-neutral-600">{formatDate(user.createdAt)}</td>
              <td className="px-4 py-3">
                <Link href={`/admin/users/${user.id}`} className="text-primary hover:underline">
                  Открыть
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
