"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  createPendingOrderAction,
  removeFromCartAction,
} from "@/app/actions/cart";
import { startYookassaPaymentAction } from "@/app/actions/payments";
import { Button } from "@/components/ui/button";
import { formatPrice, getKindLabel } from "@/lib/catalog/format";
import { getCatalogItemHref } from "@/lib/catalog/paths";
import type { CartItemView } from "@/lib/cart/types";
import { cn } from "@/lib/utils";

import { CatalogEmptyPanel } from "@/components/catalog/catalog-detail-shell";

type CartViewProps = {
  items: CartItemView[];
  error?: string | null;
  paymentsEnabled: boolean;
};

export function CartView({ items, error, paymentsEnabled }: CartViewProps) {
  const router = useRouter();
  const [localItems, setLocalItems] = useState(items);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [isRemoving, startRemove] = useTransition();
  const [isCheckingOut, startCheckout] = useTransition();

  const totalKopecks = localItems.reduce(
    (sum, item) => sum + item.priceKopecks,
    0,
  );

  function handleRemove(cartItemId: string) {
    setRemoveError(null);
    startRemove(async () => {
      const result = await removeFromCartAction(cartItemId);

      if (!result.ok) {
        setRemoveError(result.message ?? "Не удалось удалить");
        return;
      }

      setLocalItems((current) => current.filter((item) => item.id !== cartItemId));
      router.refresh();
    });
  }

  function handleCheckout() {
    setCheckoutMessage(null);
    setCheckoutSuccess(false);
    setCreatedOrderId(null);
    startCheckout(async () => {
      const result = await createPendingOrderAction();

      if (!result.ok) {
        setCheckoutMessage(result.message ?? "Не удалось создать заказ");
        return;
      }

      const orderId = result.orderId;
      if (!orderId) {
        setCheckoutMessage("Заказ создан, но не удалось получить его идентификатор.");
        setCheckoutSuccess(true);
        setLocalItems([]);
        router.refresh();
        return;
      }

      setCreatedOrderId(orderId);
      setLocalItems([]);

      if (!paymentsEnabled) {
        setCheckoutSuccess(true);
        setCheckoutMessage(
          "Заказ создан. Платежи не настроены — оплата будет доступна позже.",
        );
        router.refresh();
        return;
      }

      const payment = await startYookassaPaymentAction(orderId);

      if (!payment.ok) {
        setCheckoutSuccess(true);
        setCheckoutMessage(
          payment.code === "payments_not_configured"
            ? "Заказ создан. Платежи не настроены."
            : (payment.message ?? "Заказ создан, но не удалось начать оплату."),
        );
        router.refresh();
        return;
      }

      window.location.assign(payment.redirectUrl);
    });
  }

  if (error) {
    return (
      <CatalogEmptyPanel title="Не удалось загрузить корзину" description={error} />
    );
  }

  if (localItems.length === 0 && !checkoutSuccess) {
    return (
      <CatalogEmptyPanel
        title="Корзина пуста"
        description="Добавьте платный материал или задание со страницы продукта."
      />
    );
  }

  return (
    <div className="space-y-6">
      {checkoutMessage ? (
        <div
          className={cn(
            "rounded-xl border px-4 py-3 text-sm",
            checkoutSuccess
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-destructive-border bg-destructive-bg text-destructive-foreground",
          )}
          role="status"
        >
          {checkoutMessage}
          {checkoutSuccess ? (
            <div className="mt-2 flex flex-wrap gap-3">
              <Link href="/profile/orders" className="font-medium text-primary hover:underline">
                Мои заказы
              </Link>
              {createdOrderId && paymentsEnabled ? (
                <Link
                  href={`/checkout/success?order_id=${createdOrderId}`}
                  className="font-medium text-primary hover:underline"
                >
                  Статус оплаты
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {localItems.length > 0 ? (
        <>
          <ul className="space-y-3">
            {localItems.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-3 rounded-xl border border-neutral-300 bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1">
                  <p className="text-xs text-neutral-500">{getKindLabel(item.kind)}</p>
                  <Link
                    href={getCatalogItemHref(item.kind, item.slug)}
                    className="text-base font-semibold text-foreground hover:text-primary"
                  >
                    {item.title}
                  </Link>
                  <p className="text-sm font-medium">{formatPrice(item.priceKopecks)}</p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={isRemoving || isCheckingOut}
                  onClick={() => handleRemove(item.id)}
                >
                  Удалить
                </Button>
              </li>
            ))}
          </ul>

          {removeError ? (
            <p className="text-sm text-destructive-foreground" role="alert">
              {removeError}
            </p>
          ) : null}

          <div className="flex flex-col gap-4 border-t border-neutral-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-lg font-semibold text-foreground">
              Итого: {formatPrice(totalKopecks)}
            </p>
            <Button
              type="button"
              disabled={isCheckingOut || isRemoving}
              onClick={handleCheckout}
            >
              {isCheckingOut
                ? paymentsEnabled
                  ? "Переход к оплате…"
                  : "Создаём заказ…"
                : paymentsEnabled
                  ? "Перейти к оплате"
                  : "Оформить заказ"}
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
}
