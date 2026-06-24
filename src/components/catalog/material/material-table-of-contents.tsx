import Link from "next/link";

import { CatalogEmptyPanel } from "@/components/catalog/catalog-detail-shell";
import { chapterCountLabel } from "@/lib/catalog/material-detail-utils";
import type { MaterialChapterView } from "@/lib/catalog/detail-queries";
import {
  collectBlocksFromChapters,
  extractHeadingAnchors,
  type MaterialHeadingAnchor,
} from "@/lib/content/material-reading";
import { cn } from "@/lib/utils";

type MaterialTableOfContentsProps = {
  chapters: MaterialChapterView[];
  isPreview: boolean;
  /** Пустая строка — якоря на текущей странице; путь — якоря на странице чтения */
  anchorBaseHref?: string;
  className?: string;
};

function resolveAnchorHref(anchorId: string, anchorBaseHref?: string): string | null {
  if (anchorBaseHref === undefined) {
    return null;
  }

  return `${anchorBaseHref}#${anchorId}`;
}

function headingIndentClass(level: MaterialHeadingAnchor["level"]): string {
  if (level === 2) {
    return "pl-4";
  }

  if (level === 3) {
    return "pl-7";
  }

  return "";
}

function HeadingTocItem({
  heading,
  index,
  href,
}: {
  heading: MaterialHeadingAnchor;
  index: number;
  href: string | null;
}) {
  const itemClassName = cn(
    "flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
    headingIndentClass(heading.level),
  );

  if (href) {
    return (
      <Link
        href={href}
        className={cn(itemClassName, "text-foreground hover:bg-neutral-50 hover:text-primary")}
      >
        <span className="w-5 shrink-0 tabular-nums text-neutral-400">{index + 1}</span>
        <span className="leading-5">{heading.title}</span>
      </Link>
    );
  }

  return (
    <div className={cn(itemClassName, "text-neutral-700")}>
      <span className="w-5 shrink-0 tabular-nums text-neutral-400">{index + 1}</span>
      <span className="leading-5">{heading.title}</span>
    </div>
  );
}

export function MaterialTableOfContents({
  chapters,
  isPreview,
  anchorBaseHref,
  className,
}: MaterialTableOfContentsProps) {
  const headings = extractHeadingAnchors(collectBlocksFromChapters(chapters));

  if (chapters.length === 0) {
    return (
      <section className={cn("space-y-3", className)} aria-label="Содержание">
        <h2 className="text-base font-semibold text-foreground">Содержание</h2>
        <CatalogEmptyPanel
          title="Содержание пока не добавлено"
          description="Добавьте блоки H1–H3 в контент материала."
        />
      </section>
    );
  }

  if (headings.length > 0) {
    const linkable = anchorBaseHref !== undefined && !isPreview;

    return (
      <section className={cn("space-y-3", className)} aria-label="Содержание">
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-foreground">Содержание</h2>
          <p className="text-sm text-neutral-500">
            {headings.length}{" "}
            {headings.length === 1
              ? "заголовок"
              : headings.length < 5
                ? "заголовка"
                : "заголовков"}
            {isPreview ? " · доступны только названия" : null}
          </p>
        </div>

        <ol className="flex flex-col gap-1 rounded-xl border border-neutral-200 bg-white p-2">
          {headings.map((heading, index) => (
            <li key={heading.blockId}>
              <HeadingTocItem
                heading={heading}
                index={index}
                href={linkable ? resolveAnchorHref(heading.id, anchorBaseHref) : null}
              />
            </li>
          ))}
        </ol>
      </section>
    );
  }

  return (
    <section className={cn("space-y-3", className)} aria-label="Содержание">
      <div className="space-y-1">
        <h2 className="text-base font-semibold text-foreground">Содержание</h2>
        <p className="text-sm text-neutral-500">
          {chapters.length} {chapterCountLabel(chapters.length)}
          {isPreview ? " · доступны только названия" : null}
        </p>
      </div>

      <ol className="flex flex-col gap-1 rounded-xl border border-neutral-200 bg-white p-2">
        {chapters.map((chapter) => {
          const itemClassName =
            "flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors";

          if (!isPreview && anchorBaseHref !== undefined) {
            return (
              <li key={chapter.id}>
                <Link
                  href={`${anchorBaseHref}#chapter-${chapter.id}`}
                  className={cn(
                    itemClassName,
                    "text-foreground hover:bg-neutral-50 hover:text-primary",
                  )}
                >
                  <span className="w-5 shrink-0 tabular-nums text-neutral-400">
                    {chapter.position + 1}
                  </span>
                  <span className="leading-5">{chapter.title}</span>
                </Link>
              </li>
            );
          }

          return (
            <li key={chapter.id} className={cn(itemClassName, "text-neutral-700")}>
              <span className="w-5 shrink-0 tabular-nums text-neutral-400">
                {chapter.position + 1}
              </span>
              <span className="leading-5">{chapter.title}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
