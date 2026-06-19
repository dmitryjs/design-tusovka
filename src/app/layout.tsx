import type { Metadata, Viewport } from "next";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Дизайн Тусовка",
  description: "Практические материалы и задания для продуктовых дизайнеров",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#094BF5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="flex min-h-svh flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
