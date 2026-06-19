"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { buttonVariants } from "@/components/ui/button";
import { isNavItemActive, MAIN_NAV } from "@/lib/navigation";
import { cn } from "@/lib/utils";

import { HeaderSearch } from "./header-search";

type SiteHeaderNavProps = {
  isAuthenticated: boolean;
  cartItemCount?: number;
};

export function SiteHeaderNav({
  isAuthenticated,
  cartItemCount = 0,
}: SiteHeaderNavProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:gap-4">
      <nav
        className="flex items-center gap-1 overflow-x-auto"
        aria-label="Основная навигация"
      >
        {MAIN_NAV.map((item) => {
          const active = isNavItemActive(item.href, pathname);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-blue-50 text-primary"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-foreground",
              )}
              aria-current={active ? "page" : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-1 items-center gap-2 sm:gap-3">
        <HeaderSearch className="min-w-0 flex-1 xl:max-w-md" />

        <Link
          href="/cart"
          className={cn(
            buttonVariants({ variant: "secondary", size: "sm" }),
            "shrink-0",
            pathname === "/cart" && "bg-blue-50 text-primary",
          )}
        >
          Корзина{cartItemCount > 0 ? ` (${cartItemCount})` : ""}
        </Link>

        {isAuthenticated ? (
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/profile"
              className={cn(
                buttonVariants({ variant: "secondary", size: "sm" }),
                "hidden sm:inline-flex",
              )}
            >
              Профиль
            </Link>
            <SignOutButton size="sm" className="hidden sm:inline-flex" />
            <Link
              href="/profile"
              className={cn(buttonVariants({ size: "sm" }), "sm:hidden")}
            >
              Профиль
            </Link>
          </div>
        ) : (
          <Link
            href="/auth/sign-in"
            className={cn(buttonVariants({ size: "sm" }), "shrink-0")}
          >
            Войти
          </Link>
        )}
      </div>
    </div>
  );
}
