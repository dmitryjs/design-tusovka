import { BarChart3 } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { formatPrice, getLevelLongLabel, getMaterialFormatLabel } from "@/lib/catalog/format";
import { getCatalogItemHref } from "@/lib/catalog/paths";
import type { Database } from "@/types/database.types";
import { cn } from "@/lib/utils";

export type MaterialCardData = {
  slug: string;
  title: string;
  description: string;
  priceKopecks: number;
  format: Database["public"]["Enums"]["material_format"];
  level: Database["public"]["Enums"]["designer_level"];
};

type MaterialCardProps = {
  material: MaterialCardData;
  className?: string;
};

const FORMAT_THUMB_CLASS: Partial<
  Record<Database["public"]["Enums"]["material_format"], string>
> = {
  practice: "bg-purple-50 text-purple-700",
  lesson: "bg-blue-50 text-blue-700",
  mini_guide: "bg-emerald-50 text-emerald-700",
  full_guide: "bg-sky-50 text-sky-700",
  checklist: "bg-amber-50 text-amber-800",
  template: "bg-orange-50 text-orange-700",
  cheat_sheet: "bg-violet-50 text-violet-700",
  notes: "bg-neutral-100 text-neutral-700",
};

function getThumbClass(
  format: Database["public"]["Enums"]["material_format"],
): string {
  return FORMAT_THUMB_CLASS[format] ?? "bg-blue-50 text-blue-700";
}

export function MaterialCard({ material, className }: MaterialCardProps) {
  const isFree = material.priceKopecks === 0;
  const formatLabel = getMaterialFormatLabel(material.format);
  const thumbClass = getThumbClass(material.format);

  return (
    <Link
      href={getCatalogItemHref("material", material.slug)}
      className={cn(
        "group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200",
        className,
      )}
    >
      <article className="flex h-full flex-col gap-4 rounded-xl border border-neutral-200 bg-card p-4 transition-colors hover:border-primary/20 hover:bg-neutral-50 sm:flex-row sm:items-stretch sm:p-5">
        <div
          className={cn(
            "relative flex aspect-[4/3] w-full shrink-0 items-center justify-center overflow-hidden rounded-xl sm:aspect-auto sm:h-auto sm:w-36 md:w-40",
            thumbClass,
          )}
        >
          <Badge
            className="absolute top-2 left-2 border-0 bg-white/90 text-[11px] text-foreground shadow-sm"
            variant="secondary"
          >
            {formatLabel}
          </Badge>
          <span className="px-3 text-center text-xs leading-5 font-medium opacity-80">
            {formatLabel}
          </span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="space-y-2">
            <h3 className="text-base leading-6 font-semibold text-foreground group-hover:text-primary">
              {material.title}
            </h3>
            {material.description ? (
              <p className="line-clamp-2 text-sm leading-6 text-neutral-600">
                {material.description}
              </p>
            ) : null}
          </div>

          <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
            {material.level !== "all" ? (
              <div className="flex items-center gap-1.5 text-sm text-neutral-600">
                <BarChart3 className="size-4 shrink-0 text-neutral-400" aria-hidden />
                <span>{getLevelLongLabel(material.level)}</span>
              </div>
            ) : (
              <span />
            )}

            <p
              className={cn(
                "text-lg font-semibold",
                isFree ? "text-primary" : "text-foreground",
              )}
            >
              {formatPrice(material.priceKopecks)}
            </p>
          </div>
        </div>
      </article>
    </Link>
  );
}
