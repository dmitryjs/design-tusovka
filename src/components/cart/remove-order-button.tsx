"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { deleteMyOrderAction } from "@/app/actions/cart";
import { Button } from "@/components/ui/button";

type RemoveOrderButtonProps = {
  orderId: string;
};

export function RemoveOrderButton({ orderId }: RemoveOrderButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleRemove() {
    setError(null);
    startTransition(async () => {
      const result = await deleteMyOrderAction(orderId);

      if (!result.ok) {
        setError(result.message ?? "Не удалось удалить заказ");
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={handleRemove}
      >
        {isPending ? "Удаляем…" : "Удалить из списка"}
      </Button>

      {error ? (
        <p className="text-sm text-destructive-foreground" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
