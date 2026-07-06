import { CatalogEmptyPanel } from "@/components/catalog/catalog-detail-shell";
import type { MaterialChapterView } from "@/lib/catalog/detail-queries";
import {
  collectBlocksFromChapters,
  extractHeadingAnchors,
  type MaterialHeadingAnchor,
} from "@/lib/content/material-reading";
import { cn } from "@/lib/utils";

type MaterialTableOfContentsProps = {
  chapters: MaterialChapterView[];
  h1Headings?: MaterialHeadingAnchor[];
  isPreview: boolean;
  className?: string;
};

function headingIndentClass(level: MaterialHeadingAnchor["level"]): string {
  if (level === 2) {
    return "pl-6";
  }

  if (level === 3) {
    return "pl-9";
  }

  return "";
}

function HeadingTocItem({ heading }: { heading: MaterialHeadingAnchor }) {
  return (
    <div
      className={cn(
        "rounded-lg px-3 py-2 text-sm leading-5 text-foreground",
        headingIndentClass(heading.level),
      )}
    >
      {heading.title}
    </div>
  );
}

function resolveHeadings(
  chapters: MaterialChapterView[],
  outlineHeadings?: MaterialHeadingAnchor[],
): MaterialHeadingAnchor[] {
  const hasChapterContent = chapters.some(
    (chapter) => chapter.contentJson != null || Boolean(chapter.contentText?.trim()),
  );

  if (hasChapterContent) {
    const fromContent = extractHeadingAnchors(collectBlocksFromChapters(chapters));
    if (fromContent.length > 0) {
      return fromContent;
    }
  }

  if (outlineHeadings && outlineHeadings.length > 0) {
    return outlineHeadings;
  }

  return extractHeadingAnchors(collectBlocksFromChapters(chapters));
}

export function MaterialTableOfContents({
  chapters,
  h1Headings,
  isPreview,
  className,
}: MaterialTableOfContentsProps) {
  const headings = resolveHeadings(chapters, h1Headings);

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

        <ul className="flex flex-col gap-1 rounded-xl border border-neutral-200 bg-white p-2">
          {headings.map((heading) => (
            <li key={heading.blockId}>
              <HeadingTocItem heading={heading} />
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section className={cn("space-y-3", className)} aria-label="Содержание">
      <div className="space-y-1">
        <h2 className="text-base font-semibold text-foreground">Содержание</h2>
        <p className="text-sm text-neutral-500">
          {isPreview ? "Доступны только названия" : "Заголовки H1–H3 пока не добавлены"}
        </p>
      </div>

      <CatalogEmptyPanel
        title="Заголовки не найдены"
        description="Добавьте блоки H1–H3 в контент материала."
      />
    </section>
  );
}
