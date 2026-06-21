import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";

export function MaterialDetailLoading() {
  return (
    <Container className="py-6 md:py-8 lg:py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:gap-8">
        <Skeleton className="h-5 w-72" />

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-28" />
          </div>
          <Skeleton className="h-10 w-full max-w-3xl" />
          <Skeleton className="h-5 w-full max-w-2xl" />
          <Skeleton className="h-4 w-64" />
        </div>

        <Skeleton className="h-40 w-full lg:hidden" />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <Skeleton className="aspect-video w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
          <div className="hidden space-y-6 lg:block">
            <Skeleton className="h-52 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </Container>
  );
}
