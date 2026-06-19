import { notFound } from "next/navigation";

import { CatalogErrorState } from "@/components/catalog/catalog-states";
import { SectionDetailView } from "@/components/catalog/section-detail";
import { getSectionBySlug } from "@/lib/catalog/detail-queries";

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

  return <SectionDetailView section={data} />;
}
