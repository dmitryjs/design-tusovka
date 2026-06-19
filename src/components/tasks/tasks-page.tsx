"use client";

import { useDeferredValue, useMemo } from "react";

import { TaskCard } from "@/components/catalog/task-card";
import { CatalogEmptyPanel } from "@/components/catalog/catalog-detail-shell";
import { PageHero, PageShell } from "@/components/layout/page-shell";
import type { CatalogItem } from "@/lib/catalog/types";

type TasksPageProps = {
  initialItems: CatalogItem[];
  initialQuery?: string;
  error: string | null;
};

function matchesSearch(item: CatalogItem, query: string): boolean {
  if (!query) {
    return true;
  }

  return `${item.title} ${item.description}`.toLowerCase().includes(query);
}

export function TasksPage({
  initialItems,
  initialQuery = "",
  error,
}: TasksPageProps) {
  const tasks = initialItems.filter((item) => item.kind === "task");
  const deferredQuery = useDeferredValue(initialQuery.trim().toLowerCase());

  const filteredTasks = useMemo(() => {
    return tasks.filter((item) => matchesSearch(item, deferredQuery));
  }, [tasks, deferredQuery]);

  if (error) {
    return (
      <PageShell
        breadcrumbs={[
          { label: "Главная", href: "/" },
          { label: "Задания" },
        ]}
      >
        <div className="rounded-xl border border-destructive-border bg-destructive-bg px-5 py-8 text-center">
          <p className="text-sm text-destructive-foreground">{error}</p>
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
      <PageHero
        title="Задания"
        description="Практикуйтесь на реальных сценариях. Бесплатные задания — с полным брифом, платные — с превью; полный доступ после покупки."
      />

      {filteredTasks.length === 0 ? (
        <CatalogEmptyPanel
          title="Заданий не найдено"
          description="Попробуйте изменить запрос в поиске в шапке."
        />
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredTasks.map((item) => (
            <TaskCard key={item.id} task={item} />
          ))}
        </section>
      )}
    </PageShell>
  );
}
