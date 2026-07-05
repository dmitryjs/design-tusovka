import { getCatalogItemHref } from "@/lib/catalog/paths";
import { buildVisibleSectionCards } from "@/lib/catalog/section-cards";
import type { CatalogItem } from "@/lib/catalog/types";

export type SectionPageConfig = {
  pageSlug: string;
  catalogSlug: string;
  heroTitle: string;
  heroDescription: string;
  cardTitleLines: readonly string[];
  coverPath: string;
  /** Цена раздела в копейках, если в БД ещё 0 ₽ */
  priceKopecks: number;
};

/** Единственные разделы платформы (6 шт.) */
export const SECTION_PAGES: SectionPageConfig[] = [
  {
    pageSlug: "job-search",
    catalogSlug: "job-and-portfolio",
    heroTitle: "Поиск работы",
    heroDescription:
      "Стратегия поиска, отклики и подготовка к собеседованиям для product и UX/UI дизайнеров.",
    cardTitleLines: ["ПОИСК", "РАБОТЫ"],
    coverPath: "/themes/job-search.png",
    priceKopecks: 249_000,
  },
  {
    pageSlug: "resume-portfolio",
    catalogSlug: "job-and-portfolio",
    heroTitle: "Резюме и портфолио",
    heroDescription:
      "Как собирать, оформлять и защищать кейсы, когда цифр мало, а внимание рекрутера дорого.",
    cardTitleLines: ["РЕЗЮМЕ", "И ПОРТФОЛИО"],
    coverPath: "/themes/Resume.png",
    priceKopecks: 249_000,
  },
  {
    pageSlug: "grade-growth",
    catalogSlug: "grade-growth",
    heroTitle: "Рост грейда",
    heroDescription:
      "Навыки и кейсы для перехода с junior на middle и с middle на senior.",
    cardTitleLines: ["РОСТ", "ГРЕЙДА"],
    coverPath: "/themes/Grade.png",
    priceKopecks: 249_000,
  },
  {
    pageSlug: "product-thinking",
    catalogSlug: "product-thinking",
    heroTitle: "Продуктовое мышление",
    heroDescription:
      "Как читать задачу, формулировать гипотезы и принимать продуктовые решения в дизайне.",
    cardTitleLines: ["ПРОДУКТОВОЕ", "МЫШЛЕНИЕ"],
    coverPath: "/themes/Thinking.png",
    priceKopecks: 249_000,
  },
  {
    pageSlug: "ai-design",
    catalogSlug: "ai-design-engineering",
    heroTitle: "AI в дизайне и вайбкодинг",
    heroDescription:
      "AI-инструменты, промпты и практики для ускорения UX/UI и прототипирования в 2026.",
    cardTitleLines: ["AI В ДИЗАЙНЕ", "И ВАЙБКОДИНГ"],
    coverPath: "/themes/AI.png",
    priceKopecks: 249_000,
  },
  {
    pageSlug: "real-product-work",
    catalogSlug: "real-product-work",
    heroTitle: "Реальная работа в продукте",
    heroDescription:
      "Коммуникация с командой, приоритизация, метрики и ежедневные задачи product designer.",
    cardTitleLines: ["РЕАЛЬНАЯ РАБОТА", "В ПРОДУКТЕ"],
    coverPath: "/themes/Work.png",
    priceKopecks: 249_000,
  },
];

const PAGE_BY_SLUG = new Map(SECTION_PAGES.map((page) => [page.pageSlug, page]));

const ALLOWED_CATALOG_SLUGS = new Set(SECTION_PAGES.map((page) => page.catalogSlug));

/** Slug'и снятых с витрины разделов — всегда 404 */
const BLOCKED_SECTION_SLUGS = new Set([
  "whiteboards-and-practice",
  "ux-product-ai",
  "portfolio-and-cases",
  "start-product-design",
]);

export function isAllowedSectionSlug(slug: string): boolean {
  if (BLOCKED_SECTION_SLUGS.has(slug)) {
    return false;
  }

  if (PAGE_BY_SLUG.has(slug)) {
    return true;
  }

  return ALLOWED_CATALOG_SLUGS.has(slug);
}

export function resolveSectionCatalogSlug(slug: string): string {
  return PAGE_BY_SLUG.get(slug)?.catalogSlug ?? slug;
}

export function resolveSectionPageConfig(
  requestedSlug: string,
  catalogSlug: string,
): SectionPageConfig | null {
  const byPage = PAGE_BY_SLUG.get(requestedSlug);
  if (byPage) {
    return byPage;
  }

  if (requestedSlug === catalogSlug) {
    return SECTION_PAGES.find((page) => page.pageSlug === catalogSlug) ?? null;
  }

  return null;
}

export function getSectionCatalogSlugCandidates(catalogSlug: string): string[] {
  const slugs = new Set<string>([catalogSlug]);

  for (const page of SECTION_PAGES) {
    if (page.catalogSlug === catalogSlug) {
      slugs.add(page.pageSlug);
    }
  }

  return [...slugs];
}

export function resolveSectionDisplayTitle(
  sectionSlug: string,
  dbTitle?: string | null,
): string {
  if (dbTitle?.trim()) {
    return dbTitle.trim();
  }

  const catalogSlug = resolveSectionCatalogSlug(sectionSlug);
  const byPageSlug = SECTION_PAGES.find((page) => page.pageSlug === sectionSlug);
  if (byPageSlug) {
    return byPageSlug.heroTitle;
  }

  const byCatalog = SECTION_PAGES.find((page) => page.catalogSlug === catalogSlug);
  if (byCatalog) {
    return byCatalog.heroTitle;
  }

  return catalogSlug;
}

export function resolveSectionPriceKopecks(
  dbPriceKopecks: number,
  pageConfig: SectionPageConfig | null,
): number {
  if (dbPriceKopecks > 0) {
    return dbPriceKopecks;
  }

  return pageConfig?.priceKopecks ?? 0;
}

export function getPreferredSectionPageSlug(catalogSlug: string): string {
  const page = SECTION_PAGES.find((item) => item.catalogSlug === catalogSlug);
  return page?.pageSlug ?? catalogSlug;
}

export function getSectionPageHref(pageSlug: string): string {
  return getCatalogItemHref("section", pageSlug);
}

export function getPreferredSectionPageHref(sectionSlug: string): string {
  return getSectionPageHref(sectionSlug);
}

export function buildHomeSectionCards(items: CatalogItem[]): Array<{
  slug: string;
  cardTitleLines: readonly string[];
  coverPath: string;
  href: string;
}> {
  return buildVisibleSectionCards(items);
}

/** @deprecated Используйте isVisibleCatalogSection из section-visibility */
export function isPublishedCatalogSectionSlug(catalogSlug: string): boolean {
  return ALLOWED_CATALOG_SLUGS.has(catalogSlug);
}
