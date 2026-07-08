"use client";

import { useEffect, useState } from "react";

import type { MaterialHeadingAnchor } from "@/lib/content/material-reading";
import { cn } from "@/lib/utils";

type MaterialReadingTocProps = {
  headings: MaterialHeadingAnchor[];
  className?: string;
  onNavigate?: () => void;
  forceBlackText?: boolean;
};

function scrollToHeading(id: string) {
  const element = document.getElementById(id);
  if (!element) {
    return;
  }

  element.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function MaterialReadingToc({
  headings,
  className,
  onNavigate,
  forceBlackText = false,
}: MaterialReadingTocProps) {
  const [activeId, setActiveId] = useState<string | null>(headings[0]?.id ?? null);

  useEffect(() => {
    if (headings.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-96px 0px -60% 0px",
        threshold: 0,
      },
    );

    for (const heading of headings) {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    }

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) {
    return (
      <nav aria-label="Содержание" className={className}>
        <p className="text-sm text-neutral-500">
          Заголовки появятся после добавления блоков H1–H3.
        </p>
      </nav>
    );
  }

  return (
    <nav aria-label="Содержание" className={className}>
      <p
        className={cn(
          "mb-3 text-xs font-semibold tracking-wide uppercase",
          forceBlackText ? "text-neutral-900" : "text-neutral-500",
        )}
      >
        Содержание
      </p>
      <ul className="flex flex-col gap-0.5">
        {headings.map((heading) => {
          const isActive = activeId === heading.id;

          return (
            <li key={heading.id}>
              <button
                type="button"
                onClick={() => {
                  scrollToHeading(heading.id);
                  onNavigate?.();
                }}
                className={cn(
                  "w-full rounded-md px-2 py-1.5 text-left text-sm leading-5 transition-colors",
                  heading.level === 2 && "pl-4",
                  heading.level === 3 && "pl-6",
                  forceBlackText
                    ? isActive
                      ? "bg-neutral-100 font-medium text-neutral-900"
                      : "text-neutral-900 hover:bg-neutral-100 hover:text-neutral-900"
                    : isActive
                      ? "bg-blue-50 font-medium text-primary"
                      : "text-neutral-600 hover:bg-neutral-50 hover:text-foreground",
                )}
              >
                {heading.title}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
