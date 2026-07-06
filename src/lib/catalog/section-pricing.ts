export const SECTION_PRICE_MULTIPLIER = 0.75;

export function sumPaidMaterialPricesKopecks(
  materials: ReadonlyArray<{ priceKopecks: number }>,
): number {
  return materials.reduce(
    (sum, material) =>
      material.priceKopecks > 0 ? sum + material.priceKopecks : sum,
    0,
  );
}

/** Цена раздела в каталоге: 75% от суммы платных материалов раздела. */
export function calculateSectionListPriceKopecks(
  materials: ReadonlyArray<{ priceKopecks: number }>,
): number {
  const paidSumKopecks = sumPaidMaterialPricesKopecks(materials);

  if (paidSumKopecks <= 0) {
    return 0;
  }

  return Math.round(paidSumKopecks * SECTION_PRICE_MULTIPLIER);
}

/** @deprecated Используйте calculateSectionListPriceKopecks */
export function calculateSectionPriceKopecks(
  materials: ReadonlyArray<{ priceKopecks: number }>,
): number {
  return calculateSectionListPriceKopecks(materials);
}

/**
 * Цена раздела к оплате: list price минус полная цена уже купленных материалов (SEC-03).
 */
export function calculateSectionCheckoutPriceKopecks(
  materials: ReadonlyArray<{ id: string; priceKopecks: number }>,
  ownedMaterialIds: ReadonlySet<string>,
): number {
  const listPrice = calculateSectionListPriceKopecks(materials);

  if (listPrice <= 0 || ownedMaterialIds.size === 0) {
    return listPrice;
  }

  const ownedPaidSum = materials.reduce((sum, material) => {
    if (material.priceKopecks > 0 && ownedMaterialIds.has(material.id)) {
      return sum + material.priceKopecks;
    }

    return sum;
  }, 0);

  return Math.max(0, listPrice - ownedPaidSum);
}

export function buildSectionPricesBySectionId(
  materials: ReadonlyArray<{
    sectionProductId: string | null;
    priceKopecks: number;
  }>,
): Map<string, number> {
  const materialsBySection = new Map<string, Array<{ priceKopecks: number }>>();

  for (const material of materials) {
    if (!material.sectionProductId) {
      continue;
    }

    const list = materialsBySection.get(material.sectionProductId) ?? [];
    list.push({ priceKopecks: material.priceKopecks });
    materialsBySection.set(material.sectionProductId, list);
  }

  const prices = new Map<string, number>();

  for (const [sectionId, sectionMaterials] of materialsBySection) {
    prices.set(sectionId, calculateSectionListPriceKopecks(sectionMaterials));
  }

  return prices;
}
