const DEMO_MATERIAL_RATINGS: Record<
  string,
  { averageRating: number; reviewCount: number }
> = {
  "kak-chitat-produktovuyu-zadachu": { averageRating: 4.8, reviewCount: 215 },
  "junior-designer-2026": { averageRating: 4.7, reviewCount: 132 },
  "kak-dokazat-rezultat-bez-metrik": { averageRating: 4.6, reviewCount: 98 },
  "kak-oformit-keis-bez-tsifr": { averageRating: 4.9, reviewCount: 356 },
  "checklist-pered-testovym": { averageRating: 4.8, reviewCount: 177 },
  "ux-audit-za-30-minut": { averageRating: 4.7, reviewCount: 842 },
  "cv-dlya-product-designer": { averageRating: 4.5, reviewCount: 64 },
  "ai-prompty-dlya-ux": { averageRating: 4.9, reviewCount: 421 },
};

export function resolveMaterialRating(
  slug: string,
  averageRating?: number | null,
  reviewCount?: number | null,
): { averageRating: number; reviewCount: number } {
  if (averageRating != null && averageRating > 0) {
    return {
      averageRating,
      reviewCount: reviewCount ?? 0,
    };
  }

  return (
    DEMO_MATERIAL_RATINGS[slug] ?? {
      averageRating: 4.7,
      reviewCount: 0,
    }
  );
}
