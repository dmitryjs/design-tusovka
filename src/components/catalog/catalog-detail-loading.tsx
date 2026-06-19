import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";

export function CatalogDetailLoading() {
  return (
    <Container className="py-6 md:py-8 lg:py-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 md:gap-8">
        <Skeleton className="h-5 w-56" />
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-20" />
          </div>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="space-y-4 border-t border-neutral-200 pt-8">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </Container>
  );
}
