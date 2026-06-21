import Link from "next/link";
import {
  Infinity,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cartItemsCountLabel } from "@/lib/cart/cart-utils";
import { formatPrice } from "@/lib/catalog/format";
import { cn } from "@/lib/utils";

type CartOrderSummaryProps = {
  itemCount: number;
  totalKopecks: number;
  isCheckingOut: boolean;
  isRemoving: boolean;
  paymentsEnabled: boolean;
  onCheckout: () => void;
  className?: string;
};

function TrustRow({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-2.5 text-sm leading-5 text-neutral-700">
      <span className="mt-0.5 shrink-0 text-neutral-400" aria-hidden>
        {icon}
      </span>
      <span>{children}</span>
    </li>
  );
}

export function CartOrderSummary({
  itemCount,
  totalKopecks,
  isCheckingOut,
  isRemoving,
  paymentsEnabled,
  onCheckout,
  className,
}: CartOrderSummaryProps) {
  const checkoutLabel = isCheckingOut
    ? paymentsEnabled
      ? "Переход к оплате…"
      : "Создаём заказ…"
    : "Перейти к оплате";

  return (
    <aside className={cn("flex flex-col gap-6", className)}>
      <section className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="mb-4 text-base font-semibold text-foreground">Ваш заказ</h2>

        <dl className="space-y-2 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-neutral-600">
              {itemCount} {cartItemsCountLabel(itemCount)}
            </dt>
            <dd className="font-medium text-foreground">{formatPrice(totalKopecks)}</dd>
          </div>
        </dl>

        <div className="my-4 border-t border-neutral-200 pt-4">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm text-neutral-600">Итого</span>
            <span className="text-2xl font-semibold text-foreground">
              {formatPrice(totalKopecks)}
            </span>
          </div>
          <p className="mt-2 text-xs leading-5 text-neutral-500">
            НДС не облагается (ст. 346.11 НК РФ)
          </p>
        </div>

        <div className="mb-4 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-3">
          <p className="flex gap-2 text-xs leading-5 text-emerald-900">
            <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>
              Безопасная оплата. Мы не храним данные карт. Платежи проходят через
              ЮKassa.
            </span>
          </p>
        </div>

        <Button
          type="button"
          className="w-full"
          disabled={isCheckingOut || isRemoving || itemCount === 0}
          onClick={onCheckout}
        >
          {checkoutLabel}
        </Button>

        <p className="mt-3 text-center text-xs leading-5 text-neutral-500">
          Нажимая кнопку, вы соглашаетесь с{" "}
          <Link href="/offer" className="text-primary hover:underline">
            офертой
          </Link>{" "}
          и{" "}
          <Link href="/privacy" className="text-primary hover:underline">
            политикой конфиденциальности
          </Link>
          .
        </p>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white px-4 py-4 sm:px-5">
        <ul className="flex flex-col gap-3">
          <TrustRow icon={<Zap className="size-4" />}>
            Мгновенный доступ после оплаты
          </TrustRow>
          <TrustRow icon={<Infinity className="size-4" />}>
            Доступ к купленным материалам навсегда
          </TrustRow>
          <TrustRow icon={<Sparkles className="size-4" />}>
            Обновления уже купленного контента бесплатно
          </TrustRow>
        </ul>
      </section>

      <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-4 sm:px-5">
        <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <MessageCircle className="size-4 text-primary" aria-hidden />
          Нужна помощь?
        </p>
        <p className="mt-1 text-sm leading-5 text-neutral-600">
          Напишите нам — мы на связи.
        </p>
        <Link
          href="/support"
          className={cn(buttonVariants({ variant: "outline" }), "mt-3 w-full bg-white")}
        >
          Связаться с поддержкой
        </Link>
      </div>
    </aside>
  );
}
