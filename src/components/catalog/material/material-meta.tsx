import Link from "next/link";
import { Calendar, FileText, FolderOpen, Signal, Tag } from "lucide-react";

import { getLevelDifficultyLabel, getMaterialFormatLabel } from "@/lib/catalog/format";
import { formatMaterialUpdatedAt } from "@/lib/catalog/material-detail-utils";
import { getPreferredSectionPageHref } from "@/lib/catalog/section-pages";
import type { MaterialDetail } from "@/lib/catalog/detail-queries";
import { cn } from "@/lib/utils";

type MaterialMetaProps = {
  material: MaterialDetail;
  className?: string;
};

type MetaRowProps = {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  valueClassName?: string;
};

function MetaRow({ icon, label, children, valueClassName }: MetaRowProps) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 shrink-0 text-neutral-400" aria-hidden>
        {icon}
      </div>
      <div className="min-w-0">
        <dt className="text-xs leading-4 text-neutral-500">{label}</dt>
        <dd className={cn("mt-0.5 text-sm leading-5 font-medium", valueClassName)}>
          {children}
        </dd>
      </div>
    </div>
  );
}

export function MaterialMeta({ material, className }: MaterialMetaProps) {
  const updatedLabel = formatMaterialUpdatedAt(material.updatedAt);
  const themesLabel = material.tags.map((tag) => tag.name).join(", ");

  return (
    <section
      aria-label="О материале"
      className={cn(
        "rounded-xl border border-neutral-200 bg-white px-4 py-5 sm:px-5",
        className,
      )}
    >
      <h2 className="mb-4 text-base font-semibold text-foreground">О материале</h2>
      <dl className="flex flex-col gap-4">
        <MetaRow icon={<FileText className="size-4" />} label="Формат">
          {getMaterialFormatLabel(material.format)}
        </MetaRow>
        {material.section ? (
          <MetaRow
            icon={<FolderOpen className="size-4" />}
            label="Раздел"
            valueClassName="text-primary"
          >
            <Link
                href={getPreferredSectionPageHref(material.section.slug)}
              className="hover:underline"
            >
              {material.section.title}
            </Link>
          </MetaRow>
        ) : null}

        {themesLabel ? (
          <MetaRow
            icon={<Tag className="size-4" />}
            label="Темы"
            valueClassName="text-primary"
          >
            {themesLabel}
          </MetaRow>
        ) : null}

        {material.level !== "all" ? (
          <MetaRow
            icon={<Signal className="size-4" />}
            label="Уровень"
            valueClassName="text-primary"
          >
            {getLevelDifficultyLabel(material.level)}
          </MetaRow>
        ) : null}

        {updatedLabel ? (
          <MetaRow
            icon={<Calendar className="size-4" />}
            label="Обновлено"
            valueClassName="text-foreground"
          >
            {updatedLabel}
          </MetaRow>
        ) : null}
      </dl>
    </section>
  );
}
