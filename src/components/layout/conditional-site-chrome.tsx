"use client";

import { usePathname } from "next/navigation";

import { MobileBottomTabBar } from "@/components/layout/mobile-bottom-tab-bar";

type ConditionalSiteChromeProps = {
  children: React.ReactNode;
  siteHeader: React.ReactNode;
  siteFooter: React.ReactNode;
};

export function ConditionalSiteChrome({
  children,
  siteHeader,
  siteFooter,
}: ConditionalSiteChromeProps) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      {siteHeader}
      <main className="min-w-0 flex-1 pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0">
        {children}
      </main>
      <div className="hidden lg:block">{siteFooter}</div>
      <MobileBottomTabBar />
    </>
  );
}
