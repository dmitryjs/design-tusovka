import { Badge } from "@/components/ui/badge";
import type { SectionDetail } from "@/lib/catalog/detail-queries";
import { getKindLabel } from "@/lib/catalog/format";

import {
  CatalogDetailFooterCta,
  CatalogDetailMeta,
  CatalogDetailSection,
  CatalogDetailShell,
  CatalogEmptyPanel,
} from "./catalog-detail-shell";
import { MaterialCard } from "./material-card";

type SectionDetailViewProps = {
  section: SectionDetail;
};

export function SectionDetailView({ section }: SectionDetailViewProps) {
  return (
    <CatalogDetailShell
      wide
      breadcrumbs={[
        { label: "Главная", href: "/" },
        { label: "Каталог", href: "/catalog" },
        { label: section.title },
      ]}
    >
      <CatalogDetailMeta
        kind="section"
        badges={<Badge variant="secondary">{getKindLabel("section")}</Badge>}
        title={section.title}
        description={section.description}
        priceKopecks={section.priceKopecks}
      />

      {section.forWhom.length > 0 ? (
        <CatalogDetailSection title="Для кого">
          <ul className="space-y-2 text-sm leading-6 text-neutral-700">
            {section.forWhom.map((item, index) => (
              <li key={index} className="flex gap-3">
                <span className="text-neutral-400">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CatalogDetailSection>
      ) : null}

      {section.whatYouGet.length > 0 ? (
        <CatalogDetailSection title="Что внутри">
          <ul className="space-y-2 text-sm leading-6 text-neutral-700">
            {section.whatYouGet.map((item, index) => (
              <li key={index} className="flex gap-3">
                <span className="text-neutral-400">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CatalogDetailSection>
      ) : null}

      <CatalogDetailSection
        title="Материалы раздела"
        description={
          section.materials.length > 0
            ? `${section.materials.length} ${materialCountLabel(section.materials.length)} в этом разделе`
            : undefined
        }
      >
        {section.materials.length === 0 ? (
          <CatalogEmptyPanel
            title="Материалов пока нет"
            description="Когда в раздел добавят публикации, они появятся здесь."
          />
        ) : (
          <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2">
            {section.materials.map((material) => (
              <MaterialCard
                key={material.id}
                material={{
                  slug: material.slug,
                  title: material.title,
                  description: material.description,
                  priceKopecks: material.priceKopecks,
                  format: material.format,
                  level: material.level,
                }}
              />
            ))}
          </div>
        )}
      </CatalogDetailSection>

      <CatalogDetailFooterCta />
    </CatalogDetailShell>
  );
}

function materialCountLabel(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return "материал";
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return "материала";
  }

  return "материалов";
}
