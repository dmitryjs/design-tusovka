import Link from "next/link";

import { PayOrderButton } from "@/components/payments/pay-order-button";
import { formatPrice } from "@/lib/catalog/format";
import { getOrderStatusLabel } from "@/lib/cart/messages";
import { isYookassaConfigured } from "@/lib/payments/yookassa/config";
import type { CheckoutOrderView } from "@/lib/payments/checkout-order";

import { CatalogEmptyPanel } from "@/components/catalog/catalog-detail-shell";

type CheckoutStatusPanelProps = {
  order: CheckoutOrderView | null;
  error?: string | null;
};

function getCheckoutMessage(order: CheckoutOrderView): {
  title: string;
  description: string;
  tone: "success" | "pending" | "error";
} {
  if (order.status === "paid") {
    return {
      title: "Оплачено",
      description:
        "Платёж подтверждён. Продукты должны появиться в библиотеке — обновите страницу профиля.",
      tone: "success",
    };
  }

  if (order.status === "failed" || order.status === "cancelled") {
    return {
      title: "Оплата не завершена",
      description: "Платёж отменён или не прошёл. Доступ не выдан.",
      tone: "error",
    };
  }

  return {
    title: "Платёж подтверждается",
    description:
      "Мы получили возврат с платёжной страницы, но окончательный статус приходит через webhook. Это может занять несколько минут.",
    tone: "pending",
  };
}

export function CheckoutStatusPanel({ order, error }: CheckoutStatusPanelProps) {
  const paymentsEnabled = isYookassaConfigured();

  if (error || !order) {
    return (
      <CatalogEmptyPanel
        title="Не удалось показать статус"
        description={error ?? "Заказ не найден"}
      />
    );
  }

  const message = getCheckoutMessage(order);
  const toneClasses =
    message.tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : message.tone === "error"
        ? "border-destructive-border bg-destructive-bg text-destructive-foreground"
        : "border-amber-200 bg-amber-50 text-amber-950";

  return (
    <div className="space-y-4">
      <div className={`rounded-xl border px-4 py-4 sm:px-5 ${toneClasses}`}>
        <h2 className="text-lg font-semibold">{message.title}</h2>
        <p className="mt-2 text-sm">{message.description}</p>
      </div>

      <div className="rounded-xl border border-neutral-300 bg-card p-4 sm:p-5">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-neutral-500">Заказ</dt>
            <dd className="font-medium text-foreground">{order.id}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">Сумма</dt>
            <dd className="font-medium text-foreground">{formatPrice(order.totalKopecks)}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">Статус заказа</dt>
            <dd className="font-medium text-foreground">{getOrderStatusLabel(order.status)}</dd>
          </div>
          {order.paymentStatus ? (
            <div>
              <dt className="text-neutral-500">Статус платежа</dt>
              <dd className="font-medium text-foreground">{order.paymentStatus}</dd>
            </div>
          ) : null}
        </dl>

        {order.status === "pending_payment" && paymentsEnabled ? (
          <div className="mt-4 border-t border-neutral-200 pt-4">
            <PayOrderButton orderId={order.id} label="Повторить оплату" />
          </div>
        ) : null}

        {order.status === "failed" || order.status === "cancelled" ? (
          <div className="mt-4 border-t border-neutral-200 pt-4">
            <Link href="/checkout/fail" className="text-sm font-medium text-primary hover:underline">
              Подробнее об ошибке оплаты
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
