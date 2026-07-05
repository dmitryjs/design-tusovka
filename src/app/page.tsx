import { HomePage } from "@/components/home/home-page";
import { PageShell } from "@/components/layout/page-shell";
import { getCatalogItems } from "@/lib/catalog/queries";

export const dynamic = "force-dynamic";

type HomeProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const { q } = await searchParams;
  const { items, error } = await getCatalogItems();

  if (error) {
    return (
      <PageShell breadcrumbs={[{ label: "Главная" }]}>
        <div className="rounded-xl border border-destructive-border bg-destructive-bg px-5 py-8 text-center">
          <h1 className="text-xl font-semibold text-destructive-foreground">
            Не удалось загрузить данные
          </h1>
          <p className="mt-2 text-sm text-destructive-foreground/90">{error}</p>
        </div>
      </PageShell>
    );
  }

  return <HomePage items={items} initialQuery={q ?? ""} />;
}
