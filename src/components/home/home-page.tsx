import { CatalogMaterialsSection } from "@/components/catalog/catalog-materials-section";
import { HomeHeroBanner } from "@/components/home/home-hero-banner";
import { HomeSectionCard } from "@/components/home/home-section-card";
import { PageShell } from "@/components/layout/page-shell";
import { Separator } from "@/components/ui/separator";
import { buildVisibleSectionCards } from "@/lib/catalog/section-cards";
import type { CatalogItem } from "@/lib/catalog/types";

type HomePageProps = {
  items: CatalogItem[];
  initialQuery?: string;
};

export function HomePage({ items, initialQuery = "" }: HomePageProps) {
  const visibleSectionCards = buildVisibleSectionCards(items);

  return (
    <PageShell breadcrumbs={[]}>
      <HomeHeroBanner />

      {visibleSectionCards.length > 0 ? (
        <section id="sections" aria-label="Разделы" className="mt-8 md:mt-10 scroll-mt-24">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visibleSectionCards.map((section) => (
              <HomeSectionCard key={section.slug} section={section} />
            ))}
          </div>
        </section>
      ) : null}

      {visibleSectionCards.length > 0 ? (
        <Separator className="mt-8 bg-neutral-200 md:mt-10" />
      ) : null}

      <CatalogMaterialsSection
        key={initialQuery}
        initialItems={items}
        initialQuery={initialQuery}
        hideSectionFilters={visibleSectionCards.length === 0}
        className="mt-8 space-y-4 scroll-mt-24 md:mt-10"
      />
    </PageShell>
  );
}
