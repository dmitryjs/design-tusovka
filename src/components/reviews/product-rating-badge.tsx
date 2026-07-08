import Link from "next/link";
import { Star } from "lucide-react";

import { PUBLIC_REVIEWS_UI_ENABLED } from "@/lib/reviews/feature";
import { reviewCountLabel } from "@/lib/reviews/messages";
import type { ProductReviewStats } from "@/lib/reviews/types";
import { cn } from "@/lib/utils";

export const PRODUCT_REVIEWS_SECTION_ID = "product-reviews";

type ProductRatingBadgeProps = {
  stats: ProductReviewStats;
  className?: string;
};

export function ProductRatingBadge({ stats, className }: ProductRatingBadgeProps) {
  if (!PUBLIC_REVIEWS_UI_ENABLED) {
    return null;
  }

  const hasReviews = stats.reviewCount > 0;

  return (
    <Link
      href={`#${PRODUCT_REVIEWS_SECTION_ID}`}
      className={cn(
        "inline-flex items-center gap-1.5 text-sm text-neutral-700 transition-colors hover:text-primary",
        className,
      )}
    >
      <Star
        className={cn(
          "size-4",
          hasReviews ? "fill-amber-400 text-amber-400" : "text-neutral-400",
        )}
        aria-hidden
      />
      {hasReviews ? (
        <>
          <span className="font-semibold text-foreground">
            {stats.averageRating.toFixed(1)}
          </span>
          <span className="text-neutral-500">({reviewCountLabel(stats.reviewCount)})</span>
        </>
      ) : (
        <span className="text-neutral-600">Нет отзывов</span>
      )}
    </Link>
  );
}
