import Link from "next/link";

import { CheckoutItemRow } from "@/components/checkout/checkout-item-row";
import { formatPrice } from "@/lib/catalog/format";
import type { CartItemView } from "@/lib/cart/types";
import { cartProductCountLabel } from "@/lib/checkout/labels";
import { cn } from "@/lib/utils";

type CheckoutOrderSummaryProps = {
  items: CartItemView[];
  totalKopecks: number;
  editHref?: string;
  className?: string;
};

export function CheckoutOrderSummary({
  items,
  totalKopecks,
  editHref = "/cart",
  className,
}: CheckoutOrderSummaryProps) {
  return (
    <div className={cn("rounded-xl border border-neutral-200 bg-white p-5", className)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-foreground">Ваш заказ</h2>
        <Link href={editHref} className="text-sm font-medium text-primary hover:underline">
          Изменить
        </Link>
      </div>

      <p className="mb-4 text-sm text-neutral-600">{cartProductCountLabel(items.length)}</p>

      <ul className="space-y-3 border-b border-neutral-200 pb-4">
        {items.map((item) => (
          <li key={item.id}>
            <CheckoutItemRow item={item} compact />
          </li>
        ))}
      </ul>

      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-neutral-600">Итого</dt>
          <dd className="text-xl font-semibold text-foreground">{formatPrice(totalKopecks)}</dd>
        </div>
      </dl>

      <p className="mt-3 text-xs leading-5 text-neutral-500">
        Цена фиксируется при создании заказа на сервере.
      </p>
    </div>
  );
}
