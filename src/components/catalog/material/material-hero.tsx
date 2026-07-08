import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { MaterialBackButton } from "@/components/catalog/material/material-back-button";
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
  /** Админский предпросмотр: цена как в каталоге, без «Куплено». */
  adminPreview?: boolean;
  /** Показать шеврон «назад» слева от названия (мобилка). */
  showBackButton?: boolean;
  /** Куда вести шеврон, если нужно переопределить историю. */
  backHref?: string;
  /** Скрыть оценку и отзывы. */
  hideRating?: boolean;
  /** Обложка сразу после названия (мобильный порядок). */
  cover?: React.ReactNode;
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

function MaterialBadges({
  material,
  priceBadgeKind,
  priceKopecks,
}: {
  material: MaterialDetail;
  priceBadgeKind: ReturnType<typeof resolveMaterialPriceBadgeKind>;
  priceKopecks: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="outline">{getMaterialFormatLabel(material.format)}</Badge>
      {material.level !== "all" ? (
        <Badge variant="outline">{getLevelLabel(material.level)}</Badge>
      ) : null}
      {material.section ? (
        <Badge
          variant="secondary"
          render={<Link href={getPreferredSectionPageHref(material.section.slug)} />}
        >
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
        {resolvePriceBadgeLabel(priceBadgeKind, priceKopecks)}
      </Badge>
    </div>
  );
}

export function MaterialHero({
  material,
  claimState,
  cartState,
  reviewStats,
  adminPreview = false,
  showBackButton = false,
  backHref,
  hideRating = false,
  cover,
}: MaterialHeroProps) {
  const isOwned = adminPreview
    ? false
    : resolveOwnedBadge(material, claimState, cartState);
  const priceBadgeKind = adminPreview
    ? material.priceKopecks === 0
      ? "free"
      : "paid"
    : resolveMaterialPriceBadgeKind(
        material.priceKopecks,
        material.hasFullAccess,
        isOwned,
      );

  const titleBlock = (
    <div className={cn(showBackButton && "flex items-start gap-2")}>
      {showBackButton ? <MaterialBackButton fallbackHref={backHref} className="-ml-1 mt-1" /> : null}
      <h1 className="min-w-0 flex-1 text-[28px] leading-[36px] font-semibold tracking-tight text-foreground sm:text-[32px] sm:leading-[40px] md:text-[36px] md:leading-[44px]">
        {material.title}
      </h1>
    </div>
  );

  const descriptionBlock = material.description ? (
    <p className="max-w-3xl text-base leading-6 text-neutral-600">
      {material.description}
    </p>
  ) : null;

  // Mobile layout: title → cover → badges → description
  if (cover) {
    return (
      <header className="space-y-4">
        <div className="space-y-4">
          {titleBlock}
          {cover}
        </div>

        <MaterialBadges
          material={material}
          priceBadgeKind={priceBadgeKind}
          priceKopecks={material.priceKopecks}
        />

        <div className="space-y-3">
          {hideRating ? null : <ProductRatingBadge stats={reviewStats} />}
          {descriptionBlock}
        </div>
      </header>
    );
  }

  // Desktop / default: badges → title → rating → description
  return (
    <header className="space-y-4">
      <MaterialBadges
        material={material}
        priceBadgeKind={priceBadgeKind}
        priceKopecks={material.priceKopecks}
      />

      <div className="space-y-3">
        {titleBlock}
        {hideRating ? null : <ProductRatingBadge stats={reviewStats} />}
        {descriptionBlock}
      </div>
    </header>
  );
}
