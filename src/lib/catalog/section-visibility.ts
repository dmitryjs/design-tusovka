import type { Database } from "@/types/database.types";

import type { CatalogItem } from "./types";

type ProductStatus = Database["public"]["Enums"]["product_status"];

export type SectionSiteVisibilityState =
  | "on_site"
  | "no_materials"
  | "draft"
  | "hidden";

export const SECTION_SITE_VISIBILITY_LABELS: Record<
  SectionSiteVisibilityState,
  string
> = {
  on_site: "На сайте",
  no_materials: "Нет материалов",
  draft: "Черновик",
  hidden: "Скрыт",
};

export function getSectionSiteVisibility(
  status: ProductStatus,
  publishedMaterialCount: number,
): SectionSiteVisibilityState {
  if (status === "hidden") {
    return "hidden";
  }

  if (status === "draft") {
    return "draft";
  }

  if (publishedMaterialCount <= 0) {
    return "no_materials";
  }

  return "on_site";
}

export function isSectionVisibleOnSite(
  status: ProductStatus,
  publishedMaterialCount: number,
): boolean {
  return getSectionSiteVisibility(status, publishedMaterialCount) === "on_site";
}

export function isVisibleCatalogSection(item: CatalogItem): boolean {
  return item.kind === "section" && (item.materialCount ?? 0) > 0;
}

export function filterVisibleCatalogSections(items: CatalogItem[]): CatalogItem[] {
  return items.filter(isVisibleCatalogSection);
}
