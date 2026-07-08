"use client";

import { SlidersHorizontal } from "lucide-react";
import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import {
  CATALOG_SORT_OPTIONS,
  countActiveCatalogFilters,
  DEFAULT_CATALOG_FILTERS,
} from "@/lib/catalog/catalog-filters";
import {
  getLevelDifficultyLabel,
  getLevelLabel,
} from "@/lib/catalog/format";
import type { CatalogFiltersState, CatalogItem } from "@/lib/catalog/types";
import type { Database } from "@/types/database.types";
import { cn } from "@/lib/utils";

type CatalogFiltersPanelProps = {
  filters: CatalogFiltersState;
  sections: CatalogItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (filters: CatalogFiltersState) => void;
  hideSectionFilter?: boolean;
};

const LEVEL_OPTIONS: Array<Database["public"]["Enums"]["designer_level"]> = [
  "junior",
  "middle",
  "senior",
];

export function CatalogFiltersPanel({
  filters,
  sections,
  open,
  onOpenChange,
  onChange,
  hideSectionFilter = false,
}: CatalogFiltersPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const activeCount = countActiveCatalogFilters(filters);

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

  function updateFilters(patch: Partial<CatalogFiltersState>) {
    onChange({ ...filters, ...patch });
  }

  return (
    <div ref={panelRef} className="relative shrink-0">
      <Button
        type="button"
        variant="secondary"
        className="relative size-12 shrink-0 gap-0 px-0 sm:h-11 sm:w-auto sm:gap-2 sm:px-3"
        aria-label="Фильтры и сортировка"
        aria-expanded={open}
        aria-controls="catalog-filters-panel"
        onClick={() => onOpenChange(!open)}
      >
        <SlidersHorizontal className="size-5 sm:size-4" aria-hidden />
        <span className="hidden sm:inline">Фильтры и сортировка</span>
        {activeCount > 0 ? (
          <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground sm:static sm:top-auto sm:right-auto">
            {activeCount}
          </span>
        ) : null}
      </Button>

      {open ? (
        <div
          id="catalog-filters-panel"
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

            {hideSectionFilter ? null : (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Раздел</p>
                <select
                  value={filters.sectionProductId ?? ""}
                  onChange={(event) =>
                    updateFilters({
                      sectionProductId: event.target.value || null,
                    })
                  }
                  className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-foreground outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-blue-100"
                  aria-label="Фильтр по разделу"
                >
                  <option value="">Все разделы</option>
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

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
                    ...DEFAULT_CATALOG_FILTERS,
                    query: filters.query,
                    format: filters.format,
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

type CatalogFormatQuickFiltersProps = {
  activeFormat: CatalogFiltersState["format"];
  onChange: (format: CatalogFiltersState["format"]) => void;
  className?: string;
};

export function CatalogFormatQuickFilters({
  activeFormat,
  onChange,
  className,
}: CatalogFormatQuickFiltersProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <button
        type="button"
        onClick={() => onChange(null)}
        className={cn(
          "rounded-full px-3 py-1.5 text-sm transition-colors",
          activeFormat === null
            ? "bg-neutral-900 text-white"
            : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200",
        )}
      >
        Все типы
      </button>
      {(
        [
          { value: "mini_guide", label: "Мини-гайды" },
          { value: "full_guide", label: "Гайды" },
          { value: "checklist", label: "Чеклисты" },
          { value: "template", label: "Шаблоны" },
          { value: "cheat_sheet", label: "Шпаргалки" },
          { value: "lesson", label: "Уроки" },
          { value: "practice", label: "Практика" },
          { value: "notes", label: "Заметки" },
        ] as const
      ).map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() =>
            onChange(activeFormat === option.value ? null : option.value)
          }
          className={cn(
            "rounded-full px-3 py-1.5 text-sm transition-colors",
            activeFormat === option.value
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
