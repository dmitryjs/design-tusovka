import { MaterialBlockRenderer } from "@/components/content/material-block-renderer";
import type { MaterialChapterContentSource } from "@/lib/content/material-reading";
import { collectBlocksFromChapters } from "@/lib/content/material-reading";

type MaterialReadingContentProps = {
  chapters: MaterialChapterContentSource[];
};

export function MaterialReadingContent({ chapters }: MaterialReadingContentProps) {
  const blocks = collectBlocksFromChapters(chapters);

  if (blocks.length === 0) {
    return (
      <p className="text-sm text-neutral-500">
        Контент материала пока не добавлен.
      </p>
    );
  }

  return <MaterialBlockRenderer blocks={blocks} variant="reading" />;
}
