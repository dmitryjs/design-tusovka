import {
  parseMaterialBlocks,
  type MaterialBlock,
} from "@/lib/content/material-blocks";
import { richTextToPlainText } from "@/lib/content/rich-text";
import type { Json } from "@/types/database.types";

export type MaterialChapterContentSource = {
  id: string;
  contentText: string | null;
  contentJson?: Json | null;
};

export type MaterialHeadingAnchor = {
  id: string;
  blockId: string;
  level: 1 | 2 | 3;
  title: string;
};

export type MaterialPdfAttachment = {
  url: string;
  name: string;
};

export function getMaterialBlockAnchorId(blockId: string): string {
  return `block-${blockId}`;
}

export function collectBlocksFromChapters(
  chapters: MaterialChapterContentSource[],
): MaterialBlock[] {
  const blocks: MaterialBlock[] = [];

  for (const chapter of chapters) {
    if (chapter.contentJson) {
      blocks.push(...parseMaterialBlocks(chapter.contentJson));
      continue;
    }

    if (chapter.contentText) {
      blocks.push({
        id: `${chapter.id}-legacy`,
        type: "paragraph",
        data: { text: chapter.contentText },
      });
    }
  }

  return blocks;
}

export function extractHeadingAnchors(blocks: MaterialBlock[]): MaterialHeadingAnchor[] {
  const anchors: MaterialHeadingAnchor[] = [];

  for (const block of blocks) {
    if (block.type === "heading1") {
      const title = richTextToPlainText(block.data.text).trim();
      if (title) {
        anchors.push({
          id: getMaterialBlockAnchorId(block.id),
          blockId: block.id,
          level: 1,
          title,
        });
      }
      continue;
    }

    if (block.type === "heading2") {
      const title = richTextToPlainText(block.data.text).trim();
      if (title) {
        anchors.push({
          id: getMaterialBlockAnchorId(block.id),
          blockId: block.id,
          level: 2,
          title,
        });
      }
      continue;
    }

    if (block.type === "heading3") {
      const title = richTextToPlainText(block.data.text).trim();
      if (title) {
        anchors.push({
          id: getMaterialBlockAnchorId(block.id),
          blockId: block.id,
          level: 3,
          title,
        });
      }
    }
  }

  return anchors;
}

export function findPdfAttachment(blocks: MaterialBlock[]): MaterialPdfAttachment | null {
  for (const block of blocks) {
    if (block.type !== "file" || !block.data.url) {
      continue;
    }

    const name = block.data.name || "Файл";
    const isPdf = /\.pdf($|\?)/i.test(name) || /\.pdf($|\?)/i.test(block.data.url);

    if (isPdf) {
      return {
        url: block.data.url,
        name,
      };
    }
  }

  return null;
}
