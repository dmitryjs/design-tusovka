import { CatalogPage } from "@/components/catalog/catalog-page";
import { getCatalogItems } from "@/lib/catalog/queries";

export const dynamic = "force-dynamic";

type CatalogRouteProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function CatalogRoute({ searchParams }: CatalogRouteProps) {
  const { q } = await searchParams;
  const { items, error } = await getCatalogItems();

  return (
    <CatalogPage
      initialItems={items}
      initialQuery={q ?? ""}
      error={error}
    />
  );
}
