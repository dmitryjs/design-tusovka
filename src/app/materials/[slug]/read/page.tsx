import { notFound, redirect } from "next/navigation";

import { CatalogErrorState } from "@/components/catalog/catalog-states";
import { MaterialReadingView } from "@/components/catalog/material/material-reading-view";
import { getMaterialBySlug } from "@/lib/catalog/detail-queries";
import { getCatalogItemHref } from "@/lib/catalog/paths";
import { getFreeProductClaimState } from "@/lib/entitlements/access";
import { getPaidProductCartState } from "@/lib/cart/access";
import { getProductReviewsData } from "@/lib/reviews/queries";

export const dynamic = "force-dynamic";

type MaterialReadPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function MaterialReadPage({ params }: MaterialReadPageProps) {
  const { slug } = await params;
  const { data, error } = await getMaterialBySlug(slug);

  if (error) {
    return <CatalogErrorState message={error} />;
  }

  if (!data) {
    notFound();
  }

  if (!data.hasFullAccess) {
    redirect(getCatalogItemHref("material", slug));
  }

  const claimState = await getFreeProductClaimState(data.id, data.priceKopecks);
  const cartState = await getPaidProductCartState(data.id, data.priceKopecks);
  const reviewsData = await getProductReviewsData(data.id);

  return (
    <MaterialReadingView
      material={data}
      claimState={claimState}
      cartState={cartState}
      reviewsData={reviewsData}
    />
  );
}
