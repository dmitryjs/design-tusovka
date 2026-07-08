"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { CartPreviewDropdown } from "@/components/layout/cart-preview-dropdown";
import { HeaderIconButton } from "@/components/layout/header-icon-button";
import { HeaderSearch } from "@/components/layout/header-search";
import type { CartItemView } from "@/lib/cart/types";
import { isNavItemActive, MAIN_NAV } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type SiteHeaderNavProps = {
  cartItemCount?: number;
  cartItems?: CartItemView[];
};

export function SiteHeaderNav({
  cartItemCount = 0,
  cartItems = [],
}: SiteHeaderNavProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full min-w-0 flex-1 items-stretch gap-2 sm:gap-4 lg:gap-8">
      <nav
        className="hidden min-w-0 flex-1 items-stretch overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] lg:flex [&::-webkit-scrollbar]:hidden"
        aria-label="Основная навигация"
      >
        {MAIN_NAV.map((item) => {
          const active = isNavItemActive(item.href, pathname);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex shrink-0 items-center self-stretch border-b-2 px-3 text-sm font-medium whitespace-nowrap transition-colors sm:px-4",
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-neutral-600 hover:text-neutral-900",
              )}
              aria-current={active ? "page" : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="ml-auto flex shrink-0 items-center gap-0.5 self-center sm:gap-1">
        <HeaderSearch />
        <HeaderIconButton label="Уведомления">
          <Bell className="size-[18px]" strokeWidth={1.75} />
        </HeaderIconButton>
        <CartPreviewDropdown items={cartItems} itemCount={cartItemCount} />
      </div>
    </div>
  );
}
