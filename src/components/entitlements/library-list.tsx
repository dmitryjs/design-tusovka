import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  formatPrice,
  getKindLabel,
  getLevelLabel,
  getMaterialFormatLabel,
} from "@/lib/catalog/format";
import { getCatalogItemHref } from "@/lib/catalog/paths";
import type { LibraryItem } from "@/lib/entitlements/types";

import { CatalogEmptyPanel } from "@/components/catalog/catalog-detail-shell";

type LibraryListProps = {
  items: LibraryItem[];
};

export function LibraryList({ items }: LibraryListProps) {
  if (items.length === 0) {
    return (
      <CatalogEmptyPanel
        title="Библиотека пуста"
        description="Получите бесплатный материал или задание на его странице — кнопка «Получить бесплатно»."
      />
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.productId}>
          <Link
            href={getCatalogItemHref(item.kind, item.slug)}
            className="group block rounded-xl border border-neutral-200 bg-card p-4 transition-colors hover:border-primary/20 hover:bg-neutral-50 sm:p-5"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{getKindLabel(item.kind)}</Badge>
              {item.kind === "material" && item.format ? (
                <Badge variant="outline">
                  {getMaterialFormatLabel(item.format)}
                </Badge>
              ) : null}
              {item.level !== "all" ? (
                <Badge variant="outline">{getLevelLabel(item.level)}</Badge>
              ) : null}
              <Badge
                variant={item.priceKopecks === 0 ? "default" : "outline"}
                className={
                  item.priceKopecks === 0 ? "bg-primary text-primary-foreground" : undefined
                }
              >
                {formatPrice(item.priceKopecks)}
              </Badge>
            </div>
            <h3 className="mt-3 text-base font-semibold text-foreground group-hover:text-primary">
              {item.title}
            </h3>
            <p className="mt-1 text-sm text-neutral-500">
              Добавлено{" "}
              {new Intl.DateTimeFormat("ru-RU", {
                dateStyle: "medium",
              }).format(new Date(item.grantedAt))}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
