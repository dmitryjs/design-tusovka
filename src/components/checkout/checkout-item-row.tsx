import Image from "next/image";
import Link from "next/link";

import { formatPrice, getKindLabel } from "@/lib/catalog/format";
import {
  getMaterialCoverPlaceholderClass,
  resolveMaterialCoverUrl,
} from "@/lib/catalog/material-cover";
import { getCatalogItemHref } from "@/lib/catalog/paths";
import { resolveTaskCardVisual } from "@/lib/catalog/task-card-visual";
import type { CartItemView } from "@/lib/cart/types";
import { getCheckoutItemSubtitle } from "@/lib/checkout/labels";
import { cn } from "@/lib/utils";

type CheckoutItemRowProps = {
  item: CartItemView;
  compact?: boolean;
};

export function CheckoutItemRow({ item, compact = false }: CheckoutItemRowProps) {
  const href = getCatalogItemHref(item.kind, item.slug);
  const coverUrl =
    item.kind === "material" ? resolveMaterialCoverUrl(item.coverPath) : null;
  const TaskIcon =
    item.kind === "task" ? resolveTaskCardVisual(item.slug, item.title).Icon : null;
  const taskVisual =
    item.kind === "task" ? resolveTaskCardVisual(item.slug, item.title) : null;

  return (
    <div className={cn("flex gap-3", compact ? "items-center" : "items-start")}>
      <Link
        href={href}
        className={cn(
          "relative block shrink-0 overflow-hidden rounded-lg bg-neutral-100",
          compact ? "size-10" : "size-14",
        )}
        aria-label={`Открыть «${item.title}»`}
      >
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt=""
            fill
            sizes={compact ? "40px" : "56px"}
            className="object-cover"
          />
        ) : taskVisual && TaskIcon ? (
          <div
            className={cn(
              "flex h-full w-full items-center justify-center",
              taskVisual.containerClassName,
            )}
          >
            <TaskIcon className={cn(compact ? "size-4" : "size-5", taskVisual.iconClassName)} aria-hidden />
          </div>
        ) : item.kind === "material" && item.materialFormat ? (
          <div
            className={cn(
              "flex h-full w-full items-center justify-center px-1 text-center text-[10px] font-medium",
              getMaterialCoverPlaceholderClass(item.materialFormat),
            )}
          >
            {getKindLabel(item.kind).slice(0, 3)}
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] text-neutral-500">
            {getKindLabel(item.kind).slice(0, 3)}
          </div>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <Link
          href={href}
          className={cn(
            "font-medium text-foreground hover:text-primary",
            compact ? "line-clamp-1 text-sm" : "line-clamp-2 text-sm leading-5",
          )}
        >
          {item.title}
        </Link>
        {!compact ? (
          <p className="mt-0.5 text-xs text-neutral-500">{getCheckoutItemSubtitle(item)}</p>
        ) : null}
      </div>

      <div className={cn("shrink-0 text-right", compact ? "text-sm" : "space-y-1")}>
        {!compact ? <p className="text-xs text-neutral-500">1</p> : null}
        <p className={cn("font-semibold text-foreground", compact ? "text-sm" : "text-sm")}>
          {formatPrice(item.priceKopecks)}
        </p>
      </div>
    </div>
  );
}
