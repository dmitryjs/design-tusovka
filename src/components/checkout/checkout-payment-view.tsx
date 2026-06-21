"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Lock, Zap, Headphones, Shield } from "lucide-react";

import { createPendingOrderAction } from "@/app/actions/cart";
import { startYookassaPaymentAction } from "@/app/actions/payments";
import { CheckoutContactSection } from "@/components/checkout/checkout-contact-section";
import { CheckoutItemRow } from "@/components/checkout/checkout-item-row";
import { CheckoutOrderSummary } from "@/components/checkout/checkout-order-summary";
import { CheckoutPaymentMethods } from "@/components/checkout/checkout-payment-methods";
import { CheckoutSectionCard } from "@/components/checkout/checkout-section-card";
import { CheckoutShell } from "@/components/checkout/checkout-shell";
import { CheckoutTrustPanel } from "@/components/checkout/checkout-trust-panel";
import { CatalogEmptyPanel } from "@/components/catalog/catalog-detail-shell";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatPrice } from "@/lib/catalog/format";
import type { CartItemView } from "@/lib/cart/types";
import type { CheckoutContact } from "@/lib/checkout/contact";
import type { YookassaPaymentMethod } from "@/lib/payments/yookassa/types";
import { cn } from "@/lib/utils";

type CheckoutPaymentViewProps = {
  items: CartItemView[];
  contact: CheckoutContact;
  paymentsEnabled: boolean;
  error?: string | null;
};

export function CheckoutPaymentView({
  items,
  contact,
  paymentsEnabled,
  error,
}: CheckoutPaymentViewProps) {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<YookassaPaymentMethod>("bank_card");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);
  const [isPaying, startPay] = useTransition();

  const totalKopecks = useMemo(
    () => items.reduce((sum, item) => sum + item.priceKopecks, 0),
    [items],
  );

  const canPay =
    contact.emailConfirmed &&
    termsAccepted &&
    items.length > 0 &&
    totalKopecks > 0 &&
    !isPaying;

  function handlePay() {
    setCheckoutMessage(null);
    startPay(async () => {
      const orderResult = await createPendingOrderAction();

      if (!orderResult.ok) {
        setCheckoutMessage(orderResult.message ?? "Не удалось создать заказ");
        return;
      }

      const orderId = orderResult.orderId;
      if (!orderId) {
        setCheckoutMessage("Заказ создан, но не удалось получить его идентификатор.");
        return;
      }

      if (!paymentsEnabled) {
        setCheckoutMessage("Платежи не настроены — заказ сохранён в «Мои заказы».");
        router.push("/profile/orders");
        return;
      }

      const payment = await startYookassaPaymentAction(orderId, paymentMethod);

      if (!payment.ok) {
        setCheckoutMessage(
          payment.code === "payments_not_configured"
            ? "Платежи не настроены."
            : (payment.message ?? "Не удалось начать оплату."),
        );
        router.push(`/profile/orders`);
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

  if (items.length === 0) {
    return (
      <CatalogEmptyPanel
        title="Корзина пуста"
        description="Добавьте платные материалы или задания, чтобы перейти к оплате."
      />
    );
  }

  return (
    <CheckoutShell
      step="payment"
      title="Оплата"
      description="Проверьте данные и завершите заказ"
      sidebar={
        <>
          <CheckoutOrderSummary items={items} totalKopecks={totalKopecks} />
          <CheckoutTrustPanel />
        </>
      }
    >
      <CheckoutContactSection contact={contact} readOnly editHref="/checkout" />
      <CheckoutPaymentMethods
        value={paymentMethod}
        onChange={setPaymentMethod}
        disabled={!paymentsEnabled || isPaying}
      />

      <CheckoutSectionCard step={3} title="Подтверждение заказа">
        <ul className="space-y-4 border-b border-neutral-200 pb-5">
          {items.map((item) => (
            <li key={item.id}>
              <CheckoutItemRow item={item} />
            </li>
          ))}
        </ul>

        <label className="mt-5 flex items-start gap-3 text-sm leading-5 text-neutral-700">
          <input
            type="checkbox"
            checked={termsAccepted}
            disabled={isPaying}
            className="mt-0.5 size-4 rounded border-neutral-300 accent-primary"
            onChange={(event) => setTermsAccepted(event.target.checked)}
          />
          <span>
            Я ознакомлен и согласен с условиями{" "}
            <Link href="/offer" className="font-medium text-primary hover:underline">
              оферты
            </Link>
            ,{" "}
            <Link href="/privacy" className="font-medium text-primary hover:underline">
              политики конфиденциальности
            </Link>{" "}
            и{" "}
            <Link href="/payment-and-refund" className="font-medium text-primary hover:underline">
              правил оплаты и возвратов
            </Link>
          </span>
        </label>

        <div className="mt-5 grid gap-3 border-t border-neutral-200 pt-5 sm:grid-cols-3">
          <Feature icon={Zap} label="Мгновенный доступ" />
          <Feature icon={Shield} label="Безопасная оплата" />
          <Feature icon={Headphones} label="Поддержка" />
        </div>
      </CheckoutSectionCard>

      {checkoutMessage ? (
        <p className="text-sm text-destructive-foreground" role="alert">
          {checkoutMessage}
        </p>
      ) : null}

      <div className="flex flex-col gap-4 border-t border-neutral-200 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/checkout" className={cn(buttonVariants({ variant: "secondary" }), "w-full sm:w-auto")}>
          Назад
        </Link>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[280px]">
          <Button
            type="button"
            size="lg"
            className="w-full"
            disabled={!canPay || !paymentsEnabled}
            onClick={handlePay}
          >
            <Lock className="size-4" aria-hidden />
            {isPaying ? "Переход к оплате…" : `Оплатить ${formatPrice(totalKopecks)}`}
          </Button>
          <p className="text-center text-xs text-neutral-500">
            Нажимая «Оплатить», вы соглашаетесь с условиями оферты
          </p>
        </div>
      </div>
    </CheckoutShell>
  );
}

function Feature({ icon: Icon, label }: { icon: typeof Zap; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-neutral-600">
      <Icon className="size-4 shrink-0 text-primary" aria-hidden />
      <span>{label}</span>
    </div>
  );
}
