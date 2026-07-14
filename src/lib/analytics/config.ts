/** External analytics (Yandex Metrika) feature flag and counter id. */

export function isAnalyticsEnabled(): boolean {
  const value = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED?.trim().toLowerCase();
  return value === "true" || value === "1" || value === "yes";
}

export function getYandexMetrikaId(): number | null {
  const raw = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID?.trim();
  if (!raw) {
    return null;
  }

  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}
