import Link from "next/link";

import { PayOrderButton } from "@/components/payments/pay-order-button";
import { CatalogEmptyPanel } from "@/components/catalog/catalog-detail-shell";
import { getOrderStatusLabel } from "@/lib/cart/messages";
import { formatPrice, getKindLabel } from "@/lib/catalog/format";
import { getCatalogItemHref } from "@/lib/catalog/paths";
import type { OrderView } from "@/lib/cart/types";
import { isYookassaConfigured } from "@/lib/payments/yookassa/config";

export function OrdersList({
  orders,
  error,
}: {
  orders: OrderView[];
  error?: string | null;
}) {
  const paymentsEnabled = isYookassaConfigured();

  if (error) {
    return (
      <CatalogEmptyPanel title="Не удалось загрузить заказы" description={error} />
    );
  }

  if (orders.length === 0) {
    return (
      <CatalogEmptyPanel
        title="Заказов пока нет"
        description="После оформления корзины заказы появятся здесь."
      />
    );
  }

  return (
    <ul className="space-y-4">
      {orders.map((order) => (
        <li
          key={order.id}
          className="rounded-xl border border-neutral-300 bg-card p-4 sm:p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-sm text-neutral-500">
                {new Intl.DateTimeFormat("ru-RU", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(order.createdAt))}
              </p>
              <p className="mt-1 text-base font-semibold text-foreground">
                {getOrderStatusLabel(order.status)}
              </p>
            </div>
            <p className="text-base font-semibold">{formatPrice(order.totalKopecks)}</p>
          </div>
          <ul className="mt-4 space-y-2 border-t border-neutral-200 pt-4">
            {order.items.map((item) => (
              <li key={item.id} className="text-sm">
                {item.slug && item.kind ? (
                  <Link
                    href={getCatalogItemHref(item.kind, item.slug)}
                    className="font-medium text-foreground hover:text-primary"
                  >
                    {item.title}
                  </Link>
                ) : (
                  <span className="font-medium text-foreground">{item.title}</span>
                )}
                <span className="text-neutral-500">
                  {" "}
                  · {item.kind ? getKindLabel(item.kind) : "Продукт"} ·{" "}
                  {formatPrice(item.priceKopecks)}
                </span>
              </li>
            ))}
          </ul>
          {order.status === "pending_payment" ? (
            <div className="mt-4 border-t border-neutral-200 pt-4">
              {paymentsEnabled ? (
                <PayOrderButton orderId={order.id} size="sm" />
              ) : (
                <p className="text-sm text-neutral-600">
                  Платежи не настроены. Заказ сохранён — оплата будет доступна позже.
                </p>
              )}
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
