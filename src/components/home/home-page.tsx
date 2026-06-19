import Link from "next/link";

import { MaterialCard } from "@/components/catalog/material-card";
import { TaskCard } from "@/components/catalog/task-card";
import {
  PageHero,
  PageSection,
  PageSectionLink,
  PageShell,
} from "@/components/layout/page-shell";
import { buttonVariants } from "@/components/ui/button";
import { getCatalogItemHref } from "@/lib/catalog/paths";
import type { CatalogItem } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";

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
    <PageShell breadcrumbs={[{ label: "Главная" }]}>
      <PageHero
        title="Практические знания для продуктовых дизайнеров"
        description="Гайды, практики и задания для product, UX/UI и digital-дизайнеров. Начните с бесплатных материалов или смотрите превью платных."
      >
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href="/catalog" className={cn(buttonVariants({ size: "lg" }))}>
            Смотреть каталог
          </Link>
          <Link
            href="/tasks"
            className={cn(buttonVariants({ variant: "secondary", size: "lg" }))}
          >
            Все задания
          </Link>
        </div>
      </PageHero>

      {sections.length > 0 ? (
        <PageSection
          title="Выберите направление"
          action={<PageSectionLink href="/catalog">Все разделы</PageSectionLink>}
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sections.map((section) => (
              <Link
                key={section.id}
                href={getCatalogItemHref("section", section.slug)}
                className="group rounded-xl border border-neutral-200 bg-card p-5 transition-colors hover:border-primary/30 hover:bg-neutral-50"
              >
                <h3 className="text-base font-semibold text-foreground group-hover:text-primary">
                  {section.title}
                </h3>
                {section.description ? (
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-600">
                    {section.description}
                  </p>
                ) : null}
                <span className="mt-4 inline-block text-sm font-medium text-primary">
                  Открыть раздел →
                </span>
              </Link>
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
