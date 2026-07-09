import {
  formatPrice,
  getLevelLabel,
} from "@/lib/catalog/format";
import type { TaskDetail } from "@/lib/catalog/detail-queries";
import { ProductRatingBadge } from "@/components/reviews/product-rating-badge";
import type { ProductReviewStats } from "@/lib/reviews/types";
import type { FreeProductClaimState } from "@/lib/entitlements/types";
import type { PaidProductCartState } from "@/lib/cart/types";
import {
  resolveTaskOwned,
  resolveTaskPriceBadgeKind,
} from "@/lib/catalog/task-detail-utils";

type TaskHeroProps = {
  task: TaskDetail;
  claimState: FreeProductClaimState;
  cartState: PaidProductCartState;
  reviewStats: ProductReviewStats;
};

function resolvePriceBadgeLabel(
  kind: ReturnType<typeof resolveTaskPriceBadgeKind>,
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

export function TaskHero({ task, claimState, cartState, reviewStats }: TaskHeroProps) {
  const isOwned = resolveTaskOwned(
    task.priceKopecks,
    task.hasFullAccess,
    claimState,
    cartState,
  );
  const priceBadgeKind = resolveTaskPriceBadgeKind(
    task.priceKopecks,
    task.hasFullAccess,
    isOwned,
  );

  return (
    <header className="space-y-3">
      <h1 className="text-[28px] leading-[36px] font-semibold tracking-tight text-foreground sm:text-[32px] sm:leading-[40px] md:text-[36px] md:leading-[44px]">
        {task.title}
      </h1>
      <ProductRatingBadge stats={reviewStats} />
      {task.description ? (
        <p className="max-w-3xl text-base leading-6 text-neutral-600">
          {task.description}
        </p>
      ) : null}
      <p className="text-sm text-neutral-500">
        Рекомендуемый уровень: {getLevelLabel(task.level)}
        {task.hasFullAccess ? ` · ${resolvePriceBadgeLabel(priceBadgeKind, task.priceKopecks)}` : ""}
      </p>
    </header>
  );
}
