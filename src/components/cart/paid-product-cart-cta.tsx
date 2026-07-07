"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { addToCartAction } from "@/app/actions/cart";
import { Button, buttonVariants } from "@/components/ui/button";
import type { PaidProductCartState } from "@/lib/cart/types";
import { cn } from "@/lib/utils";

type PaidProductCartCtaProps = {
  slug: string;
  kind: "material" | "task";
  initialState: Exclude<PaidProductCartState, "hidden">;
  signInReturnPath: string;
  className?: string;
};

export function PaidProductCartCta({
  slug,
  kind,
  initialState,
  signInReturnPath,
  className,
}: PaidProductCartCtaProps) {
  const router = useRouter();
  const [state, setState] = useState(initialState);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (state === "guest") {
    return (
      <div className={cn("space-y-2", className)}>
        <Link
          href={`/auth/sign-in?next=${encodeURIComponent(signInReturnPath)}`}
          className={cn(buttonVariants(), "w-full sm:w-auto")}
        >
          Войти, чтобы купить
        </Link>
      </div>
    );
  }

  if (state === "in_library") {
    return (
      <div className={cn("space-y-2", className)}>
        <Button type="button" variant="secondary" disabled className="w-full sm:w-auto">
          Уже в библиотеке
        </Button>
      </div>
    );
  }

  if (state === "in_cart") {
    return (
      <div className={cn("space-y-2", className)}>
        <Link href="/cart" className={cn(buttonVariants({ variant: "secondary" }), "w-full sm:w-auto")}>
          В корзине
        </Link>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Button
        type="button"
        disabled={isPending}
        className="w-full sm:w-auto"
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await addToCartAction(slug, kind);

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
        {isPending ? "Добавляем…" : "Добавить в корзину"}
      </Button>
      {error ? (
        <p className="text-sm text-destructive-foreground" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
