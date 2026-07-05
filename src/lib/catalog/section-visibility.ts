import type { CatalogItem } from "./types";

export function isVisibleCatalogSection(item: CatalogItem): boolean {
  return item.kind === "section" && (item.materialCount ?? 0) > 0;
}

export function filterVisibleCatalogSections(items: CatalogItem[]): CatalogItem[] {
  return items.filter(isVisibleCatalogSection);
}
