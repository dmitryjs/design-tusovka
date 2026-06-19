import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { formatPrice, getKindLabel } from "@/lib/catalog/format";
import { getCatalogItemHref } from "@/lib/catalog/paths";
import type { CatalogItem } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";

type SectionCardProps = {
  section: CatalogItem;
  className?: string;
};

export function SectionCard({ section, className }: SectionCardProps) {
  const isFree = section.priceKopecks === 0;

  return (
    <Link
      href={getCatalogItemHref("section", section.slug)}
      className={cn(
        "group block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200",
        className,
      )}
    >
      <article className="flex h-full flex-col rounded-xl border border-neutral-200 bg-card p-5 transition-colors hover:border-primary/20 hover:bg-neutral-50">
        <Badge variant="secondary" className="w-fit">
          {getKindLabel("section")}
        </Badge>
        <h3 className="mt-3 text-base leading-6 font-semibold text-foreground group-hover:text-primary">
          {section.title}
        </h3>
        {section.description ? (
          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-neutral-600">
            {section.description}
          </p>
        ) : null}
        <p
          className={cn(
            "mt-4 text-sm font-semibold",
            isFree ? "text-primary" : "text-foreground",
          )}
        >
          {formatPrice(section.priceKopecks)}
        </p>
      </article>
    </Link>
  );
}
