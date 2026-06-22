"use client";

import { usePathname } from "next/navigation";

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
      <main className="flex-1">{children}</main>
      {siteFooter}
    </>
  );
}
