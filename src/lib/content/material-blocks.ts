import type { Json } from "@/types/database.types";

export const MATERIAL_BLOCK_TYPES = [
  "heading1",
  "heading2",
  "heading3",
  "paragraph",
  "bulleted_list",
  "numbered_list",
  "checklist",
  "checked_list",
  "quote",
  "image",
  "video",
  "table",
  "file",
  "embed",
  "callout_info",
  "callout_warning",
  "callout_success",
  "divider",
  "accordion",
  "cta",
] as const;

export type MaterialBlockType = (typeof MATERIAL_BLOCK_TYPES)[number];

export type ChecklistItem = {
  id: string;
  text: string;
  checked: boolean;
};

export type MaterialBlockData = {
  heading1: { text: string };
  heading2: { text: string };
  heading3: { text: string };
  paragraph: { text: string };
  bulleted_list: { items: string[] };
  numbered_list: { items: string[] };
  checklist: { items: ChecklistItem[] };
  checked_list: { items: string[] };
  quote: { text: string; author: string };
  image: { url: string; alt: string; caption: string };
  video: { url: string; caption: string };
  table: { headers: string[]; rows: string[][] };
  file: { name: string; url: string; sizeLabel: string };
  embed: { url: string; title: string; description: string };
  callout_info: { title: string; text: string; icon?: string | null };
  callout_warning: { title: string; text: string; icon?: string | null };
  callout_success: { title: string; text: string; icon?: string | null };
  divider: Record<string, never>;
  accordion: { title: string; text: string };
  cta: {
    title: string;
    description: string;
    primaryLabel: string;
    primaryUrl: string;
    secondaryLabel: string;
    secondaryUrl: string;
  };
};

export type MaterialBlock = {
  [K in MaterialBlockType]: {
    id: string;
    type: K;
    data: MaterialBlockData[K];
  };
}[MaterialBlockType];

export type MaterialBlockDefinition = {
  type: MaterialBlockType;
  label: string;
  description: string;
  category: "text" | "media" | "layout";
  icon: string;
};

export const MATERIAL_BLOCK_DEFINITIONS: MaterialBlockDefinition[] = [
  { type: "heading1", label: "Заголовок", description: "H1", category: "text", icon: "H" },
  { type: "heading2", label: "Подзаголовок", description: "H2", category: "text", icon: "H2" },
  { type: "heading3", label: "Подзаголовок 3", description: "H3", category: "text", icon: "H3" },
  { type: "paragraph", label: "Абзац", description: "Обычный текст", category: "text", icon: "¶" },
  { type: "bulleted_list", label: "Маркированный список", description: "• пункты", category: "text", icon: "•" },
  { type: "numbered_list", label: "Нумерованный список", description: "1. пункты", category: "text", icon: "1." },
  { type: "checklist", label: "Чек-лист", description: "Задачи с галочками", category: "text", icon: "☑" },
  {
    type: "checked_list",
    label: "Список с галочками",
    description: "✓ в синих кружках",
    category: "text",
    icon: "✓",
  },
  { type: "quote", label: "Цитата", description: "Выделенная цитата", category: "text", icon: "“" },
  { type: "image", label: "Изображение", description: "Загрузка или ссылка", category: "media", icon: "🖼" },
  { type: "video", label: "Видео", description: "Встраивание по ссылке", category: "media", icon: "▶" },
  { type: "table", label: "Таблица", description: "Сетка 3×3", category: "media", icon: "▦" },
  { type: "file", label: "Файл / PDF", description: "Ссылка на файл", category: "media", icon: "📎" },
  { type: "embed", label: "Встраивание", description: "Ссылка с превью", category: "media", icon: "🔗" },
  { type: "callout_info", label: "Инфо-блок", description: "Подсказка", category: "layout", icon: "ⓘ" },
  { type: "callout_warning", label: "Предупреждение", description: "Важное замечание", category: "layout", icon: "⚠" },
  { type: "callout_success", label: "Успех", description: "Позитивный акцент", category: "layout", icon: "✓" },
  { type: "divider", label: "Разделитель", description: "Горизонтальная линия", category: "layout", icon: "—" },
  { type: "accordion", label: "Спойлер", description: "Сворачиваемый блок", category: "layout", icon: "⌄" },
  { type: "cta", label: "CTA / Баннер", description: "Призыв к действию", category: "layout", icon: "→" },
];

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `block-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createChecklistItem(text = ""): ChecklistItem {
  return { id: createId(), text, checked: false };
}

export function defaultBlockData(type: MaterialBlockType): MaterialBlockData[typeof type] {
  switch (type) {
    case "heading1":
    case "heading2":
    case "heading3":
    case "paragraph":
      return { text: "" };
    case "bulleted_list":
    case "numbered_list":
    case "checked_list":
      return { items: [""] };
    case "checklist":
      return { items: [createChecklistItem()] };
    case "quote":
      return { text: "", author: "" };
    case "image":
      return { url: "", alt: "", caption: "" };
    case "video":
      return { url: "", caption: "" };
    case "table":
      return {
        headers: ["", "", ""],
        rows: [
          ["", "", ""],
          ["", "", ""],
          ["", "", ""],
        ],
      };
    case "file":
      return { name: "", url: "", sizeLabel: "" };
    case "embed":
      return { url: "", title: "", description: "" };
    case "callout_info":
    case "callout_warning":
    case "callout_success":
      return { title: "", text: "", icon: null };
    case "divider":
      return {};
    case "accordion":
      return { title: "Заголовок спойлера", text: "" };
    case "cta":
      return {
        title: "Готов продолжить?",
        description: "Перейдите к следующему шагу или сохраните материал.",
        primaryLabel: "Перейти",
        primaryUrl: "",
        secondaryLabel: "Сохранить",
        secondaryUrl: "",
      };
    default:
      return { text: "" } as MaterialBlockData[typeof type];
  }
}

export function createMaterialBlock<T extends MaterialBlockType>(
  type: T,
): Extract<MaterialBlock, { type: T }> {
  return {
    id: createId(),
    type,
    data: defaultBlockData(type),
  } as Extract<MaterialBlock, { type: T }>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isBlockType(value: unknown): value is MaterialBlockType {
  return (
    typeof value === "string" &&
    MATERIAL_BLOCK_TYPES.includes(value as MaterialBlockType)
  );
}

export function parseMaterialBlocks(value: Json | unknown): MaterialBlock[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const blocks: MaterialBlock[] = [];

  for (const item of value) {
    if (!isRecord(item)) {
      continue;
    }

    if (item.type === "code" || item.type === "stats") {
      continue;
    }

    if (isBlockType(item.type) && isRecord(item.data)) {
      blocks.push({
        id: typeof item.id === "string" ? item.id : createId(),
        type: item.type,
        data: item.data,
      } as MaterialBlock);
      continue;
    }

    if (item.type === "paragraph" && typeof item.text === "string") {
      blocks.push({
        id: createId(),
        type: "paragraph",
        data: { text: item.text },
      });
    }
  }

  return blocks;
}

export function materialBlocksToJson(blocks: MaterialBlock[]): Json {
  return blocks.map((block) => ({
    id: block.id,
    type: block.type,
    data: block.data,
  })) as Json;
}

export function blocksToPlainText(blocks: MaterialBlock[]): string {
  return blocks
    .map((block) => {
      const data = block.data as Record<string, unknown>;

      if (typeof data.text === "string" && data.text.trim()) {
        return data.text;
      }

      if (Array.isArray(data.items)) {
        return data.items
          .map((item) => {
            if (typeof item === "string") {
              return item;
            }

            if (isRecord(item) && typeof item.text === "string") {
              return item.text;
            }

            return null;
          })
          .filter((item): item is string => Boolean(item))
          .join("\n");
      }

      return null;
    })
    .filter((item): item is string => Boolean(item))
    .join("\n\n");
}

export function chaptersToMaterialBlocks(
  chapters: Array<{ title: string; content: Json }>,
): MaterialBlock[] {
  if (!chapters.length) {
    return [createMaterialBlock("paragraph")];
  }

  const blocks: MaterialBlock[] = [];

  for (const chapter of chapters) {
    const chapterBlocks = parseMaterialBlocks(chapter.content);

    if (chapterBlocks.length > 0) {
      blocks.push(...chapterBlocks);
      continue;
    }

    const legacyText = chapter.content;
    if (Array.isArray(legacyText)) {
      for (const item of legacyText) {
        if (isRecord(item) && typeof item.text === "string" && item.text.trim()) {
          blocks.push({
            id: createId(),
            type: "paragraph",
            data: { text: item.text },
          });
        }
      }
    }
  }

  return blocks.length > 0 ? blocks : [createMaterialBlock("paragraph")];
}

export function moveBlock(
  blocks: MaterialBlock[],
  fromIndex: number,
  toIndex: number,
): MaterialBlock[] {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) {
    return blocks;
  }

  const next = [...blocks];
  const [item] = next.splice(fromIndex, 1);

  if (!item) {
    return blocks;
  }

  next.splice(toIndex, 0, item);
  return next;
}
