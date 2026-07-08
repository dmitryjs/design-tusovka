"use client";

import { BookOpen, ClipboardList, Library, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { MOBILE_TAB_NAV, isNavItemActive } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const TAB_ICONS = {
  materials: BookOpen,
  tasks: ClipboardList,
  library: Library,
  profile: UserRound,
} as const;

export function MobileBottomTabBar() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-200 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
      aria-label="Мобильная навигация"
    >
      <ul className="grid h-16 grid-cols-4">
        {MOBILE_TAB_NAV.map((item) => {
          const active = isNavItemActive(item.href, pathname);
          const Icon = TAB_ICONS[item.id];

          return (
            <li key={item.href} className="min-w-0">
              <Link
                href={item.href}
                className={cn(
                  "flex h-full min-w-0 flex-col items-center justify-center gap-0.5 px-1 text-[11px] leading-4 font-medium transition-colors",
                  active ? "text-primary" : "text-neutral-500",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon
                  className="size-5 shrink-0"
                  strokeWidth={active ? 2.25 : 1.75}
                  aria-hidden
                />
                <span className="max-w-full truncate">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
