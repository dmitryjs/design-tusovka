import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";

export function SectionDetailLoading() {
  return (
    <Container className="py-6 md:py-8 lg:py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:gap-8">
        <Skeleton className="h-5 w-64" />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <Skeleton className="h-56 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-72 w-full rounded-xl" />
          </div>
          <div className="hidden space-y-6 lg:block">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-56 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </Container>
  );
}
