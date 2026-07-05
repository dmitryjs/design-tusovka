const SECTION_COVER_BY_SLUG: Record<string, string> = {
  "job-and-portfolio": "/themes/job-search.png",
  "grade-growth": "/themes/Grade.png",
  "product-thinking": "/themes/Thinking.png",
  "ai-design-engineering": "/themes/AI.png",
  "real-product-work": "/themes/Work.png",
};

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
