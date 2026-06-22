import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/catalog/format";
import type { AdminRecentOrderRow } from "@/lib/admin/analytics";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<AdminRecentOrderRow["status"], string> = {
  pending_payment: "Ожидает оплаты",
  paid: "Оплачен",
  cancelled: "Отменён",
  failed: "Ошибка",
};

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function RecentOrdersTable({ orders }: { orders: AdminRecentOrderRow[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-600">
          <tr>
            <th className="px-4 py-3 font-medium">Заказ</th>
            <th className="px-4 py-3 font-medium">Пользователь</th>
            <th className="px-4 py-3 font-medium">Сумма</th>
            <th className="px-4 py-3 font-medium">Статус</th>
            <th className="px-4 py-3 font-medium">Дата</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-neutral-100 last:border-0">
              <td className="px-4 py-3">
                <p className="font-mono text-xs text-neutral-700">{order.id.slice(0, 8)}…</p>
                {order.entitlementGrantError ? (
                  <p className="mt-1 text-xs text-destructive-foreground">
                    Ошибка выдачи доступа
                  </p>
                ) : null}
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/admin/users/${order.userId}`}
                  className="text-primary hover:underline"
                >
                  {order.userEmail}
                </Link>
              </td>
              <td className="px-4 py-3 font-medium">{formatPrice(order.totalKopecks)}</td>
              <td className="px-4 py-3">
                <Badge
                  variant="secondary"
                  className={cn(
                    "border-0",
                    order.status === "paid"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-neutral-100 text-neutral-700",
                  )}
                >
                  {STATUS_LABEL[order.status]}
                </Badge>
              </td>
              <td className="px-4 py-3 text-neutral-600">{formatDateTime(order.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
