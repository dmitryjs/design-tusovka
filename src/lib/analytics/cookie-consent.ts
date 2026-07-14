export type CookieConsentState = {
  analytics: boolean;
  updatedAt: string;
};

export const COOKIE_CONSENT_STORAGE_KEY = "dt_cookie_consent";

export function parseCookieConsent(raw: string | null): CookieConsentState | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("analytics" in parsed) ||
      typeof (parsed as { analytics: unknown }).analytics !== "boolean"
    ) {
      return null;
    }

    const analytics = (parsed as { analytics: boolean }).analytics;
    const updatedAt =
      "updatedAt" in parsed &&
      typeof (parsed as { updatedAt: unknown }).updatedAt === "string"
        ? (parsed as { updatedAt: string }).updatedAt
        : new Date(0).toISOString();

    return { analytics, updatedAt };
  } catch {
    return null;
  }
}

export function createCookieConsent(analytics: boolean): CookieConsentState {
  return {
    analytics,
    updatedAt: new Date().toISOString(),
  };
}

export function readCookieConsent(): CookieConsentState | null {
  if (typeof window === "undefined") {
    return null;
  }

  return parseCookieConsent(window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY));
}

export function writeCookieConsent(state: CookieConsentState): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(state));
}

export function hasAnalyticsCookieConsent(
  consent: CookieConsentState | null,
): boolean {
  return consent?.analytics === true;
}
