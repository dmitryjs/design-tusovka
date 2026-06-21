"use client";

import Link from "next/link";

import { CheckoutContactSection } from "@/components/checkout/checkout-contact-section";
import { CheckoutOrderSummary } from "@/components/checkout/checkout-order-summary";
import { CheckoutShell } from "@/components/checkout/checkout-shell";
import { CheckoutTrustPanel } from "@/components/checkout/checkout-trust-panel";
import { CatalogEmptyPanel } from "@/components/catalog/catalog-detail-shell";
import { Button, buttonVariants } from "@/components/ui/button";
import type { CartItemView } from "@/lib/cart/types";
import type { CheckoutContact } from "@/lib/checkout/contact";
import { cn } from "@/lib/utils";

type CheckoutDataViewProps = {
  items: CartItemView[];
  contact: CheckoutContact;
  error?: string | null;
};

export function CheckoutDataView({ items, contact, error }: CheckoutDataViewProps) {
  const totalKopecks = items.reduce((sum, item) => sum + item.priceKopecks, 0);
  const canContinue = contact.emailConfirmed && items.length > 0;

  if (error) {
    return (
      <CatalogEmptyPanel title="Не удалось загрузить корзину" description={error} />
    );
  }

  if (items.length === 0) {
    return (
      <CatalogEmptyPanel
        title="Корзина пуста"
        description="Добавьте товары в корзину, чтобы продолжить оформление."
      />
    );
  }

  return (
    <CheckoutShell
      step="data"
      title="Контактные данные"
      description="Проверьте email и имя перед оплатой"
      sidebar={
        <>
          <CheckoutOrderSummary items={items} totalKopecks={totalKopecks} />
          <CheckoutTrustPanel />
        </>
      }
    >
      <CheckoutContactSection contact={contact} />

      <div className="flex flex-col gap-4 border-t border-neutral-200 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/cart" className={cn(buttonVariants({ variant: "secondary" }), "w-full sm:w-auto")}>
          Назад
        </Link>
        {canContinue ? (
          <Link
            href="/checkout/payment"
            className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
          >
            Перейти к оплате
          </Link>
        ) : (
          <Button type="button" size="lg" className="w-full sm:w-auto" disabled>
            Подтвердите email
          </Button>
        )}
      </div>
    </CheckoutShell>
  );
}
