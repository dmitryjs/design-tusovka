import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLibraryLoading() {
  return (
    <div className="flex min-h-[calc(100svh-3.5rem)] w-full">
      <aside className="sticky top-14 z-10 hidden h-[calc(100svh-3.5rem)] w-[260px] shrink-0 border-r border-neutral-200 bg-white lg:flex lg:flex-col">
        <div className="space-y-6 px-6 py-8">
          <Skeleton className="h-7 w-40" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </aside>

      <div className="flex min-h-[calc(100svh-3.5rem)] min-w-0 flex-1 flex-col px-4 py-6 md:px-8 md:py-8 lg:px-10 lg:py-10">
        <div className="flex flex-1 flex-col gap-6 md:gap-8">
          <Skeleton className="h-4 w-56" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-64 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
