export const SECTION_PRICE_MULTIPLIER = 0.75;

export function calculateSectionPriceKopecks(
  materials: ReadonlyArray<{ priceKopecks: number }>,
): number {
  const paidSumKopecks = materials.reduce(
    (sum, material) =>
      material.priceKopecks > 0 ? sum + material.priceKopecks : sum,
    0,
  );

  if (paidSumKopecks <= 0) {
    return 0;
  }

  return Math.round(paidSumKopecks * SECTION_PRICE_MULTIPLIER);
}
