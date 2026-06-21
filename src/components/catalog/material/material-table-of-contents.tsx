import Link from "next/link";

import { CatalogEmptyPanel } from "@/components/catalog/catalog-detail-shell";
import { chapterCountLabel } from "@/lib/catalog/material-detail-utils";
import type { MaterialChapterView } from "@/lib/catalog/detail-queries";
import { cn } from "@/lib/utils";

type MaterialTableOfContentsProps = {
  chapters: MaterialChapterView[];
  isPreview: boolean;
  className?: string;
};

export function MaterialTableOfContents({
  chapters,
  isPreview,
  className,
}: MaterialTableOfContentsProps) {
  if (chapters.length === 0) {
    return (
      <section className={cn("space-y-3", className)} aria-label="Содержание">
        <h2 className="text-base font-semibold text-foreground">Содержание</h2>
        <CatalogEmptyPanel
          title="Содержание пока не добавлено"
          description="Когда появятся главы, они отобразятся здесь."
        />
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

          if (!isPreview) {
            return (
              <li key={chapter.id}>
                <Link
                  href={`#chapter-${chapter.id}`}
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
            <li
              key={chapter.id}
              className={cn(itemClassName, "text-neutral-700")}
            >
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
