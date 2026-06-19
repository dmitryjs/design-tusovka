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

export function getSectionCoverPath(slug: string): string | null {
  return SECTION_COVER_BY_SLUG[slug] ?? null;
}

export function formatSectionRating(rating: number): string {
  return Math.min(5, Math.max(0, rating)).toFixed(1);
}
