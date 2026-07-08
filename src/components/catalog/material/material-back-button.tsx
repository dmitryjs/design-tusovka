"use client";

import { useRouter } from "next/navigation";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { cn } from "@/lib/utils";

type MaterialBackButtonProps = {
  fallbackHref?: string;
  className?: string;
};

export function MaterialBackButton({
  fallbackHref = "/catalog",
  className,
}: MaterialBackButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const fromHref = searchParams.get("from");
  const isSafeFromHref =
    typeof fromHref === "string" &&
    fromHref.startsWith("/") &&
    !fromHref.startsWith("//");
  const isMaterialDetailPath = /^\/materials\/[^/]+\/?$/.test(pathname);

  function handleClick() {
    if (isMaterialDetailPath && isSafeFromHref) {
      router.push(fromHref);
      return;
    }

    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Назад"
      className={cn(
        "inline-flex size-7 shrink-0 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-neutral-100 active:bg-neutral-200",
        className,
      )}
    >
      <ChevronLeft className="size-7" strokeWidth={1.75} aria-hidden />
    </button>
  );
}
