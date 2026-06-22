import { notFound, redirect } from "next/navigation";

import { CatalogErrorState } from "@/components/catalog/catalog-states";
import { SectionDetailView } from "@/components/catalog/section/section-detail-view";
import { getSectionBySlug } from "@/lib/catalog/detail-queries";
import {
  getPreferredSectionPageSlug,
  getSectionPageHref,
} from "@/lib/catalog/section-pages";
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

  const preferredSlug = getPreferredSectionPageSlug(data.catalogSlug);
  if (slug === data.catalogSlug && slug !== preferredSlug) {
    redirect(getSectionPageHref(preferredSlug));
  }

  const reviewsData = await getProductReviewsData(data.id);

  return <SectionDetailView section={data} reviewsData={reviewsData} />;
}
