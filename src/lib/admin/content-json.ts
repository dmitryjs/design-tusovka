import type { Json } from "@/types/database.types";

export function textToChapterContentJson(text: string): Json {
  const trimmed = text.trim();

  if (!trimmed) {
    return [];
  }

  return [{ type: "paragraph", text: trimmed }];
}

export function multilineToStringListJson(text: string): Json {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function stringListJsonToMultiline(value: Json): string {
  if (!Array.isArray(value)) {
    return "";
  }

  return value
    .map((item) => {
      if (typeof item === "string") {
        return item;
      }

      if (
        typeof item === "object" &&
        item !== null &&
        "text" in item &&
        typeof item.text === "string"
      ) {
        return item.text;
      }

      return null;
    })
    .filter((item): item is string => Boolean(item))
    .join("\n");
}

export function chapterContentJsonToText(value: Json): string {
  if (!Array.isArray(value)) {
    return "";
  }

  return value
    .map((item) => {
      if (
        typeof item === "object" &&
        item !== null &&
        "text" in item &&
        typeof item.text === "string"
      ) {
        return item.text;
      }

      return null;
    })
    .filter((item): item is string => Boolean(item))
    .join("\n\n");
}
