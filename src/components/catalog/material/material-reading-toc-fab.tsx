"use client";

import { List } from "lucide-react";
import { useEffect, useState } from "react";

import { MaterialReadingToc } from "@/components/catalog/material/material-reading-toc";
import type { MaterialHeadingAnchor } from "@/lib/content/material-reading";
import { cn } from "@/lib/utils";

type MaterialReadingTocFabProps = {
  headings: MaterialHeadingAnchor[];
};

export function MaterialReadingTocFab({ headings }: MaterialReadingTocFabProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (headings.length === 0) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "fixed right-4 bottom-5 z-40 flex size-10 items-center justify-center rounded-full",
          "border border-neutral-200 bg-white text-neutral-700 shadow-md",
          "transition-colors hover:bg-neutral-50 hover:text-foreground",
          "xl:hidden",
        )}
        aria-label="Содержание"
      >
        <List className="size-[18px]" strokeWidth={2} aria-hidden />
      </button>

      {open ? (
        <div className="fixed inset-0 z-[60] xl:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Закрыть содержание"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Содержание"
            className={cn(
              "absolute inset-x-0 bottom-0 top-0 max-h-[100dvh] rounded-t-2xl bg-white",
              "pb-[max(env(safe-area-inset-bottom),0.75rem)] shadow-[0_-8px_30px_rgba(0,0,0,0.12)]",
            )}
          >
            <div className="flex justify-center pt-2.5 pb-1">
              <span className="h-1 w-10 rounded-full bg-neutral-200" aria-hidden />
            </div>
            <div className="overflow-y-auto px-4 pb-2">
              <MaterialReadingToc
                headings={headings}
                onNavigate={() => setOpen(false)}
                forceBlackText
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
