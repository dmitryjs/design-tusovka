import { getLevelDifficultyLabel } from "@/lib/catalog/format";
import type { TaskDetail } from "@/lib/catalog/detail-queries";
import { resolveTaskEstimatedHours, resolveTaskGoal } from "@/lib/catalog/task-detail-utils";
import { BarChart3, Clock, Target, Zap } from "lucide-react";

type TaskSummaryGridProps = {
  task: TaskDetail;
};

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-5">
      <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
        {icon}
      </div>
      <p className="text-xs font-medium tracking-wide text-neutral-500 uppercase">
        {label}
      </p>
      <p className="mt-2 text-sm leading-5 text-foreground">{value}</p>
    </div>
  );
}

export function TaskSummaryGrid({ task }: TaskSummaryGridProps) {
  const goal = resolveTaskGoal(task.brief, task.title);
  const problem =
    task.description ||
    "Изучите бриф задания и определите ключевую пользовательскую проблему.";

  return (
    <section
      aria-label="Краткое описание задания"
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      <SummaryCard
        icon={<Zap className="size-4" aria-hidden />}
        label="Проблема"
        value={problem}
      />
      <SummaryCard
        icon={<Target className="size-4" aria-hidden />}
        label="Цель"
        value={goal}
      />
      <SummaryCard
        icon={<BarChart3 className="size-4" aria-hidden />}
        label="Сложность"
        value={
          task.level === "all"
            ? "Любой уровень"
            : getLevelDifficultyLabel(task.level)
        }
      />
      <SummaryCard
        icon={<Clock className="size-4" aria-hidden />}
        label="Оценка времени"
        value={resolveTaskEstimatedHours(task.level)}
      />
    </section>
  );
}
