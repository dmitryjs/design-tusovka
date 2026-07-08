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
  searchParams?: Promise<{ from?: string }>;
};

function sanitizeFrom(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  return value;
}

export default async function MaterialReadPage({ params, searchParams }: MaterialReadPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const { data, error } = await getMaterialBySlug(slug, { includeChapterContent: true });

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
  const fromHref = sanitizeFrom(resolvedSearchParams?.from);

  return (
    <MaterialReadingView
      material={data}
      claimState={claimState}
      cartState={cartState}
      reviewsData={reviewsData}
      fromHref={fromHref}
    />
  );
}
