"use client";

import { useDeferredValue, useMemo, useState } from "react";

import { CatalogEmptyPanel } from "@/components/catalog/catalog-detail-shell";
import {
  CatalogFiltersPanel,
  CatalogFormatQuickFilters,
} from "@/components/catalog/catalog-filters-panel";
import { CatalogSearchField } from "@/components/catalog/catalog-search-field";
import { HomeSectionCard } from "@/components/home/home-section-card";
import { PopularMaterialCard } from "@/components/home/popular-material-card";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DEFAULT_CATALOG_FILTERS,
  filterCatalogMaterials,
  isCatalogMaterial,
  resultCountLabel,
} from "@/lib/catalog/catalog-filters";
import { buildVisibleSectionCards } from "@/lib/catalog/section-cards";
import { filterVisibleCatalogSections } from "@/lib/catalog/section-visibility";
import type { CatalogFiltersState, CatalogItem } from "@/lib/catalog/types";

type CatalogPageProps = {
  initialItems: CatalogItem[];
  initialQuery?: string;
  error: string | null;
};

export function CatalogPage({
  initialItems,
  initialQuery = "",
  error,
}: CatalogPageProps) {
  const sectionCards = useMemo(
    () => buildVisibleSectionCards(initialItems),
    [initialItems],
  );

  const materials = useMemo(
    () => initialItems.filter(isCatalogMaterial),
    [initialItems],
  );

  const catalogSections = useMemo(
    () => filterVisibleCatalogSections(initialItems),
    [initialItems],
  );

  const [filters, setFilters] = useState<CatalogFiltersState>({
    ...DEFAULT_CATALOG_FILTERS,
    query: initialQuery,
  });
  const [filtersOpen, setFiltersOpen] = useState(false);

  const deferredFilters = useDeferredValue(filters);

  const filteredMaterials = useMemo(
    () => filterCatalogMaterials(materials, deferredFilters),
    [materials, deferredFilters],
  );

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
      <header className="space-y-3">
        <h1 className="text-[28px] leading-[36px] font-semibold tracking-tight text-foreground sm:text-[32px] sm:leading-[40px]">
          Каталог материалов
        </h1>
        <p className="max-w-3xl text-base leading-6 text-neutral-600">
          Выбирайте практические материалы и разделы. Бесплатные — с полным содержанием,
          платные — с превью. Задания — на отдельной странице.
        </p>
      </header>

      <section aria-label="Разделы с материалами">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sectionCards.map((section) => (
            <HomeSectionCard key={section.slug} section={section} />
          ))}
        </div>
      </section>

      <Separator className="bg-neutral-200" />

      <section aria-label="Материалы" className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <CatalogSearchField
            value={filters.query}
            onChange={(query) => setFilters((current) => ({ ...current, query }))}
          />
          <CatalogFiltersPanel
            filters={filters}
            sections={catalogSections}
            open={filtersOpen}
            onOpenChange={setFiltersOpen}
            onChange={setFilters}
          />
        </div>

        <CatalogFormatQuickFilters
          activeFormat={filters.format}
          onChange={(format) => setFilters((current) => ({ ...current, format }))}
        />

        {materials.length > 0 ? (
          <p className="text-sm text-neutral-500" aria-live="polite">
            Найдено {filteredMaterials.length} {resultCountLabel(filteredMaterials.length)}
            {filteredMaterials.length !== materials.length
              ? ` из ${materials.length}`
              : ""}
          </p>
        ) : null}

        {materials.length === 0 ? (
          <CatalogEmptyPanel
            title="Каталог пока пуст"
            description="Выполните supabase/dev_seed.sql в Supabase SQL Editor."
          />
        ) : filteredMaterials.length === 0 ? (
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
                  ...DEFAULT_CATALOG_FILTERS,
                  query: filters.query,
                })
              }
            >
              Сбросить фильтры
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredMaterials.map((item) => (
              <PopularMaterialCard
                key={item.id}
                className="w-full min-w-0"
                material={{
                  slug: item.slug,
                  title: item.title,
                  description: item.description,
                  priceKopecks: item.priceKopecks,
                  format: item.format!,
                  coverPath: item.coverPath,
                  averageRating: item.averageRating,
                  reviewCount: item.reviewCount,
                }}
              />
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
