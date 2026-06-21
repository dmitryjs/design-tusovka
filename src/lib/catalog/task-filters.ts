import type {
  CatalogItem,
  CatalogSortOption,
  TaskFiltersState,
} from "@/lib/catalog/types";

export const DEFAULT_TASK_FILTERS: TaskFiltersState = {
  query: "",
  level: null,
  price: "all",
  sort: "new",
};

export { CATALOG_SORT_OPTIONS } from "@/lib/catalog/catalog-filters";

function matchesQuery(item: CatalogItem, query: string): boolean {
  if (!query) {
    return true;
  }

  const haystack = `${item.title} ${item.description}`.toLowerCase();
  return haystack.includes(query);
}

export function isCatalogTask(item: CatalogItem): boolean {
  return item.kind === "task" && Boolean(item.level);
}

export function sortCatalogTasks(
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
      return sorted.sort(
        (left, right) =>
          left.title.localeCompare(right.title, "ru") ||
          right.id.localeCompare(left.id),
      );
    case "new":
    default:
      return sorted.sort(
        (left, right) =>
          right.id.localeCompare(left.id) ||
          left.title.localeCompare(right.title, "ru"),
      );
  }
}

export function filterCatalogTasks(
  items: CatalogItem[],
  filters: TaskFiltersState,
): CatalogItem[] {
  const query = filters.query.trim().toLowerCase();

  const filtered = items.filter((item) => {
    if (!isCatalogTask(item)) {
      return false;
    }

    if (!matchesQuery(item, query)) {
      return false;
    }

    if (filters.level && item.level !== filters.level) {
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

  return sortCatalogTasks(filtered, filters.sort);
}

export function countActiveTaskFilters(filters: TaskFiltersState): number {
  let count = 0;

  if (filters.level) {
    count += 1;
  }

  if (filters.price !== "all") {
    count += 1;
  }

  if (filters.sort !== DEFAULT_TASK_FILTERS.sort) {
    count += 1;
  }

  return count;
}

export function taskCountLabel(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return "задание";
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return "задания";
  }

  return "заданий";
}

export type TaskQuickFilter =
  | "all"
  | "junior"
  | "middle"
  | "senior"
  | "free"
  | "paid";

export function resolveTaskQuickFilter(filters: TaskFiltersState): TaskQuickFilter {
  if (filters.price === "free") {
    return "free";
  }

  if (filters.price === "paid") {
    return "paid";
  }

  if (filters.level === "junior") {
    return "junior";
  }

  if (filters.level === "middle") {
    return "middle";
  }

  if (filters.level === "senior") {
    return "senior";
  }

  return "all";
}

export function applyTaskQuickFilter(
  filters: TaskFiltersState,
  quickFilter: TaskQuickFilter,
): TaskFiltersState {
  if (quickFilter === "all") {
    return {
      ...filters,
      level: null,
      price: "all",
    };
  }

  if (quickFilter === "free" || quickFilter === "paid") {
    return {
      ...filters,
      level: null,
      price: quickFilter,
    };
  }

  return {
    ...filters,
    level: quickFilter,
    price: "all",
  };
}
