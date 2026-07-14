"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  createCookieConsent,
  writeCookieConsent,
  type CookieConsentState,
  readCookieConsent,
} from "@/lib/analytics/cookie-consent";
import { cn } from "@/lib/utils";

type CookieBannerProps = {
  className?: string;
  onConsentChange?: (consent: CookieConsentState) => void;
};

export function CookieBanner({ className, onConsentChange }: CookieBannerProps) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (pathname.startsWith("/admin")) {
      setVisible(false);
      return;
    }

    setVisible(readCookieConsent() === null);
  }, [pathname]);

  const save = useCallback(
    (analytics: boolean) => {
      const next = createCookieConsent(analytics);
      writeCookieConsent(next);
      setVisible(false);
      onConsentChange?.(next);
    },
    [onConsentChange],
  );

  if (!visible) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-label="Согласие на cookies"
      className={cn(
        "fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-[60] border-t border-neutral-200 bg-white p-4 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] lg:bottom-4 lg:left-4 lg:right-auto lg:max-w-md lg:rounded-xl lg:border",
        className,
      )}
    >
      <p className="text-sm leading-6 text-neutral-700">
        Мы используем необходимые cookies для работы сайта. Аналитические cookies
        (Яндекс.Метрика) — только с вашего согласия.{" "}
        <Link href="/privacy" className="font-medium text-primary hover:underline">
          Политика конфиденциальности
        </Link>
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="secondary"
          className="w-full sm:w-auto"
          onClick={() => save(false)}
        >
          Только необходимые
        </Button>
        <Button
          type="button"
          className="w-full sm:w-auto"
          onClick={() => save(true)}
        >
          Принять аналитику
        </Button>
      </div>
    </div>
  );
}
