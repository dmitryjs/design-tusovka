"use client";

import { useDeferredValue, useMemo, useState } from "react";

import { TaskCard } from "@/components/catalog/task-card";
import { CatalogEmptyPanel } from "@/components/catalog/catalog-detail-shell";
import { CatalogSearchField } from "@/components/catalog/catalog-search-field";
import { PageShell } from "@/components/layout/page-shell";
import {
  TaskFiltersPanel,
  TaskQuickFilters,
} from "@/components/tasks/task-filters-panel";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_TASK_FILTERS,
  filterCatalogTasks,
  isCatalogTask,
  taskCountLabel,
} from "@/lib/catalog/task-filters";
import type { CatalogItem, TaskFiltersState } from "@/lib/catalog/types";

type TasksPageProps = {
  initialItems: CatalogItem[];
  initialQuery?: string;
  error: string | null;
};

export function TasksPage({
  initialItems,
  initialQuery = "",
  error,
}: TasksPageProps) {
  const tasks = useMemo(
    () => initialItems.filter(isCatalogTask),
    [initialItems],
  );

  const [filters, setFilters] = useState<TaskFiltersState>({
    ...DEFAULT_TASK_FILTERS,
    query: initialQuery,
  });
  const [filtersOpen, setFiltersOpen] = useState(false);

  const deferredFilters = useDeferredValue(filters);

  const filteredTasks = useMemo(
    () => filterCatalogTasks(tasks, deferredFilters),
    [tasks, deferredFilters],
  );

  if (error) {
    return (
      <PageShell
        breadcrumbs={[
          { label: "Главная", href: "/" },
          { label: "Задания" },
        ]}
      >
        <div className="mx-auto max-w-xl rounded-xl border border-destructive-border bg-destructive-bg px-5 py-8 text-center">
          <h1 className="text-xl font-semibold text-destructive-foreground">
            Не удалось загрузить задания
          </h1>
          <p className="mt-2 text-sm leading-6 text-destructive-foreground/90">
            {error}
          </p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      breadcrumbs={[
        { label: "Главная", href: "/" },
        { label: "Задания" },
      ]}
    >
      <header className="space-y-3">
        <h1 className="text-[28px] leading-[36px] font-semibold tracking-tight text-foreground sm:text-[32px] sm:leading-[40px]">
          Задания
        </h1>
        <p className="max-w-3xl text-base leading-6 text-neutral-600">
          Практикуйтесь на реальных сценариях. Бесплатные задания — с полным брифом,
          платные — с превью; полный доступ после покупки.
        </p>
      </header>

      <section aria-label="Задания" className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <CatalogSearchField
            value={filters.query}
            onChange={(query) => setFilters((current) => ({ ...current, query }))}
            placeholder="Поиск заданий..."
          />
          <TaskFiltersPanel
            filters={filters}
            open={filtersOpen}
            onOpenChange={setFiltersOpen}
            onChange={setFilters}
          />
        </div>

        <TaskQuickFilters filters={filters} onChange={setFilters} />

        {tasks.length > 0 ? (
          <p className="text-sm text-neutral-500" aria-live="polite">
            Найдено {filteredTasks.length} {taskCountLabel(filteredTasks.length)}
            {filteredTasks.length !== tasks.length ? ` из ${tasks.length}` : ""}
          </p>
        ) : null}

        {tasks.length === 0 ? (
          <CatalogEmptyPanel
            title="Заданий пока нет"
            description="Выполните supabase/dev_seed.sql в Supabase SQL Editor."
          />
        ) : filteredTasks.length === 0 ? (
          <div className="space-y-4">
            <CatalogEmptyPanel
              title="Ничего не найдено"
              description="Попробуйте другой запрос или сбросьте фильтры."
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                setFilters({
                  ...DEFAULT_TASK_FILTERS,
                  query: filters.query,
                })
              }
            >
              Сбросить фильтры
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredTasks.map((item) => (
              <TaskCard key={item.id} task={item} />
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
