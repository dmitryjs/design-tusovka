import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  formatPrice,
  getKindLabel,
  getLevelLabel,
  getMaterialFormatLabel,
} from "@/lib/catalog/format";
import type { CatalogItem } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";

type CatalogCardProps = {
  item: CatalogItem;
};

export function CatalogCard({ item }: CatalogCardProps) {
  const isFree = item.priceKopecks === 0;

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{getKindLabel(item.kind)}</Badge>
          {item.format ? (
            <Badge variant="outline">{getMaterialFormatLabel(item.format)}</Badge>
          ) : null}
          {item.level && item.level !== "all" ? (
            <Badge variant="outline">{getLevelLabel(item.level)}</Badge>
          ) : null}
          {item.kind === "task" && item.aiReviewAvailable ? (
            <Badge>AI-разбор</Badge>
          ) : null}
        </div>
        <CardTitle className="mt-2">{item.title}</CardTitle>
        {item.description ? (
          <CardDescription className="line-clamp-3">
            {item.description}
          </CardDescription>
        ) : null}
      </CardHeader>

      {item.tags.length > 0 ? (
        <CardContent>
          <div className="flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <Badge key={tag.id} variant="ghost" className="text-neutral-600">
                {tag.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      ) : null}

      <CardFooter className="mt-auto">
        <span
          className={cn(
            "text-sm font-semibold",
            isFree ? "text-primary" : "text-foreground",
          )}
        >
          {formatPrice(item.priceKopecks)}
        </span>
      </CardFooter>
    </Card>
  );
}
