import { notFound } from "next/navigation";

import { CatalogErrorState } from "@/components/catalog/catalog-states";
import { MaterialDetailView } from "@/components/catalog/material-detail";
import { getMaterialBySlug } from "@/lib/catalog/detail-queries";
import { getFreeProductClaimState } from "@/lib/entitlements/access";
import { getPaidProductCartState } from "@/lib/cart/access";

export const dynamic = "force-dynamic";

type MaterialPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function MaterialPage({ params }: MaterialPageProps) {
  const { slug } = await params;
  const { data, error } = await getMaterialBySlug(slug);

  if (error) {
    return <CatalogErrorState message={error} />;
  }

  if (!data) {
    notFound();
  }

  const claimState = await getFreeProductClaimState(data.id, data.priceKopecks);
  const cartState = await getPaidProductCartState(data.id, data.priceKopecks);

  return (
    <MaterialDetailView
      material={data}
      claimState={claimState}
      cartState={cartState}
    />
  );
}
