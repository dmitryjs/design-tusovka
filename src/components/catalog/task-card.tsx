import { ClipboardList } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  formatPrice,
  getLevelDifficultyLabel,
} from "@/lib/catalog/format";
import { getCatalogItemHref } from "@/lib/catalog/paths";
import type { CatalogItem } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";

type TaskCardProps = {
  task: CatalogItem;
  className?: string;
};

export function TaskCard({ task, className }: TaskCardProps) {
  const isFree = task.priceKopecks === 0;

  return (
    <Link
      href={getCatalogItemHref("task", task.slug)}
      className={cn(
        "group block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200",
        className,
      )}
    >
      <article className="flex h-full flex-col rounded-xl border border-neutral-200 bg-card p-5 transition-colors hover:border-primary/20 hover:bg-neutral-50">
        <div className="flex items-start justify-between gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-primary">
            <ClipboardList className="size-5" aria-hidden />
          </div>
        </div>

        <div className="mt-4 flex flex-1 flex-col gap-3">
          <div className="space-y-2">
            <h3 className="text-base leading-6 font-semibold text-foreground group-hover:text-primary">
              {task.title}
            </h3>
            {task.description ? (
              <p className="line-clamp-2 text-sm leading-6 text-neutral-600">
                {task.description}
              </p>
            ) : null}
          </div>

          <div className="mt-auto flex flex-wrap items-center gap-2">
            {task.level && task.level !== "all" ? (
              <Badge
                variant="secondary"
                className="bg-emerald-50 text-emerald-800"
              >
                {getLevelDifficultyLabel(task.level)}
              </Badge>
            ) : null}
            {task.aiReviewAvailable ? (
              <Badge variant="outline">AI-разбор</Badge>
            ) : null}
            <Badge
              variant={isFree ? "default" : "outline"}
              className={cn(isFree && "bg-primary text-primary-foreground")}
            >
              {formatPrice(task.priceKopecks)}
            </Badge>
          </div>
        </div>
      </article>
    </Link>
  );
}
