import type { CatalogItem } from "@/lib/catalog/types";
import { getCatalogItemHref } from "@/lib/catalog/paths";

const SECTION_COVER_BY_SLUG: Record<string, string> = {
  "job-and-portfolio": "/themes/theme-job-portfolio.png",
  "portfolio-and-cases": "/themes/theme-job-portfolio.png",
  "grade-growth": "/themes/theme-grade-growth.png",
  "product-thinking": "/themes/theme-product-thinking.png",
  "start-product-design": "/themes/theme-product-thinking.png",
  "ai-design-engineering": "/themes/theme-ai.png",
  "ux-product-ai": "/themes/theme-ai.png",
  "real-product-work": "/themes/theme-real-work.png",
  "whiteboards-and-practice": "/themes/theme-whiteboard.png",
};

export const HOME_SECTIONS = [
  {
    slug: "job-search",
    catalogSlug: "job-and-portfolio",
    cardTitleLines: ["ПОИСК", "РАБОТЫ"],
    coverPath: "/themes/job-search.png",
  },
  {
    slug: "resume-portfolio",
    catalogSlug: "job-and-portfolio",
    cardTitleLines: ["РЕЗЮМЕ", "И ПОРТФОЛИО"],
    coverPath: "/themes/Resume.png",
  },
  {
    slug: "grade-growth",
    catalogSlug: "grade-growth",
    cardTitleLines: ["РОСТ", "ГРЕЙДА"],
    coverPath: "/themes/Grade.png",
  },
  {
    slug: "product-thinking",
    catalogSlug: "product-thinking",
    cardTitleLines: ["ПРОДУКТОВОЕ", "МЫШЛЕНИЕ"],
    coverPath: "/themes/Thinking.png",
  },
  {
    slug: "ai-design",
    catalogSlug: "ai-design-engineering",
    cardTitleLines: ["AI В ДИЗАЙНЕ", "И ВАЙБКОДИНГ"],
    coverPath: "/themes/AI.png",
  },
  {
    slug: "real-product-work",
    catalogSlug: "real-product-work",
    cardTitleLines: ["РЕАЛЬНАЯ РАБОТА", "В ПРОДУКТЕ"],
    coverPath: "/themes/Work.png",
  },
] as const;

export type HomeSectionCardItem = {
  slug: string;
  cardTitleLines: readonly string[];
  coverPath: string;
  href: string;
};

export function getSectionCoverPath(slug: string): string | null {
  return SECTION_COVER_BY_SLUG[slug] ?? null;
}

export function formatSectionRating(rating: number): string {
  return Math.min(5, Math.max(0, rating)).toFixed(1);
}

export function buildHomeSectionCards(
  _items?: CatalogItem[],
): HomeSectionCardItem[] {
  return HOME_SECTIONS.map((section) => ({
    slug: section.slug,
    cardTitleLines: section.cardTitleLines,
    coverPath: section.coverPath,
    href: getCatalogItemHref("section", section.catalogSlug),
  }));
}
