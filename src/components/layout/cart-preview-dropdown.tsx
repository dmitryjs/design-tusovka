"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { formatPrice, getKindLabel } from "@/lib/catalog/format";
import { resolveMaterialCoverUrl } from "@/lib/catalog/material-cover";
import { getCatalogItemHref } from "@/lib/catalog/paths";
import { getPreferredSectionPageHref } from "@/lib/catalog/section-pages";
import type { CartItemView } from "@/lib/cart/types";
import { cn } from "@/lib/utils";

type CartPreviewDropdownProps = {
  items: CartItemView[];
  itemCount: number;
};

function resolveItemHref(item: CartItemView): string {
  if (item.kind === "section") {
    return getPreferredSectionPageHref(item.slug);
  }

  return getCatalogItemHref(item.kind, item.slug);
}

export function CartPreviewDropdown({ items, itemCount }: CartPreviewDropdownProps) {
  const totalKopecks = items.reduce((sum, item) => sum + item.priceKopecks, 0);

  return (
    <div className="group relative">
      <Link
        href="/cart"
        aria-label={
          itemCount > 0
            ? `Корзина, ${itemCount} ${itemCount === 1 ? "товар" : "товаров"}`
            : "Корзина"
        }
        className={cn(
          "relative flex size-9 shrink-0 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900",
        )}
      >
        <ShoppingCart className="size-[18px]" strokeWidth={1.75} aria-hidden />
        {itemCount > 0 ? (
          <span className="absolute top-1 right-1 size-2 rounded-full bg-primary" aria-hidden />
        ) : null}
      </Link>

      <div
        className={cn(
          "pointer-events-none invisible absolute top-full right-0 z-50 mt-2 hidden w-[min(20rem,calc(100vw-2rem))] translate-y-1 opacity-0 transition-all duration-150 lg:block",
          "group-hover:pointer-events-auto group-hover:visible group-hover:translate-y-0 group-hover:opacity-100",
          "group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100",
        )}
      >
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg">
          <div className="border-b border-neutral-200 px-4 py-3">
            <p className="text-sm font-semibold text-foreground">Корзина</p>
            {itemCount > 0 ? (
              <p className="text-xs text-neutral-500">
                {itemCount} {itemCount === 1 ? "товар" : itemCount < 5 ? "товара" : "товаров"}
              </p>
            ) : null}
          </div>

          {items.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-neutral-500">Корзина пуста</div>
          ) : (
            <ul className="max-h-72 overflow-y-auto py-1">
              {items.map((item) => {
                const coverUrl = resolveMaterialCoverUrl(item.coverPath);

                return (
                  <li key={item.id}>
                    <Link
                      href={resolveItemHref(item)}
                      className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-neutral-50"
                    >
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                        {coverUrl ? (
                          <Image
                            src={coverUrl}
                            alt=""
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center px-1 text-center text-[10px] leading-3 text-neutral-500">
                            {getKindLabel(item.kind)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-medium text-foreground">
                          {item.title}
                        </p>
                        <p className="mt-0.5 text-xs text-neutral-500">{getKindLabel(item.kind)}</p>
                      </div>
                      <span className="shrink-0 text-sm font-medium text-foreground">
                        {formatPrice(item.priceKopecks)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="border-t border-neutral-200 px-4 py-3">
            {items.length > 0 ? (
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="text-neutral-600">Итого</span>
                <span className="font-semibold text-foreground">{formatPrice(totalKopecks)}</span>
              </div>
            ) : null}
            <Link href="/cart" className={cn(buttonVariants(), "w-full")}>
              {items.length > 0 ? "Перейти в корзину" : "Открыть корзину"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
