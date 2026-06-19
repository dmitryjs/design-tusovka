"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { startYookassaPaymentAction } from "@/app/actions/payments";
import { Button } from "@/components/ui/button";

type PayOrderButtonProps = {
  orderId: string;
  label?: string;
  variant?: "default" | "secondary";
  size?: "default" | "sm";
};

export function PayOrderButton({
  orderId,
  label = "Оплатить",
  variant = "default",
  size = "default",
}: PayOrderButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handlePay() {
    setError(null);
    startTransition(async () => {
      const result = await startYookassaPaymentAction(orderId);

      if (!result.ok) {
        setError(result.message);
        return;
      }

      router.refresh();
      window.location.assign(result.redirectUrl);
    });
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant={variant}
        size={size}
        disabled={isPending}
        onClick={handlePay}
      >
        {isPending ? "Переход к оплате…" : label}
      </Button>
      {error ? (
        <p className="text-sm text-destructive-foreground" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
