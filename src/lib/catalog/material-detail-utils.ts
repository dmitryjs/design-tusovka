export function chapterCountLabel(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return "глава";
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return "главы";
  }

  return "глав";
}

export function formatMaterialUpdatedAt(value: string | null): string | null {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export type MaterialPriceBadgeKind = "free" | "paid" | "owned";

export function resolveMaterialPriceBadgeKind(
  priceKopecks: number,
  hasFullAccess: boolean,
  isAuthenticatedOwned: boolean,
): MaterialPriceBadgeKind {
  if (hasFullAccess && (priceKopecks > 0 || isAuthenticatedOwned)) {
    return "owned";
  }

  if (priceKopecks === 0) {
    return "free";
  }

  return "paid";
}
