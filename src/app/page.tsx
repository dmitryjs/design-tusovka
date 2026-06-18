import { CatalogHome } from "@/components/catalog/catalog-home";
import { getCatalogItems } from "@/lib/catalog/queries";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { items, error } = await getCatalogItems();

  return <CatalogHome initialItems={items} error={error} />;
}
