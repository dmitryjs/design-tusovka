"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { CookieBanner } from "@/components/analytics/cookie-banner";
import { YandexMetrika } from "@/components/analytics/yandex-metrika";
import {
  getYandexMetrikaId,
  isAnalyticsEnabled,
} from "@/lib/analytics/config";
import {
  hasAnalyticsCookieConsent,
  readCookieConsent,
  type CookieConsentState,
} from "@/lib/analytics/cookie-consent";

/**
 * External analytics entry point for the root layout.
 * Loads Yandex Metrika only when NEXT_PUBLIC_ANALYTICS_ENABLED is on
 * and the user has accepted analytics cookies.
 */
export function Analytics() {
  const pathname = usePathname();
  const analyticsEnabled = isAnalyticsEnabled();
  const counterId = getYandexMetrikaId();
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);

  useEffect(() => {
    setAnalyticsAllowed(hasAnalyticsCookieConsent(readCookieConsent()));
  }, []);

  const handleConsentChange = useCallback((consent: CookieConsentState) => {
    setAnalyticsAllowed(hasAnalyticsCookieConsent(consent));
  }, []);

  const isAdmin = pathname.startsWith("/admin");
  const shouldLoadMetrika =
    !isAdmin &&
    analyticsEnabled &&
    counterId !== null &&
    analyticsAllowed;

  return (
    <>
      <CookieBanner onConsentChange={handleConsentChange} />
      {shouldLoadMetrika ? (
        <Suspense fallback={null}>
          <YandexMetrika counterId={counterId} />
        </Suspense>
      ) : null}
    </>
  );
}
