import { getCatalogItemHref } from "@/lib/catalog/paths";
import {
  getSectionCoverPath,
  type HomeSectionCardItem,
} from "@/lib/catalog/section-covers";
import { filterVisibleCatalogSections } from "@/lib/catalog/section-visibility";
import type { CatalogItem } from "@/lib/catalog/types";

function sectionCardTitleLines(title: string): readonly string[] {
  const trimmed = title.trim();
  const splitIndex = trimmed.indexOf(" и ");

  if (splitIndex > 0 && splitIndex < trimmed.length - 3) {
    return [trimmed.slice(0, splitIndex), trimmed.slice(splitIndex + 1)];
  }

  return [trimmed];
}

export function buildVisibleSectionCards(
  items: CatalogItem[],
): HomeSectionCardItem[] {
  return filterVisibleCatalogSections(items)
    .sort(
      (left, right) =>
        (left.sectionPosition ?? 0) - (right.sectionPosition ?? 0) ||
        left.title.localeCompare(right.title, "ru"),
    )
    .map((section) => ({
      slug: section.slug,
      cardTitleLines: sectionCardTitleLines(section.title),
      coverPath:
        section.coverPath ?? getSectionCoverPath(section.slug) ?? "",
      href: getCatalogItemHref("section", section.slug),
    }));
}
