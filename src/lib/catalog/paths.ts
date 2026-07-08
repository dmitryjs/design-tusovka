import type { CatalogItemKind } from "./types";

const KIND_PATH: Record<CatalogItemKind, string> = {
  section: "sections",
  material: "materials",
  task: "tasks",
};

export function getCatalogItemHref(kind: CatalogItemKind, slug: string): string {
  return `/${KIND_PATH[kind]}/${slug}`;
}

export function getMaterialReadHref(slug: string): string {
  return `/materials/${slug}/read`;
}

export function getMaterialReadHrefWithFrom(slug: string, fromHref?: string): string {
  const href = getMaterialReadHref(slug);
  if (!fromHref) {
    return href;
  }

  return `${href}?from=${encodeURIComponent(fromHref)}`;
}
