export function normalizeSiteUrl(url: string): string {
  const trimmed = url.trim().replace(/\/+$/, "");

  if (!trimmed) {
    return trimmed;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

export function getPublicSiteUrl(): string | null {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return siteUrl ? normalizeSiteUrl(siteUrl) : null;
}

/**
 * Site origin for auth redirects in the browser (preferred) or from env on SSR.
 */
export function getAuthRedirectOrigin(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  const siteUrl = getPublicSiteUrl();
  if (siteUrl) {
    return siteUrl;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("Задайте NEXT_PUBLIC_SITE_URL");
  }

  return "http://localhost:3000";
}
