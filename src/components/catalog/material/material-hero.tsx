import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  formatPrice,
  getLevelLabel,
  getMaterialFormatLabel,
} from "@/lib/catalog/format";
import {
  resolveMaterialPriceBadgeKind,
} from "@/lib/catalog/material-detail-utils";
import { getPreferredSectionPageHref } from "@/lib/catalog/section-pages";
import type { MaterialDetail } from "@/lib/catalog/detail-queries";
import { ProductRatingBadge } from "@/components/reviews/product-rating-badge";
import type { ProductReviewStats } from "@/lib/reviews/types";
import type { FreeProductClaimState } from "@/lib/entitlements/types";
import type { PaidProductCartState } from "@/lib/cart/types";
import { cn } from "@/lib/utils";

type MaterialHeroProps = {
  material: MaterialDetail;
  claimState: FreeProductClaimState;
  cartState: PaidProductCartState;
  reviewStats: ProductReviewStats;
};

function resolveOwnedBadge(
  material: MaterialDetail,
  claimState: FreeProductClaimState,
  cartState: PaidProductCartState,
): boolean {
  if (material.priceKopecks > 0 && material.hasFullAccess) {
    return true;
  }

  if (claimState === "claimed") {
    return true;
  }

  return cartState === "in_library";
}

function resolvePriceBadgeLabel(
  kind: ReturnType<typeof resolveMaterialPriceBadgeKind>,
  priceKopecks: number,
): string {
  if (kind === "owned") {
    return "Куплено";
  }

  if (kind === "free") {
    return "Бесплатно";
  }

  return formatPrice(priceKopecks);
}

export function MaterialHero({ material, claimState, cartState, reviewStats }: MaterialHeroProps) {
  const isOwned = resolveOwnedBadge(material, claimState, cartState);
  const priceBadgeKind = resolveMaterialPriceBadgeKind(
    material.priceKopecks,
    material.hasFullAccess,
    isOwned,
  );

  return (
    <header className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">{getMaterialFormatLabel(material.format)}</Badge>
        {material.level !== "all" ? (
          <Badge variant="outline">{getLevelLabel(material.level)}</Badge>
        ) : null}
        {material.section ? (
          <Badge variant="secondary" render={<Link href={getPreferredSectionPageHref(material.section.slug)} />}>
            {material.section.title}
          </Badge>
        ) : null}
        <Badge
          variant={priceBadgeKind === "paid" ? "outline" : "default"}
          className={cn(
            priceBadgeKind !== "paid" && "bg-primary text-primary-foreground",
            priceBadgeKind === "owned" && "bg-emerald-600 text-white hover:bg-emerald-600",
          )}
        >
          {resolvePriceBadgeLabel(priceBadgeKind, material.priceKopecks)}
        </Badge>
      </div>

      <div className="space-y-3">
        <h1 className="text-[28px] leading-[36px] font-semibold tracking-tight text-foreground sm:text-[32px] sm:leading-[40px] md:text-[36px] md:leading-[44px]">
          {material.title}
        </h1>
        <ProductRatingBadge stats={reviewStats} />
        {material.description ? (
          <p className="max-w-3xl text-base leading-6 text-neutral-600">
            {material.description}
          </p>
        ) : null}
      </div>
    </header>
  );
}
