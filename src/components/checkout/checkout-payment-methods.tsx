import { CreditCard, QrCode } from "lucide-react";

import { CheckoutSectionCard } from "@/components/checkout/checkout-section-card";
import type { YookassaPaymentMethod } from "@/lib/payments/yookassa/types";
import { cn } from "@/lib/utils";

type CheckoutPaymentMethodsProps = {
  value: YookassaPaymentMethod;
  onChange: (value: YookassaPaymentMethod) => void;
  disabled?: boolean;
};

const METHODS: Array<{
  id: YookassaPaymentMethod;
  title: string;
  description: string;
  icon: typeof CreditCard;
}> = [
  {
    id: "bank_card",
    title: "Банковская карта",
    description: "Visa, Mastercard, Мир",
    icon: CreditCard,
  },
  {
    id: "sbp",
    title: "СБП (быстрые платежи)",
    description: "Оплата через банк по QR-коду",
    icon: QrCode,
  },
];

export function CheckoutPaymentMethods({
  value,
  onChange,
  disabled,
}: CheckoutPaymentMethodsProps) {
  return (
    <CheckoutSectionCard
      step={2}
      title="Способ оплаты"
      description="Выберите удобный способ оплаты"
    >
      <div className="space-y-3" role="radiogroup" aria-label="Способ оплаты">
        {METHODS.map((method) => {
          const Icon = method.icon;
          const isSelected = value === method.id;

          return (
            <label
              key={method.id}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
                isSelected
                  ? "border-primary bg-blue-50/50"
                  : "border-neutral-200 bg-white hover:border-neutral-300",
                disabled && "pointer-events-none opacity-60",
              )}
            >
              <input
                type="radio"
                name="payment-method"
                value={method.id}
                checked={isSelected}
                disabled={disabled}
                className="mt-1 size-4 accent-primary"
                onChange={() => onChange(method.id)}
              />
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white border border-neutral-200">
                <Icon className="size-5 text-primary" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-foreground">{method.title}</span>
                <span className="mt-0.5 block text-sm text-neutral-600">{method.description}</span>
              </span>
            </label>
          );
        })}
      </div>
    </CheckoutSectionCard>
  );
}
