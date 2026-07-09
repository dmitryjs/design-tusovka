import type { TaskDetail } from "@/lib/catalog/detail-queries";
import { ProductRatingBadge } from "@/components/reviews/product-rating-badge";
import type { ProductReviewStats } from "@/lib/reviews/types";
import type { FreeProductClaimState } from "@/lib/entitlements/types";
import type { PaidProductCartState } from "@/lib/cart/types";

type TaskHeroProps = {
  task: TaskDetail;
  claimState: FreeProductClaimState;
  cartState: PaidProductCartState;
  reviewStats: ProductReviewStats;
};

export function TaskHero({ task, reviewStats }: TaskHeroProps) {
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
    </header>
  );
}
