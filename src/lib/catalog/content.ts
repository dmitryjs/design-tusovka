import type { Json } from "@/types/database.types";

export function jsonbToStringList(value: Json): string[] {
  if (!Array.isArray(value)) {
    return [];
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

      if (typeof item === "string") {
        return item;
      }

      return null;
    })
    .filter((item): item is string => Boolean(item));
}

export function jsonbToParagraphs(value: Json): string {
  return jsonbToStringList(value).join("\n\n");
}
