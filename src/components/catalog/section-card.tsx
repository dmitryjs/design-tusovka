import { FileText, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { materialCountLabel } from "@/lib/catalog/format";
import { getPreferredSectionPageHref } from "@/lib/catalog/section-pages";
import {
  formatSectionRating,
  getSectionCoverPath,
} from "@/lib/catalog/section-covers";
import { isVisibleCatalogSection } from "@/lib/catalog/section-visibility";
import type { CatalogItem } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";

type SectionCardProps = {
  section: CatalogItem;
  coverPath?: string;
  className?: string;
};

export function SectionCard({ section, coverPath, className }: SectionCardProps) {
  if (!isVisibleCatalogSection(section)) {
    return null;
  }

  const resolvedCoverPath = coverPath ?? getSectionCoverPath(section.slug);
  const materialCount = section.materialCount ?? 0;
  const hasRating =
    section.averageRating != null && section.averageRating > 0;

  return (
    <Link
      href={getPreferredSectionPageHref(section.slug)}
      className={cn(
        "group block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200",
        className,
      )}
    >
      <article className="flex h-full flex-col transition-opacity hover:opacity-95">
        <div className="relative aspect-video overflow-hidden rounded-xl bg-neutral-100">
          {resolvedCoverPath ? (
            <Image
              src={resolvedCoverPath}
              alt=""
              fill
              sizes="(min-width: 1536px) 200px, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-violet-50" />
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 pt-3">
          <h3 className="line-clamp-2 text-sm leading-5 font-semibold text-foreground group-hover:text-primary">
            {section.title}
          </h3>
          {section.description ? (
            <p className="line-clamp-2 flex-1 text-xs leading-5 text-neutral-600">
              {section.description}
            </p>
          ) : null}

          <div className="mt-1 flex items-center justify-between gap-3 text-xs text-neutral-500">
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <FileText className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate">
                {materialCount} {materialCountLabel(materialCount)}
              </span>
            </span>
            {hasRating ? (
              <span className="inline-flex shrink-0 items-center gap-1 font-medium text-foreground">
                <Star
                  className="size-3.5 fill-amber-400 text-amber-400"
                  aria-hidden
                />
                {formatSectionRating(section.averageRating!)}
              </span>
            ) : null}
          </div>
        </div>
      </article>
    </Link>
  );
}
