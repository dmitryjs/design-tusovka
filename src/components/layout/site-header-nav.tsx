"use client";

import { Bell, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { CartPreviewDropdown } from "@/components/layout/cart-preview-dropdown";
import { HeaderIconButton } from "@/components/layout/header-icon-button";
import { HeaderSearch } from "@/components/layout/header-search";
import { isNavItemActive, MAIN_NAV } from "@/lib/navigation";
import type { CartItemView } from "@/lib/cart/types";
import { cn } from "@/lib/utils";

type SiteHeaderNavProps = {
  isAuthenticated: boolean;
  profileInitial?: string | null;
  cartItemCount?: number;
  cartItems?: CartItemView[];
};

export function SiteHeaderNav({
  isAuthenticated,
  profileInitial,
  cartItemCount = 0,
  cartItems = [],
}: SiteHeaderNavProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full min-w-0 flex-1 items-stretch gap-3 sm:gap-4 lg:gap-8">
      <nav
        className="flex min-w-0 flex-1 items-stretch overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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

      <div className="flex shrink-0 items-center gap-0.5 self-center sm:gap-1">
        <HeaderSearch />

        <HeaderIconButton label="Уведомления">
          <Bell className="size-[18px]" strokeWidth={1.75} />
        </HeaderIconButton>

        <CartPreviewDropdown items={cartItems} itemCount={cartItemCount} />

        {isAuthenticated ? (
          <Link
            href="/profile"
            aria-label="Профиль"
            className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-neutral-200 bg-neutral-100 text-xs font-semibold text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-200"
          >
            {profileInitial ? (
              <span aria-hidden>{profileInitial}</span>
            ) : (
              <User className="size-[18px]" strokeWidth={1.75} />
            )}
          </Link>
        ) : (
          <HeaderIconButton href="/auth/sign-in" label="Войти">
            <User className="size-[18px]" strokeWidth={1.75} />
          </HeaderIconButton>
        )}
      </div>
    </div>
  );
}
