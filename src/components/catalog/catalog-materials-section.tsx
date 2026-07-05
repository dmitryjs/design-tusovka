"use client";

import { useDeferredValue, useMemo, useState } from "react";

import { CatalogEmptyPanel } from "@/components/catalog/catalog-detail-shell";
import {
  CatalogFiltersPanel,
  CatalogFormatQuickFilters,
} from "@/components/catalog/catalog-filters-panel";
import { CatalogSearchField } from "@/components/catalog/catalog-search-field";
import { PopularMaterialCard } from "@/components/home/popular-material-card";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_CATALOG_FILTERS,
  filterCatalogMaterials,
  isCatalogMaterial,
  resultCountLabel,
} from "@/lib/catalog/catalog-filters";
import { filterVisibleCatalogSections } from "@/lib/catalog/section-visibility";
import type { CatalogFiltersState, CatalogItem } from "@/lib/catalog/types";

type CatalogMaterialsSectionProps = {
  initialItems: CatalogItem[];
  initialQuery?: string;
  hideSectionFilters?: boolean;
  className?: string;
};

export function CatalogMaterialsSection({
  initialItems,
  initialQuery = "",
  hideSectionFilters = true,
  className,
}: CatalogMaterialsSectionProps) {
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

  return (
    <section
      id="materials"
      aria-label="Материалы"
      className={className ?? "space-y-4 scroll-mt-24"}
    >
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
          hideSectionFilter={hideSectionFilters}
        />
      </div>

      <CatalogFormatQuickFilters
        activeFormat={filters.format}
        onChange={(format) => setFilters((current) => ({ ...current, format }))}
      />

      {materials.length > 0 ? (
        <p className="text-sm text-neutral-500" aria-live="polite">
          Найдено {filteredMaterials.length} {resultCountLabel(filteredMaterials.length)}
          {filteredMaterials.length !== materials.length ? ` из ${materials.length}` : ""}
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
  );
}
