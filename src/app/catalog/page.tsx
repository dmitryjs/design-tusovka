import { redirect } from "next/navigation";

type CatalogRouteProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function CatalogRoute({ searchParams }: CatalogRouteProps) {
  const { q } = await searchParams;
  const query = q?.trim();

  redirect(query ? `/?q=${encodeURIComponent(query)}` : "/");
}
