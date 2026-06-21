import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cartItemsCountLabel } from "@/lib/cart/cart-utils";

type CartHeaderProps = {
  itemCount: number;
};

export function CartHeader({ itemCount }: CartHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-[28px] leading-[36px] font-semibold tracking-tight text-foreground sm:text-[32px] sm:leading-[40px]">
            Корзина
          </h1>
          {itemCount > 0 ? (
            <Badge variant="secondary" className="text-sm">
              {itemCount} {cartItemsCountLabel(itemCount)}
            </Badge>
          ) : null}
        </div>
        <p className="text-base leading-6 text-neutral-600">
          Проверьте состав заказа и перейдите к оформлению.
        </p>
      </div>

      <Link
        href="/catalog"
        className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Продолжить покупки
      </Link>
    </header>
  );
}
