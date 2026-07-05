import { notFound } from "next/navigation";

import { CatalogErrorState } from "@/components/catalog/catalog-states";
import { SectionDetailView } from "@/components/catalog/section/section-detail-view";
import { getPaidProductCartState } from "@/lib/cart/access";
import { getSectionBySlug } from "@/lib/catalog/detail-queries";
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
  const cartState = await getPaidProductCartState(data.id, data.priceKopecks);

  return (
    <SectionDetailView
      section={data}
      reviewsData={reviewsData}
      cartState={cartState}
    />
  );
}
