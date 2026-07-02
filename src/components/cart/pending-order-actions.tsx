"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { cancelPendingOrderAction } from "@/app/actions/cart";
import { PayOrderButton } from "@/components/payments/pay-order-button";
import { Button } from "@/components/ui/button";

type PendingOrderActionsProps = {
  orderId: string;
  paymentsEnabled: boolean;
};

export function PendingOrderActions({ orderId, paymentsEnabled }: PendingOrderActionsProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCancel() {
    setError(null);
    startTransition(async () => {
      const result = await cancelPendingOrderAction(orderId);

      if (!result.ok) {
        setError(result.message ?? "Не удалось отменить заказ");
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {paymentsEnabled ? <PayOrderButton orderId={orderId} size="sm" /> : null}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={handleCancel}
        >
          {isPending ? "Отменяем…" : "Удалить заказ"}
        </Button>
      </div>

      {!paymentsEnabled ? (
        <p className="text-sm text-neutral-600">
          Платежи не настроены. Заказ сохранён — оплата будет доступна позже. Вы можете удалить
          заказ, чтобы вернуть товары в корзину.
        </p>
      ) : null}

      {error ? (
        <p className="text-sm text-destructive-foreground" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
