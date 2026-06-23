"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { addToCartAction } from "@/app/actions/cart";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatPrice } from "@/lib/catalog/format";
import type { PaidProductCartState } from "@/lib/cart/types";
import { cn } from "@/lib/utils";

type SectionPurchaseCtaProps = {
  catalogSlug: string;
  priceKopecks: number;
  cartState: PaidProductCartState;
  signInReturnPath: string;
  className?: string;
  fullWidth?: boolean;
  label?: string;
};

export function SectionPurchaseCta({
  catalogSlug,
  priceKopecks,
  cartState,
  signInReturnPath,
  className,
  fullWidth = false,
  label,
}: SectionPurchaseCtaProps) {
  const router = useRouter();
  const [state, setState] = useState(cartState);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const buttonClassName = cn(fullWidth ? "w-full" : "w-full sm:w-auto", className);
  const buyLabel = label ?? `Купить раздел — ${formatPrice(priceKopecks)}`;

  if (state === "hidden") {
    return null;
  }

  if (state === "guest") {
    return (
      <div className="space-y-2">
        <Link
          href={`/auth/sign-in?next=${encodeURIComponent(signInReturnPath)}`}
          className={cn(
            buttonVariants(),
            buttonClassName,
            "inline-flex h-10 items-center justify-center",
          )}
        >
          Войти, чтобы купить
        </Link>
      </div>
    );
  }

  if (state === "in_library") {
    return (
      <Button type="button" variant="secondary" disabled className={buttonClassName}>
        Уже в библиотеке
      </Button>
    );
  }

  if (state === "in_cart") {
    return (
      <Link
        href="/cart"
        className={cn(
          buttonVariants({ variant: "secondary" }),
          buttonClassName,
          "inline-flex h-10 items-center justify-center",
        )}
      >
        В корзине — перейти
      </Link>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        disabled={isPending}
        className={buttonClassName}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await addToCartAction(catalogSlug, "section");

            if (result.ok) {
              setState("in_cart");
              router.refresh();
              return;
            }

            if (result.code === "unauthenticated") {
              setState("guest");
            }

            if (result.code === "already_owned") {
              setState("in_library");
            }

            setError(result.message ?? "Не удалось добавить в корзину.");
          });
        }}
      >
        {isPending ? "Добавляем…" : buyLabel}
      </Button>
      {error ? (
        <p className="text-sm text-destructive-foreground" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
