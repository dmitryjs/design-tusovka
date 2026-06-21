import { Skeleton } from "@/components/ui/skeleton";

export function ProfileSettingsSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-6 md:px-8 md:py-8 lg:px-10 lg:py-10">
      <Skeleton className="mb-6 h-4 w-24" />
      <div className="space-y-6">
        <header className="space-y-2">
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </header>

        <SettingsPanelSkeleton fields={1} />
        <SettingsPanelSkeleton fields={0} withAvatar />
        <SettingsPanelSkeleton fields={1} withBadge />
        <SettingsPanelSkeleton fields={3} />

        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-9 w-44 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>

        <SettingsPanelSkeleton fields={3} />
        <SettingsPanelSkeleton fields={0} />
      </div>
    </div>
  );
}

function SettingsPanelSkeleton({
  fields,
  withAvatar = false,
  withBadge = false,
}: {
  fields: number;
  withAvatar?: boolean;
  withBadge?: boolean;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
      <div className="mb-5 space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>

      {withAvatar ? (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Skeleton className="size-24 rounded-full" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-56" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-24 rounded-lg" />
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          </div>
        </div>
      ) : null}

      {withBadge ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-36 shrink-0 rounded-lg" />
          </div>
        </div>
      ) : null}

      {fields > 0 ? (
        <div className="space-y-4">
          {Array.from({ length: fields }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
