import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";

export function AuthPageLoading() {
  return (
    <Container className="py-8 md:py-10 lg:py-12">
      <div className="mx-auto flex w-full max-w-md flex-col gap-8">
        <Skeleton className="h-8 w-24" />
        <div className="space-y-3">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </Container>
  );
}
