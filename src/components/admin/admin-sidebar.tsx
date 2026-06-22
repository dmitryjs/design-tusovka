"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";

import {
  ADMIN_NAV,
  isAdminNavItemActive,
  type AdminNavItem,
} from "@/lib/admin/nav";
import { cn } from "@/lib/utils";

function AdminNavLink({
  item,
  active,
}: {
  item: AdminNavItem;
  active: boolean;
}) {
  const baseClassName = cn(
    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
    active
      ? "bg-blue-50 text-primary"
      : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900",
  );

  return (
    <Link href={item.href} className={baseClassName} aria-current={active ? "page" : undefined}>
      <item.Icon className={cn("size-[18px] shrink-0", active && "text-primary")} aria-hidden />
      <span className="min-w-0 truncate">{item.label}</span>
    </Link>
  );
}

type AdminSidebarProps = {
  className?: string;
};

export function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <aside
      className={cn(
        "flex h-full w-[248px] shrink-0 flex-col overflow-hidden border-r border-neutral-200 bg-white px-3 py-5",
        className,
      )}
    >
      <div className="mb-6 px-2">
        <p className="text-xs font-medium tracking-wide text-neutral-500 uppercase">Admin</p>
        <p className="mt-1 text-base font-semibold text-foreground">Дизайн Тусовка</p>
      </div>

      <nav className="flex flex-1 flex-col gap-6" aria-label="Админ-навигация">
        {ADMIN_NAV.map((section) => (
          <div key={section.title ?? "root"}>
            {section.title ? (
              <p className="mb-2 px-2 text-[11px] font-medium tracking-wide text-neutral-400 uppercase">
                {section.title}
              </p>
            ) : null}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = isAdminNavItemActive(item, pathname, searchParams);

                return (
                  <li key={item.label}>
                    <AdminNavLink item={item} active={active} />
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="mt-4 border-t border-neutral-200 pt-4">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
        >
          <ExternalLink className="size-[18px] shrink-0" aria-hidden />
          Открыть сайт
        </Link>
      </div>
    </aside>
  );
}

export function AdminSidebarMobile({ className }: AdminSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const flatItems = ADMIN_NAV.flatMap((section) => section.items);

  return (
    <nav
      className={cn(
        "border-b border-neutral-200 bg-white px-4 py-3 lg:hidden",
        className,
      )}
      aria-label="Админ-навигация"
    >
      <ul className="flex gap-2 overflow-x-auto pb-1">
        {flatItems.map((item) => {
          const active = isAdminNavItemActive(item, pathname, searchParams);

          return (
            <li key={item.label} className="shrink-0">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                  active
                    ? "bg-blue-50 text-primary"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200",
                )}
              >
                <item.Icon className="size-4" aria-hidden />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
