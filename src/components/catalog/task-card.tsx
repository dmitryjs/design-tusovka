import Link from "next/link";

import { formatPrice } from "@/lib/catalog/format";
import { resolveLevelStyle } from "@/lib/catalog/level-style";
import { getCatalogItemHref } from "@/lib/catalog/paths";
import { resolveTaskCardVisual } from "@/lib/catalog/task-card-visual";
import type { CatalogItem } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";

type TaskCardProps = {
  task: CatalogItem;
  className?: string;
};

export function TaskCard({ task, className }: TaskCardProps) {
  const visual = resolveTaskCardVisual(task.slug, task.title);
  const levelStyle = resolveLevelStyle(task.level);
  const TaskIcon = visual.Icon;
  const LevelIcon = levelStyle?.Icon;

  return (
    <Link
      href={getCatalogItemHref("task", task.slug)}
      className={cn(
        "group block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200",
        className,
      )}
    >
      <article className="relative flex h-full flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white p-4 transition-colors hover:border-primary/20">
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl",
            visual.containerClassName,
          )}
        >
          <TaskIcon className={cn("size-5", visual.iconClassName)} aria-hidden />
        </div>

        <div className="mt-3 flex flex-1 flex-col">
          <h3 className="line-clamp-2 min-h-10 text-sm leading-5 font-bold text-foreground group-hover:text-primary">
            {task.title}
          </h3>
          {task.description ? (
            <p className="mt-2 line-clamp-2 text-sm leading-5 text-neutral-600">
              {task.description}
            </p>
          ) : null}
        </div>

        <div className="mt-3 flex min-h-5 items-center justify-between gap-3 pt-1">
          {levelStyle && LevelIcon ? (
            <div
              className={cn(
                "flex items-center gap-1.5 text-sm font-medium",
                levelStyle.className,
              )}
            >
              <LevelIcon className="size-4 shrink-0" aria-hidden />
              <span>{levelStyle.label}</span>
            </div>
          ) : (
            <span />
          )}
          <span className="shrink-0 text-sm leading-5 font-semibold text-primary">
            {formatPrice(task.priceKopecks)}
          </span>
        </div>
      </article>
    </Link>
  );
}
