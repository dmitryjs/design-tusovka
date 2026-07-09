import Link from "next/link";
import {
  Calendar,
  Clock,
  ExternalLink,
  Hash,
  Layers,
  Signal,
  Tag,
} from "lucide-react";

import {
  formatPrice,
  getLevelDifficultyLabel,
  getLevelLabel,
} from "@/lib/catalog/format";
import type { TaskDetail } from "@/lib/catalog/detail-queries";
import type { FreeProductClaimState } from "@/lib/entitlements/types";
import type { PaidProductCartState } from "@/lib/cart/types";
import {
  formatTaskUpdatedAt,
  resolveTaskEstimatedHours,
  resolveTaskOwned,
} from "@/lib/catalog/task-detail-utils";
import { cn } from "@/lib/utils";

type TaskSidebarProps = {
  task: TaskDetail;
  claimState: FreeProductClaimState;
  cartState: PaidProductCartState;
  className?: string;
};

function SidebarCard({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5",
        className,
      )}
    >
      <h2 className="mb-4 text-base font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  );
}

function MetaRow({
  icon,
  label,
  children,
  valueClassName,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 shrink-0 text-neutral-400" aria-hidden>
        {icon}
      </div>
      <div className="min-w-0">
        <dt className="text-xs leading-4 text-neutral-500">{label}</dt>
        <dd className={cn("mt-0.5 text-sm leading-5 font-medium", valueClassName)}>
          {children}
        </dd>
      </div>
    </div>
  );
}

export function TaskSidebar({
  task,
  claimState,
  cartState,
  className,
}: TaskSidebarProps) {
  const isOwned = resolveTaskOwned(
    task.priceKopecks,
    task.hasFullAccess,
    claimState,
    cartState,
  );
  const updatedLabel = formatTaskUpdatedAt(task.updatedAt);
  const themesLabel = task.tags.map((tag) => tag.name).join(", ");

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <SidebarCard title="Детали задания">
        <dl className="flex flex-col gap-4">
          <MetaRow icon={<Layers className="size-4" />} label="Формат">
            Практическое задание
          </MetaRow>
          {task.level !== "all" ? (
            <MetaRow
              icon={<Signal className="size-4" />}
              label="Уровень"
              valueClassName="text-primary"
            >
              {getLevelDifficultyLabel(task.level)} ({getLevelLabel(task.level)})
            </MetaRow>
          ) : null}
          <MetaRow icon={<Clock className="size-4" />} label="Оценка времени">
            {resolveTaskEstimatedHours(task.level)}
          </MetaRow>
          <MetaRow icon={<Hash className="size-4" />} label="ID задания">
            {task.slug}
          </MetaRow>
          {themesLabel ? (
            <MetaRow
              icon={<Tag className="size-4" />}
              label="Темы"
              valueClassName="text-primary"
            >
              {themesLabel}
            </MetaRow>
          ) : null}
          {updatedLabel ? (
            <MetaRow icon={<Calendar className="size-4" />} label="Обновлено">
              {updatedLabel}
            </MetaRow>
          ) : null}
          {isOwned && task.priceKopecks > 0 ? (
            <MetaRow icon={<Calendar className="size-4" />} label="Статус">
              Куплено за {formatPrice(task.priceKopecks)}
            </MetaRow>
          ) : null}
        </dl>
        <Link
          href="/offer"
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          Условия использования
          <ExternalLink className="size-3.5" aria-hidden />
        </Link>
      </SidebarCard>

      {task.hasFullAccess && task.aiCriteria.length > 0 ? (
        <SidebarCard title="Критерии проверки">
          <ul className="flex flex-col gap-3">
            {task.aiCriteria.map((criterion) => (
              <li key={criterion.id} className="text-sm leading-5">
                <p className="font-medium text-foreground">{criterion.title}</p>
                {criterion.description ? (
                  <p className="mt-1 text-neutral-600">{criterion.description}</p>
                ) : null}
              </li>
            ))}
          </ul>
          <Link
            href="#task-brief-criteria"
            className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
          >
            Смотреть полные критерии
          </Link>
        </SidebarCard>
      ) : null}
    </div>
  );
}
