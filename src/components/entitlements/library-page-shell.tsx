import { Breadcrumbs, type BreadcrumbItem } from "@/components/layout/breadcrumbs";
import { cn } from "@/lib/utils";

type LibraryPageShellProps = {
  breadcrumbs: BreadcrumbItem[];
  sidebar: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function LibraryPageShell({
  breadcrumbs,
  sidebar,
  children,
  className,
}: LibraryPageShellProps) {
  return (
    <div className={cn("flex min-h-[calc(100svh-3.5rem)] w-full", className)}>
      <aside className="sticky top-14 z-10 hidden h-[calc(100svh-3.5rem)] w-[260px] shrink-0 border-r border-neutral-200 bg-white lg:flex lg:flex-col">
        <div className="px-6 py-8">{sidebar}</div>
      </aside>

      <div className="flex min-h-[calc(100svh-3.5rem)] min-w-0 flex-1 flex-col px-4 py-6 md:px-8 md:py-8 lg:px-10 lg:py-10">
        <div className="flex flex-1 flex-col gap-6 md:gap-8">
          <Breadcrumbs items={breadcrumbs} />
          {children}
        </div>
      </div>
    </div>
  );
}
