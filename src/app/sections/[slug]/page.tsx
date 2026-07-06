import { notFound } from "next/navigation";

import { CatalogErrorState } from "@/components/catalog/catalog-states";
import { SectionDetailView } from "@/components/catalog/section/section-detail-view";
import { getPaidProductCartState } from "@/lib/cart/access";
import { getSectionBySlug } from "@/lib/catalog/detail-queries";
import { calculateSectionCheckoutPriceKopecks } from "@/lib/catalog/section-pricing";
import { hasProductAccess } from "@/lib/entitlements/access";
import { getProductReviewsData } from "@/lib/reviews/queries";

export const dynamic = "force-dynamic";

type SectionPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function SectionPage({ params }: SectionPageProps) {
  const { slug } = await params;
  const { data, error } = await getSectionBySlug(slug);

  if (error) {
    return <CatalogErrorState message={error} />;
  }

  if (!data) {
    notFound();
  }

  const reviewsData = await getProductReviewsData(data.id);
  const hasSectionAccess = await hasProductAccess(data.id);
  const accessibleMaterialIds = new Set<string>();

  if (!hasSectionAccess) {
    await Promise.all(
      data.materials.map(async (material) => {
        if (material.priceKopecks > 0 && (await hasProductAccess(material.id))) {
          accessibleMaterialIds.add(material.id);
        }
      }),
    );
  }

  const displayPriceKopecks = hasSectionAccess
    ? data.priceKopecks
    : calculateSectionCheckoutPriceKopecks(data.materials, accessibleMaterialIds);

  const cartState = await getPaidProductCartState(data.id, displayPriceKopecks);

  return (
    <SectionDetailView
      section={{ ...data, priceKopecks: displayPriceKopecks }}
      reviewsData={reviewsData}
      cartState={cartState}
      hasSectionAccess={hasSectionAccess}
      accessibleMaterialIds={[...accessibleMaterialIds]}
    />
  );
}
