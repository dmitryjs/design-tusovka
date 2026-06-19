"use client";

import { useDeferredValue, useMemo, useState } from "react";

import { PageHero, PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import type { CatalogFilter, CatalogItem } from "@/lib/catalog/types";

import { MaterialCard } from "./material-card";
import { CatalogEmptyPanel } from "./catalog-detail-shell";
import { SectionCard } from "./section-card";

const FILTERS: Array<{ value: CatalogFilter; label: string }> = [
  { value: "all", label: "Все" },
  { value: "material", label: "Материалы" },
  { value: "section", label: "Разделы" },
];

type CatalogPageProps = {
  initialItems: CatalogItem[];
  initialQuery?: string;
  error: string | null;
};

function matchesSearch(item: CatalogItem, query: string): boolean {
  if (!query) {
    return true;
  }

  const haystack = `${item.title} ${item.description}`.toLowerCase();
  return haystack.includes(query);
}

function resultCountLabel(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return "позиция";
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return "позиции";
  }

  return "позиций";
}

export function CatalogPage({
  initialItems,
  initialQuery = "",
  error,
}: CatalogPageProps) {
  const catalogItems = useMemo(
    () => initialItems.filter((item) => item.kind !== "task"),
    [initialItems],
  );

  const [filter, setFilter] = useState<CatalogFilter>("all");
  const deferredQuery = useDeferredValue(initialQuery.trim().toLowerCase());

  const filteredItems = useMemo(() => {
    return catalogItems.filter((item) => {
      const matchesFilter = filter === "all" || item.kind === filter;
      return matchesFilter && matchesSearch(item, deferredQuery);
    });
  }, [catalogItems, filter, deferredQuery]);

  if (error) {
    return (
      <PageShell
        breadcrumbs={[
          { label: "Главная", href: "/" },
          { label: "Каталог" },
        ]}
      >
        <div className="mx-auto max-w-xl rounded-xl border border-destructive-border bg-destructive-bg px-5 py-8 text-center">
          <h1 className="text-xl font-semibold text-destructive-foreground">
            Не удалось загрузить каталог
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
        { label: "Каталог" },
      ]}
    >
      <PageHero
        title="Каталог материалов"
        description="Выбирайте практические материалы и разделы. Бесплатные — с полным содержанием, платные — с превью. Задания — на отдельной странице."
      />

      <section className="flex flex-wrap gap-2" aria-label="Фильтры каталога">
        {FILTERS.map((option) => (
          <Button
            key={option.value}
            type="button"
            size="sm"
            variant={filter === option.value ? "default" : "secondary"}
            onClick={() => setFilter(option.value)}
            aria-pressed={filter === option.value}
          >
            {option.label}
          </Button>
        ))}
      </section>

      {catalogItems.length > 0 ? (
        <p className="text-sm text-neutral-500" aria-live="polite">
          Найдено {filteredItems.length} {resultCountLabel(filteredItems.length)}
          {filter !== "all" || deferredQuery
            ? ` из ${catalogItems.length}`
            : ""}
        </p>
      ) : null}

      {catalogItems.length === 0 ? (
        <CatalogEmptyPanel
          title="Каталог пока пуст"
          description="Выполните supabase/dev_seed.sql в Supabase SQL Editor."
        />
      ) : filteredItems.length === 0 ? (
        <div className="space-y-4">
          <CatalogEmptyPanel
            title="Ничего не найдено"
            description="Попробуйте другой запрос в поиске в шапке или сбросьте фильтр."
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => setFilter("all")}
          >
            Сбросить фильтры
          </Button>
        </div>
      ) : (
        <section
          className="grid gap-4 lg:grid-cols-2"
          aria-label="Список каталога"
        >
          {filteredItems.map((item) =>
            item.kind === "material" && item.format && item.level ? (
              <MaterialCard
                key={item.id}
                material={{
                  slug: item.slug,
                  title: item.title,
                  description: item.description,
                  priceKopecks: item.priceKopecks,
                  format: item.format,
                  level: item.level,
                }}
              />
            ) : (
              <SectionCard key={item.id} section={item} />
            ),
          )}
        </section>
      )}
    </PageShell>
  );
}
