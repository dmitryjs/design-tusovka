import { notFound } from "next/navigation";

import { CatalogErrorState } from "@/components/catalog/catalog-states";
import { TaskDetailView } from "@/components/catalog/task-detail";
import { getTaskBySlug } from "@/lib/catalog/detail-queries";
import { getFreeProductClaimState } from "@/lib/entitlements/access";
import { getPaidProductCartState } from "@/lib/cart/access";

export const dynamic = "force-dynamic";

type TaskPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function TaskPage({ params }: TaskPageProps) {
  const { slug } = await params;
  const { data, error } = await getTaskBySlug(slug);

  if (error) {
    return <CatalogErrorState message={error} />;
  }

  if (!data) {
    notFound();
  }

  const claimState = await getFreeProductClaimState(data.id, data.priceKopecks);
  const cartState = await getPaidProductCartState(data.id, data.priceKopecks);

  return (
    <TaskDetailView task={data} claimState={claimState} cartState={cartState} />
  );
}
