"use client";

import { useMemo, useState } from "react";
import { Check, Lock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { CatalogEmptyPanel } from "@/components/catalog/catalog-detail-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice, getMaterialFormatLabel } from "@/lib/catalog/format";
import { getCatalogItemHref } from "@/lib/catalog/paths";
import {
  getMaterialCoverPlaceholderClass,
  resolveMaterialCoverUrl,
} from "@/lib/catalog/material-cover";
import {
  getSectionMaterialFormatBadgeClass,
  sectionMaterialsCountLabel,
} from "@/lib/catalog/section-detail-utils";
import type { SectionMaterialSummary } from "@/lib/catalog/detail-queries";
import { cn } from "@/lib/utils";

const INITIAL_VISIBLE_COUNT = 6;

type SectionMaterialsListProps = {
  materials: SectionMaterialSummary[];
  hasSectionAccess?: boolean;
  accessibleMaterialIds?: ReadonlySet<string>;
};

function MaterialRow({
  material,
  hasAccess,
}: {
  material: SectionMaterialSummary;
  hasAccess: boolean;
}) {
  const isFree = material.priceKopecks === 0;
  const isUnlocked = isFree || hasAccess;
  const formatLabel = getMaterialFormatLabel(material.format);
  const coverUrl = resolveMaterialCoverUrl(material.coverPath);
  const placeholderClass = getMaterialCoverPlaceholderClass(material.format);

  return (
    <li>
      <Link
        href={getCatalogItemHref("material", material.slug)}
        className="group flex items-center gap-4 rounded-xl border border-neutral-200 bg-white px-4 py-4 transition-colors hover:border-primary/20 hover:bg-neutral-50 sm:px-5"
      >
        <div
          className={cn(
            "relative size-14 shrink-0 overflow-hidden rounded-lg",
            !coverUrl && cn("flex items-center justify-center text-xs font-medium", placeholderClass),
          )}
          aria-hidden
        >
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt=""
              fill
              sizes="56px"
              className="object-cover"
            />
          ) : (
            formatLabel.slice(0, 1)
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              className={cn("border-0", getSectionMaterialFormatBadgeClass(material.format))}
            >
              {formatLabel}
            </Badge>
          </div>
          <h3 className="mt-1 line-clamp-1 text-sm font-semibold text-foreground group-hover:text-primary">
            {material.title}
          </h3>
          {material.description ? (
            <p className="mt-0.5 line-clamp-1 text-sm text-neutral-500">
              {material.description}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2 text-sm font-semibold">
          {isUnlocked ? (
            <>
              <Check className="size-4 text-primary" aria-hidden />
              <span className={isFree ? "text-primary" : "text-foreground"}>
                {isFree ? "Бесплатно" : formatPrice(material.priceKopecks)}
              </span>
            </>
          ) : (
            <>
              <Lock className="size-4 text-neutral-400" aria-hidden />
              <span className="text-foreground">{formatPrice(material.priceKopecks)}</span>
            </>
          )}
        </div>
      </Link>
    </li>
  );
}

export function SectionMaterialsList({
  materials,
  hasSectionAccess = false,
  accessibleMaterialIds,
}: SectionMaterialsListProps) {
  const [showAll, setShowAll] = useState(false);

  const visibleMaterials = useMemo(
    () => (showAll ? materials : materials.slice(0, INITIAL_VISIBLE_COUNT)),
    [materials, showAll],
  );

  if (materials.length === 0) {
    return (
      <section id="section-materials" className="scroll-mt-24 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Материалы раздела</h2>
        <CatalogEmptyPanel
          title="Материалов пока нет"
          description="Когда в раздел добавят публикации, они появятся здесь."
        />
      </section>
    );
  }

  return (
    <section id="section-materials" className="scroll-mt-24 space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Материалы раздела</h2>
          <p className="mt-1 text-sm text-neutral-500">
            {materials.length} {sectionMaterialsCountLabel(materials.length)}
          </p>
        </div>
      </div>

      <ul className="flex flex-col gap-2">
        {visibleMaterials.map((material) => (
          <MaterialRow
            key={material.id}
            material={material}
            hasAccess={
              hasSectionAccess || Boolean(accessibleMaterialIds?.has(material.id))
            }
          />
        ))}
      </ul>

      {materials.length > INITIAL_VISIBLE_COUNT ? (
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          onClick={() => setShowAll((current) => !current)}
        >
          {showAll
            ? "Свернуть список"
            : `Показать ещё ${materials.length - INITIAL_VISIBLE_COUNT} ${sectionMaterialsCountLabel(materials.length - INITIAL_VISIBLE_COUNT)}`}
        </Button>
      ) : null}
    </section>
  );
}
