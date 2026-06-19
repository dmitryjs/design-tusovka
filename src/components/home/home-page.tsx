import { PopularMaterialCard } from "@/components/home/popular-material-card";
import { HomeSectionCard } from "@/components/home/home-section-card";
import { TaskCard } from "@/components/catalog/task-card";
import { HomeHeroBanner } from "@/components/home/home-hero-banner";
import { PopularMaterialsIcon } from "@/components/icons/popular-materials-icon";
import {
  PageSection,
  PageSectionLink,
  PageShell,
} from "@/components/layout/page-shell";
import { buildHomeSectionCards } from "@/lib/catalog/section-covers";
import type { CatalogItem } from "@/lib/catalog/types";

type HomePageProps = {
  items: CatalogItem[];
};

export function HomePage({ items }: HomePageProps) {
  const sections = buildHomeSectionCards(items);
  const materials = items
    .filter((item) => item.kind === "material" && item.format && item.level)
    .slice(0, 5);
  const tasks = items.filter((item) => item.kind === "task").slice(0, 3);

  return (
    <PageShell breadcrumbs={[]}>
      <HomeHeroBanner />

      <PageSection
        id="how-it-works"
        title="Разделы с материалами"
        action={<PageSectionLink href="/catalog">Все разделы</PageSectionLink>}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <HomeSectionCard key={section.slug} section={section} />
          ))}
        </div>
      </PageSection>

      {materials.length > 0 ? (
        <PageSection
          title="Популярные материалы"
          titleIcon={
            <PopularMaterialsIcon className="size-6 shrink-0 text-[#FF5A1F]" />
          }
          action={
            <PageSectionLink href="/catalog">Смотреть все материалы</PageSectionLink>
          }
        >
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:-mx-0 sm:px-0 lg:grid lg:grid-cols-5 lg:overflow-visible lg:pb-0">
            {materials.map((item) => (
              <PopularMaterialCard
                key={item.id}
                material={{
                  slug: item.slug,
                  title: item.title,
                  description: item.description,
                  priceKopecks: item.priceKopecks,
                  format: item.format!,
                  coverPath: item.coverPath,
                  averageRating: item.averageRating,
                  reviewCount: item.reviewCount,
                }}
              />
            ))}
          </div>
        </PageSection>
      ) : null}

      {tasks.length > 0 ? (
        <PageSection
          title="Интерактивные задания"
          action={<PageSectionLink href="/tasks">Все задания</PageSectionLink>}
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tasks.map((item) => (
              <TaskCard key={item.id} task={item} />
            ))}
          </div>
        </PageSection>
      ) : null}
    </PageShell>
  );
}
