import type { Json } from "@/types/database.types";
import {
  parseMaterialBlocks,
  type MaterialBlock,
} from "@/lib/content/material-blocks";

import { MaterialBlockRenderer } from "@/components/content/material-block-renderer";

export type MaterialChapterBlocksView = {
  id: string;
  title: string;
  position: number;
  blocks: MaterialBlock[];
};

export function parseChapterBlocks(content: Json): MaterialBlock[] {
  return parseMaterialBlocks(content);
}

type MaterialContentProps = {
  chapters: Array<{
    id: string;
    title: string;
    position: number;
    contentText: string | null;
    contentJson?: Json | null;
  }>;
};

export function MaterialContent({ chapters }: MaterialContentProps) {
  const allBlocks: MaterialBlock[] = [];

  for (const chapter of chapters) {
    if (chapter.contentJson) {
      allBlocks.push(...parseMaterialBlocks(chapter.contentJson));
      continue;
    }

    if (chapter.contentText) {
      allBlocks.push({
        id: `${chapter.id}-legacy`,
        type: "paragraph",
        data: { text: chapter.contentText },
      });
    }
  }

  if (allBlocks.length === 0) {
    return null;
  }

  return (
    <section id="material-content" className="space-y-6 scroll-mt-24">
      <h2 className="text-lg font-semibold text-foreground">Текст материала</h2>
      <MaterialBlockRenderer blocks={allBlocks} />
    </section>
  );
}
