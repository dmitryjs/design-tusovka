"use client";

import Link from "next/link";
import { Play, ShieldCheck } from "lucide-react";
import { useState, useTransition } from "react";

import { addToCartAction } from "@/app/actions/cart";
import { claimFreeProductAction } from "@/app/actions/entitlements";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatPrice } from "@/lib/catalog/format";
import type { PaidProductCartState } from "@/lib/cart/types";
import type { FreeProductClaimState } from "@/lib/entitlements/types";
import { cn } from "@/lib/utils";

type TaskAccessCardProps = {
  slug: string;
  priceKopecks: number;
  hasFullAccess: boolean;
  claimState: FreeProductClaimState;
  cartState: PaidProductCartState;
  signInReturnPath: string;
  className?: string;
};

function resolveStatusBadge(
  priceKopecks: number,
  claimState: FreeProductClaimState,
  cartState: PaidProductCartState,
  hasFullAccess: boolean,
): string | null {
  if (hasFullAccess && priceKopecks > 0) {
    return "Куплено";
  }

  if (claimState === "claimed") {
    return "В библиотеке";
  }

  if (cartState === "in_library") {
    return "Куплено";
  }

  if (cartState === "in_cart") {
    return "В корзине";
  }

  if (priceKopecks === 0) {
    return "Бесплатно";
  }

  return null;
}

export function TaskAccessCard({
  slug,
  priceKopecks,
  hasFullAccess,
  claimState,
  cartState,
  signInReturnPath,
  className,
}: TaskAccessCardProps) {
  const [claimUiState, setClaimUiState] = useState(claimState);
  const [cartUiState, setCartUiState] = useState(cartState);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isFree = priceKopecks === 0;
  const statusBadge = resolveStatusBadge(
    priceKopecks,
    claimUiState,
    cartUiState,
    hasFullAccess,
  );

  function handleClaim() {
    setError(null);
    startTransition(async () => {
      const result = await claimFreeProductAction(slug, "task");

      if (result.ok) {
        setClaimUiState("claimed");
        return;
      }

      if (result.code === "unauthenticated") {
        setClaimUiState("guest");
      }

      setError(result.message ?? "Не удалось добавить задание в библиотеку.");
    });
  }

  function handleAddToCart() {
    setError(null);
    startTransition(async () => {
      const result = await addToCartAction(slug, "task");

      if (result.ok) {
        setCartUiState("in_cart");
        return;
      }

      if (result.code === "unauthenticated") {
        setCartUiState("guest");
      }

      if (result.code === "already_owned") {
        setCartUiState("in_library");
      }

      setError(result.message ?? "Не удалось добавить в корзину.");
    });
  }

  function renderPrimaryAction() {
    if (hasFullAccess) {
      return (
        <Link href="#task-brief" className={cn(buttonVariants(), "w-full")}>
          <Play className="size-4 shrink-0" aria-hidden />
          Начать задание
        </Link>
      );
    }

    if (isFree) {
      if (claimUiState === "guest") {
        return (
          <Link
            href={`/auth/sign-in?next=${encodeURIComponent(signInReturnPath)}`}
            className={cn(buttonVariants(), "w-full")}
          >
            Войти, чтобы сохранить
          </Link>
        );
      }

      if (claimUiState === "claimed") {
        return (
          <Link href="#task-brief" className={cn(buttonVariants(), "w-full")}>
            <Play className="size-4 shrink-0" aria-hidden />
            Начать задание
          </Link>
        );
      }

      return (
        <Button
          type="button"
          className="w-full"
          disabled={isPending}
          onClick={handleClaim}
        >
          {isPending ? "Добавляем…" : "Получить бесплатно"}
        </Button>
      );
    }

    if (cartUiState === "guest") {
      return (
        <Link
          href={`/auth/sign-in?next=${encodeURIComponent(signInReturnPath)}`}
          className={cn(buttonVariants(), "w-full")}
        >
          Войти, чтобы купить
        </Link>
      );
    }

    if (cartUiState === "in_library") {
      return (
        <Link href="#task-brief" className={cn(buttonVariants(), "w-full")}>
          <Play className="size-4 shrink-0" aria-hidden />
          Начать задание
        </Link>
      );
    }

    if (cartUiState === "in_cart") {
      return (
        <Link href="/cart" className={cn(buttonVariants({ variant: "secondary" }), "w-full")}>
          Перейти в корзину
        </Link>
      );
    }

    return (
      <Button
        type="button"
        className="w-full"
        disabled={isPending}
        onClick={handleAddToCart}
      >
        {isPending ? "Добавляем…" : `Купить за ${formatPrice(priceKopecks)}`}
      </Button>
    );
  }

  function renderSecondaryActions() {
    const actions: React.ReactNode[] = [];

    if (hasFullAccess && isFree && claimUiState !== "claimed") {
      actions.push(
        <Link
          key="read"
          href="#task-brief"
          className={cn(buttonVariants({ variant: "outline" }), "w-full")}
        >
          <Play className="size-4 shrink-0" aria-hidden />
          Открыть бриф
        </Link>,
      );
    }

    const showLibraryLink =
      claimUiState === "claimed" || cartUiState === "in_library";

    if (showLibraryLink) {
      actions.push(
        <Link
          key="library"
          href="/profile/library"
          className={cn(buttonVariants({ variant: "outline" }), "w-full")}
        >
          Открыть в библиотеке
        </Link>,
      );
    }

    if (actions.length === 0) {
      return null;
    }

    return <div className="flex flex-col gap-2">{actions}</div>;
  }

  const ownedPaid = !isFree && (hasFullAccess || cartUiState === "in_library");
  const ownedFree = isFree && claimUiState === "claimed";

  return (
    <aside
      className={cn(
        "rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5",
        className,
      )}
      aria-label="Доступ к заданию"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <h2 className="text-base font-semibold text-foreground">
          {hasFullAccess || isFree ? "Доступ к заданию" : "Купить задание"}
        </h2>
        {statusBadge ? (
          <Badge
            variant="secondary"
            className={cn(
              ownedPaid || ownedFree
                ? "bg-emerald-50 text-emerald-700"
                : cartUiState === "in_cart"
                  ? "bg-blue-50 text-primary"
                  : undefined,
            )}
          >
            {statusBadge}
          </Badge>
        ) : null}
      </div>

      {!hasFullAccess && !isFree ? (
        <div className="mb-4">
          <span className="text-3xl font-semibold text-foreground">
            {formatPrice(priceKopecks)}
          </span>
          <p className="mt-1 text-sm text-neutral-500">
            Полный бриф, требования к сдаче и критерии проверки
          </p>
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        {renderPrimaryAction()}
        {renderSecondaryActions()}
      </div>

      {error ? (
        <p className="mt-3 text-sm text-destructive-foreground" role="alert">
          {error}
        </p>
      ) : null}

      {!isFree && !hasFullAccess && cartUiState === "available" ? (
        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-neutral-500">
          <ShieldCheck className="size-3.5 shrink-0" aria-hidden />
          Безопасная оплата
        </p>
      ) : null}

      {isFree && hasFullAccess && claimUiState !== "claimed" ? (
        <p className="mt-3 text-xs leading-5 text-neutral-500">
          Бриф доступен без покупки. Сохраните задание в библиотеку для быстрого доступа.
        </p>
      ) : null}
    </aside>
  );
}
