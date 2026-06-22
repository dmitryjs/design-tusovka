import { Badge } from "@/components/ui/badge";
import {
  formatPrice,
  getLevelDifficultyLabel,
  getLevelLabel,
} from "@/lib/catalog/format";
import type { TaskDetail } from "@/lib/catalog/detail-queries";
import { ProductRatingBadge } from "@/components/reviews/product-rating-badge";
import type { ProductReviewStats } from "@/lib/reviews/types";
import type { FreeProductClaimState } from "@/lib/entitlements/types";
import type { PaidProductCartState } from "@/lib/cart/types";
import {
  resolveTaskEstimatedHours,
  resolveTaskOwned,
  resolveTaskPriceBadgeKind,
} from "@/lib/catalog/task-detail-utils";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, Layers, Sparkles } from "lucide-react";

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
    <header className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="gap-1.5">
          <Layers className="size-3.5 text-primary" aria-hidden />
          Практическое задание
        </Badge>
        {task.level !== "all" ? (
          <Badge variant="outline" className="gap-1.5">
            <Sparkles className="size-3.5 text-violet-500" aria-hidden />
            Уровень: {getLevelDifficultyLabel(task.level)}
          </Badge>
        ) : null}
        <Badge variant="outline" className="gap-1.5">
          <Clock className="size-3.5 text-emerald-600" aria-hidden />
          {resolveTaskEstimatedHours(task.level)}
        </Badge>
        <Badge
          variant={priceBadgeKind === "paid" ? "outline" : "default"}
          className={cn(
            "gap-1.5",
            priceBadgeKind !== "paid" && "bg-primary text-primary-foreground",
            priceBadgeKind === "owned" && "bg-emerald-600 text-white hover:bg-emerald-600",
          )}
        >
          {priceBadgeKind === "owned" ? (
            <CheckCircle2 className="size-3.5" aria-hidden />
          ) : null}
          {resolvePriceBadgeLabel(priceBadgeKind, task.priceKopecks)}
        </Badge>
        {task.aiReviewAvailable ? (
          <Badge variant="secondary" className="hidden sm:inline-flex">
            AI-проверка
          </Badge>
        ) : null}
        {task.manualReviewAvailable ? (
          <Badge variant="secondary" className="hidden sm:inline-flex">
            Экспертная проверка
          </Badge>
        ) : null}
      </div>

      <div className="space-y-3">
        <h1 className="text-[28px] leading-[36px] font-semibold tracking-tight text-foreground sm:text-[32px] sm:leading-[40px] md:text-[36px] md:leading-[44px]">
          {task.title}
        </h1>
        <ProductRatingBadge stats={reviewStats} />
        {task.description ? (
          <p className="max-w-3xl text-base leading-6 text-neutral-600">
            {task.description}
          </p>
        ) : null}
        {task.level !== "all" ? (
          <p className="text-sm text-neutral-500">
            Рекомендуемый уровень: {getLevelLabel(task.level)}
          </p>
        ) : null}
      </div>
    </header>
  );
}
