import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CartItemView } from "@/lib/cart/types";
import {
  formatPrice,
  getKindLabel,
  getLevelLabel,
  getMaterialFormatLabel,
} from "@/lib/catalog/format";
import {
  getMaterialCoverPlaceholderClass,
  resolveMaterialCoverUrl,
} from "@/lib/catalog/material-cover";
import { getCatalogItemHref } from "@/lib/catalog/paths";
import { resolveTaskCardVisual } from "@/lib/catalog/task-card-visual";
import { cn } from "@/lib/utils";

type CartItemCardProps = {
  item: CartItemView;
  disabled?: boolean;
  onRemove: (cartItemId: string) => void;
};

const KIND_BADGE_CLASS: Record<CartItemView["kind"], string> = {
  material: "bg-blue-50 text-blue-700",
  task: "bg-orange-50 text-orange-700",
};

export function CartItemCard({ item, disabled, onRemove }: CartItemCardProps) {
  const href = getCatalogItemHref(item.kind, item.slug);
  const coverUrl =
    item.kind === "material" ? resolveMaterialCoverUrl(item.coverPath) : null;

  const metaLine =
    item.kind === "material" && item.materialFormat
      ? getMaterialFormatLabel(item.materialFormat)
      : item.kind === "task" && item.taskLevel && item.taskLevel !== "all"
        ? getLevelLabel(item.taskLevel)
        : null;

  const TaskIcon =
    item.kind === "task" ? resolveTaskCardVisual(item.slug, item.title).Icon : null;
  const taskVisual =
    item.kind === "task" ? resolveTaskCardVisual(item.slug, item.title) : null;

  return (
    <article className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-5">
      <div className="flex gap-4">
        <Link
          href={href}
          className="relative block size-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100 sm:size-24"
          aria-label={`Открыть «${item.title}»`}
        >
          {coverUrl ? (
            <Image src={coverUrl} alt="" fill sizes="96px" className="object-cover" />
          ) : item.kind === "material" && item.materialFormat ? (
            <div
              className={cn(
                "flex h-full w-full items-center justify-center px-2 text-center text-[11px] leading-4 font-medium",
                getMaterialCoverPlaceholderClass(item.materialFormat),
              )}
            >
              {getMaterialFormatLabel(item.materialFormat)}
            </div>
          ) : taskVisual && TaskIcon ? (
            <div
              className={cn(
                "flex h-full w-full items-center justify-center",
                taskVisual.containerClassName,
              )}
            >
              <TaskIcon className={cn("size-6", taskVisual.iconClassName)} aria-hidden />
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-xs text-neutral-500">
              {getKindLabel(item.kind)}
            </div>
          )}
        </Link>

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="space-y-2">
            <Badge
              variant="secondary"
              className={cn("border-0", KIND_BADGE_CLASS[item.kind])}
            >
              {getKindLabel(item.kind)}
            </Badge>
            <div>
              <Link
                href={href}
                className="line-clamp-2 text-base font-semibold leading-6 text-foreground hover:text-primary"
              >
                {item.title}
              </Link>
              {metaLine ? (
                <p className="mt-1 text-sm text-neutral-500">{metaLine}</p>
              ) : null}
              {item.description ? (
                <p className="mt-1 line-clamp-2 text-sm leading-5 text-neutral-600">
                  {item.description}
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between gap-3">
            <p className="text-lg font-semibold text-foreground">
              {formatPrice(item.priceKopecks)}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 text-neutral-500 hover:text-destructive-foreground"
              disabled={disabled}
              aria-label={`Удалить «${item.title}» из корзины`}
              onClick={() => onRemove(item.id)}
            >
              <Trash2 className="size-4" aria-hidden />
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
