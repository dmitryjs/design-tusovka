"use client";

import { SlidersHorizontal } from "lucide-react";
import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import {
  applyTaskQuickFilter,
  CATALOG_SORT_OPTIONS,
  countActiveTaskFilters,
  DEFAULT_TASK_FILTERS,
  resolveTaskQuickFilter,
  type TaskQuickFilter,
} from "@/lib/catalog/task-filters";
import {
  getLevelDifficultyLabel,
  getLevelLabel,
} from "@/lib/catalog/format";
import type { TaskFiltersState } from "@/lib/catalog/types";
import type { Database } from "@/types/database.types";
import { cn } from "@/lib/utils";

type TaskFiltersPanelProps = {
  filters: TaskFiltersState;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (filters: TaskFiltersState) => void;
};

const LEVEL_OPTIONS: Array<Database["public"]["Enums"]["designer_level"]> = [
  "junior",
  "middle",
  "senior",
];

export function TaskFiltersPanel({
  filters,
  open,
  onOpenChange,
  onChange,
}: TaskFiltersPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const activeCount = countActiveTaskFilters(filters);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!panelRef.current?.contains(event.target as Node)) {
        onOpenChange(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onOpenChange]);

  function updateFilters(patch: Partial<TaskFiltersState>) {
    onChange({ ...filters, ...patch });
  }

  return (
    <div ref={panelRef} className="relative shrink-0">
      <Button
        type="button"
        variant="secondary"
        className="gap-2"
        aria-expanded={open}
        aria-controls="task-filters-panel"
        onClick={() => onOpenChange(!open)}
      >
        <SlidersHorizontal className="size-4" aria-hidden />
        Фильтры и сортировка
        {activeCount > 0 ? (
          <span className="flex size-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
            {activeCount}
          </span>
        ) : null}
      </Button>

      {open ? (
        <div
          id="task-filters-panel"
          className="absolute right-0 z-20 mt-2 w-[min(100vw-2rem,360px)] rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">Сортировка</p>
              <div className="flex flex-wrap gap-2">
                {CATALOG_SORT_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    size="sm"
                    variant={filters.sort === option.value ? "default" : "secondary"}
                    onClick={() => updateFilters({ sort: option.value })}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">Уровень</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={filters.level === null ? "default" : "secondary"}
                  onClick={() => updateFilters({ level: null })}
                >
                  Любой
                </Button>
                {LEVEL_OPTIONS.map((level) => (
                  <Button
                    key={level}
                    type="button"
                    size="sm"
                    variant={filters.level === level ? "default" : "secondary"}
                    onClick={() => updateFilters({ level })}
                  >
                    {getLevelLabel(level)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">Цена</p>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { value: "all", label: "Все" },
                    { value: "free", label: "Бесплатные" },
                    { value: "paid", label: "Платные" },
                  ] as const
                ).map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    size="sm"
                    variant={filters.price === option.value ? "default" : "secondary"}
                    onClick={() => updateFilters({ price: option.value })}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-neutral-200 pt-3">
              <p className="text-xs text-neutral-500">
                {filters.level
                  ? getLevelDifficultyLabel(filters.level)
                  : "Без ограничений по уровню"}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  onChange({
                    ...DEFAULT_TASK_FILTERS,
                    query: filters.query,
                  })
                }
              >
                Сбросить
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const TASK_QUICK_FILTERS: Array<{ value: TaskQuickFilter; label: string }> = [
  { value: "all", label: "Все задания" },
  { value: "junior", label: "Начальный" },
  { value: "middle", label: "Средний" },
  { value: "senior", label: "Сложный" },
  { value: "free", label: "Бесплатные" },
  { value: "paid", label: "Платные" },
];

type TaskQuickFiltersProps = {
  filters: TaskFiltersState;
  onChange: (filters: TaskFiltersState) => void;
  className?: string;
};

export function TaskQuickFilters({
  filters,
  onChange,
  className,
}: TaskQuickFiltersProps) {
  const activeQuickFilter = resolveTaskQuickFilter(filters);

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {TASK_QUICK_FILTERS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(applyTaskQuickFilter(filters, option.value))}
          className={cn(
            "rounded-full px-3 py-1.5 text-sm transition-colors",
            activeQuickFilter === option.value
              ? "bg-neutral-900 text-white"
              : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
