import { TaskCard } from "@/components/catalog/task-card";
import { CatalogEmptyPanel } from "@/components/catalog/catalog-detail-shell";
import { PopularMaterialCard } from "@/components/home/popular-material-card";
import type { CatalogItem } from "@/lib/catalog/types";
import type { LibraryItem } from "@/lib/entitlements/types";

type LibraryListProps = {
  items: LibraryItem[];
};

function toTaskCatalogItem(item: LibraryItem): CatalogItem {
  return {
    id: item.productId,
    slug: item.slug,
    title: item.title,
    description: item.description,
    kind: "task",
    priceKopecks: item.priceKopecks,
    tags: [],
    level: item.level,
  };
}

export function LibraryList({ items }: LibraryListProps) {
  if (items.length === 0) {
    return (
      <CatalogEmptyPanel
        title="Библиотека пуста"
        description="Получите бесплатный материал или задание на его странице — кнопка «Получить бесплатно»."
      />
    );
  }

  const isMaterials = items[0]?.kind === "material";

  if (isMaterials) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) =>
          item.format ? (
            <PopularMaterialCard
              key={item.productId}
              variant="library"
              className="w-full min-w-0"
              material={{
                slug: item.slug,
                title: item.title,
                description: item.description,
                priceKopecks: item.priceKopecks,
                format: item.format,
                coverPath: item.coverPath,
                averageRating: item.averageRating,
                reviewCount: item.reviewCount,
              }}
            />
          ) : null,
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <TaskCard key={item.productId} task={toTaskCatalogItem(item)} />
      ))}
    </div>
  );
}
