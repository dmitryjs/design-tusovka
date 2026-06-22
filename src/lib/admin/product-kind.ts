import { getCatalogItemHref } from "@/lib/catalog/paths";
import { getKindLabel } from "@/lib/catalog/format";
import type { CatalogItemKind } from "@/lib/catalog/types";
import type { Database } from "@/types/database.types";

type ProductKind = Database["public"]["Enums"]["product_kind"];

const EXTRA_KIND_LABELS: Partial<Record<ProductKind, string>> = {
  section_update: "Обновление раздела",
};

export function getAdminProductKindLabel(kind: ProductKind): string {
  if (kind in EXTRA_KIND_LABELS) {
    return EXTRA_KIND_LABELS[kind] ?? kind;
  }

  return getKindLabel(kind as CatalogItemKind);
}

export function getAdminProductHref(
  kind: ProductKind,
  slug: string,
): string | null {
  if (kind === "material" || kind === "task" || kind === "section") {
    return getCatalogItemHref(kind, slug);
  }

  return null;
}
