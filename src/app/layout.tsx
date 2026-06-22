import type { Metadata, Viewport } from "next";

import { ConditionalSiteChrome } from "@/components/layout/conditional-site-chrome";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site-metadata";
import { getPublicSiteUrl } from "@/lib/site-url";

import "./globals.css";

export const dynamic = "force-dynamic";

const siteUrl = getPublicSiteUrl();

export const metadata: Metadata = {
  metadataBase: siteUrl ? new URL(`${siteUrl}/`) : undefined,
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
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
        <ConditionalSiteChrome
          siteHeader={<SiteHeader />}
          siteFooter={<SiteFooter />}
        >
          {children}
        </ConditionalSiteChrome>
      </body>
    </html>
  );
}
