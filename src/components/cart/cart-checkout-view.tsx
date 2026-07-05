"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { removeFromCartAction } from "@/app/actions/cart";
import { CartItemCard } from "@/components/cart/cart-item-card";
import { CheckoutOrderSummary } from "@/components/checkout/checkout-order-summary";
import { CheckoutShell } from "@/components/checkout/checkout-shell";
import { CheckoutTrustPanel } from "@/components/checkout/checkout-trust-panel";
import { CatalogEmptyPanel } from "@/components/catalog/catalog-detail-shell";
import { buttonVariants } from "@/components/ui/button";
import { formatPrice } from "@/lib/catalog/format";
import type { CartItemView } from "@/lib/cart/types";
import { cn } from "@/lib/utils";

type CartCheckoutViewProps = {
  items: CartItemView[];
  error?: string | null;
};

export function CartCheckoutView({ items, error }: CartCheckoutViewProps) {
  const router = useRouter();
  const [localItems, setLocalItems] = useState(items);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [isRemoving, startRemove] = useTransition();

  const totalKopecks = useMemo(
    () => localItems.reduce((sum, item) => sum + item.priceKopecks, 0),
    [localItems],
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

  if (error) {
    return (
      <CatalogEmptyPanel title="Не удалось загрузить корзину" description={error} />
    );
  }

  if (localItems.length === 0) {
    return (
      <CatalogEmptyPanel
        title="Корзина пуста"
        description="Добавьте платный материал или задание со страницы продукта."
      />
    );
  }

  return (
    <CheckoutShell
      step="cart"
      title="Корзина"
      description="Проверьте состав заказа перед оформлением"
      sidebar={
        <>
          <CheckoutOrderSummary items={localItems} totalKopecks={totalKopecks} editHref="/cart" />
          <CheckoutTrustPanel />
        </>
      }
    >
      <ul className="space-y-4">
        {localItems.map((item) => (
          <li key={item.id}>
            <CartItemCard
              item={item}
              disabled={isRemoving}
              onRemove={handleRemove}
            />
          </li>
        ))}
      </ul>

      {removeError ? (
        <p className="text-sm text-destructive-foreground" role="alert">
          {removeError}
        </p>
      ) : null}

      <div className="flex flex-col gap-4 border-t border-neutral-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/#materials" className={cn(buttonVariants({ variant: "secondary" }), "w-full sm:w-auto")}>
          Продолжить покупки
        </Link>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
          <p className="text-sm text-neutral-600 sm:hidden">
            Итого: <span className="font-semibold text-foreground">{formatPrice(totalKopecks)}</span>
          </p>
          <Link href="/checkout" className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}>
            Продолжить
          </Link>
        </div>
      </div>
    </CheckoutShell>
  );
}
