"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    ym?: (counterId: number, method: string, ...args: unknown[]) => void;
  }
}

type YandexMetrikaProps = {
  counterId: number;
};

export function YandexMetrika({ counterId }: YandexMetrikaProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstHit = useRef(true);

  useEffect(() => {
    if (typeof window.ym !== "function") {
      return;
    }

    if (isFirstHit.current) {
      isFirstHit.current = false;
      return;
    }

    const url = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ""}`;
    window.ym(counterId, "hit", url);
  }, [counterId, pathname, searchParams]);

  return (
    <>
      <Script id="yandex-metrika" strategy="afterInteractive">
        {`
(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
m[i].l=1*new Date();
for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
ym(${counterId}, "init", {
  clickmap:true,
  trackLinks:true,
  accurateTrackBounce:true,
  webvisor:true
});
        `.trim()}
      </Script>
      <noscript>
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://mc.yandex.ru/watch/${counterId}`}
            style={{ position: "absolute", left: "-9999px" }}
            alt=""
          />
        </div>
      </noscript>
    </>
  );
}
