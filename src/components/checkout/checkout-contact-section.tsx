import Link from "next/link";

import { CheckoutSectionCard } from "@/components/checkout/checkout-section-card";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import type { CheckoutContact } from "@/lib/checkout/contact";
import { cn } from "@/lib/utils";

type CheckoutContactSectionProps = {
  contact: CheckoutContact;
  editHref?: string;
  readOnly?: boolean;
};

export function CheckoutContactSection({
  contact,
  editHref = "/checkout",
  readOnly = false,
}: CheckoutContactSectionProps) {
  return (
    <CheckoutSectionCard
      step={1}
      title="Контактные данные"
      action={
        readOnly ? (
          <Link href={editHref} className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}>
            Изменить
          </Link>
        ) : null
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="checkout-email" className="text-sm font-medium text-foreground">
            Email
          </label>
          <Input
            id="checkout-email"
            type="email"
            value={contact.email}
            readOnly
            className="bg-neutral-50"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="checkout-name" className="text-sm font-medium text-foreground">
            Имя
          </label>
          <Input
            id="checkout-name"
            type="text"
            value={contact.displayName ?? "Не указано"}
            readOnly
            className="bg-neutral-50"
          />
        </div>
      </div>
      {!contact.emailConfirmed ? (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          Подтвердите email в письме от сервиса — без этого оплата недоступна.
        </p>
      ) : (
        <p className="mt-4 text-xs text-neutral-500">
          Email используется для чека и доступа к материалам. Для смены email напишите в{" "}
          <Link href="/support" className="font-medium text-primary hover:underline">
            поддержку
          </Link>
          .
        </p>
      )}
    </CheckoutSectionCard>
  );
}
