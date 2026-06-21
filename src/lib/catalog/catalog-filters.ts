import { resolveMaterialRating } from "@/lib/catalog/material-rating";
import type {
  CatalogFiltersState,
  CatalogItem,
  CatalogSortOption,
} from "@/lib/catalog/types";

export const DEFAULT_CATALOG_FILTERS: CatalogFiltersState = {
  query: "",
  format: null,
  level: null,
  sectionProductId: null,
  price: "all",
  sort: "new",
};

export const CATALOG_SORT_OPTIONS: Array<{
  value: CatalogSortOption;
  label: string;
}> = [
  { value: "new", label: "Новые" },
  { value: "popular", label: "Популярные" },
  { value: "price_asc", label: "Дешёвые" },
  { value: "price_desc", label: "Дорогие" },
];

function matchesQuery(item: CatalogItem, query: string): boolean {
  if (!query) {
    return true;
  }

  const haystack = `${item.title} ${item.description}`.toLowerCase();
  return haystack.includes(query);
}

export function isCatalogMaterial(item: CatalogItem): boolean {
  return item.kind === "material" && Boolean(item.format) && Boolean(item.level);
}

export function sortCatalogMaterials(
  items: CatalogItem[],
  sort: CatalogSortOption,
): CatalogItem[] {
  const sorted = [...items];

  switch (sort) {
    case "price_asc":
      return sorted.sort((left, right) => left.priceKopecks - right.priceKopecks);
    case "price_desc":
      return sorted.sort((left, right) => right.priceKopecks - left.priceKopecks);
    case "popular":
      return sorted.sort((left, right) => {
        const leftRating = resolveMaterialRating(
          left.slug,
          left.averageRating,
          left.reviewCount,
        );
        const rightRating = resolveMaterialRating(
          right.slug,
          right.averageRating,
          right.reviewCount,
        );

        return (
          rightRating.averageRating - leftRating.averageRating ||
          rightRating.reviewCount - leftRating.reviewCount ||
          left.title.localeCompare(right.title, "ru")
        );
      });
    case "new":
    default:
      return sorted.sort(
        (left, right) =>
          right.id.localeCompare(left.id) ||
          left.title.localeCompare(right.title, "ru"),
      );
  }
}

export function filterCatalogMaterials(
  items: CatalogItem[],
  filters: CatalogFiltersState,
): CatalogItem[] {
  const query = filters.query.trim().toLowerCase();

  const filtered = items.filter((item) => {
    if (!isCatalogMaterial(item)) {
      return false;
    }

    if (!matchesQuery(item, query)) {
      return false;
    }

    if (filters.format && item.format !== filters.format) {
      return false;
    }

    if (filters.level && item.level !== filters.level) {
      return false;
    }

    if (
      filters.sectionProductId &&
      item.sectionProductId !== filters.sectionProductId
    ) {
      return false;
    }

    if (filters.price === "free" && item.priceKopecks !== 0) {
      return false;
    }

    if (filters.price === "paid" && item.priceKopecks === 0) {
      return false;
    }

    return true;
  });

  return sortCatalogMaterials(filtered, filters.sort);
}

export function countActiveCatalogFilters(filters: CatalogFiltersState): number {
  let count = 0;

  if (filters.level) {
    count += 1;
  }

  if (filters.sectionProductId) {
    count += 1;
  }

  if (filters.price !== "all") {
    count += 1;
  }

  if (filters.sort !== DEFAULT_CATALOG_FILTERS.sort) {
    count += 1;
  }

  return count;
}

export function resultCountLabel(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return "материал";
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return "материала";
  }

  return "материалов";
}
