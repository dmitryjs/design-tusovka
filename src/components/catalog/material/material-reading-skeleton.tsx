import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";

export function MaterialReadingSkeleton() {
  return (
    <Container className="py-6 md:py-8 lg:py-10">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-6 md:gap-8">
        <Skeleton className="h-5 w-72" />
        <div className="grid items-start gap-8 xl:grid-cols-[220px_minmax(0,1fr)_300px]">
          <aside className="hidden space-y-4 xl:block">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </aside>
          <main className="min-w-0 space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </main>
          <aside className="hidden space-y-4 xl:block">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </aside>
        </div>
      </div>
    </Container>
  );
}
