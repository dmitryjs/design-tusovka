import { Skeleton } from "@/components/ui/skeleton";

export function ProfileDashboardSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-4 py-6 md:gap-8 md:px-8 md:py-8 lg:px-10 lg:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
        <section className="rounded-xl border border-neutral-200 bg-white p-5 lg:col-span-2 lg:p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="flex flex-col items-center gap-3 sm:items-start">
              <Skeleton className="size-24 rounded-full" />
              <Skeleton className="h-8 w-28 rounded-lg" />
            </div>
            <div className="min-w-0 flex-1 space-y-3">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-neutral-200 bg-white p-5 lg:p-6">
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-3 w-full max-w-28" />
                <Skeleton className="h-8 w-12" />
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        <div className="space-y-4">
          <ProfileSectionCardSkeleton rows={3} />
        </div>
        <div className="space-y-4">
          <ProfileSectionCardSkeleton rows={3} />
          <ProfileSectionCardSkeleton rows={3} />
          <Skeleton className="h-36 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function ProfileSectionCardSkeleton({ rows }: { rows: number }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex items-center gap-3">
            <Skeleton className="size-10 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4 max-w-48" />
              <Skeleton className="h-3 w-1/3 max-w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
