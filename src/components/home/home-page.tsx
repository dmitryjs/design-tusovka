import { MaterialCard } from "@/components/catalog/material-card";
import { SectionCard } from "@/components/catalog/section-card";
import { TaskCard } from "@/components/catalog/task-card";
import { HomeHeroBanner } from "@/components/home/home-hero-banner";
import {
  PageSection,
  PageSectionLink,
  PageShell,
} from "@/components/layout/page-shell";
import type { CatalogItem } from "@/lib/catalog/types";

type HomePageProps = {
  items: CatalogItem[];
};

export function HomePage({ items }: HomePageProps) {
  const sections = items
    .filter((item) => item.kind === "section")
    .slice(0, 6);
  const materials = items
    .filter((item) => item.kind === "material" && item.format && item.level)
    .slice(0, 4);
  const tasks = items.filter((item) => item.kind === "task").slice(0, 3);

  return (
    <PageShell breadcrumbs={[]}>
      <HomeHeroBanner />

      {sections.length > 0 ? (
        <PageSection
          id="how-it-works"
          title="Разделы"
          action={<PageSectionLink href="/catalog">Все разделы</PageSectionLink>}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
            {sections.map((section) => (
              <SectionCard key={section.id} section={section} />
            ))}
          </div>
        </PageSection>
      ) : null}

      {materials.length > 0 ? (
        <PageSection
          title="Популярные материалы"
          action={<PageSectionLink href="/catalog">Смотреть все</PageSectionLink>}
        >
          <div className="flex flex-col gap-4">
            {materials.map((item) => (
              <MaterialCard
                key={item.id}
                material={{
                  slug: item.slug,
                  title: item.title,
                  description: item.description,
                  priceKopecks: item.priceKopecks,
                  format: item.format!,
                  level: item.level!,
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
