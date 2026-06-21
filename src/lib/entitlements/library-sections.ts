import type { LibraryItem } from "@/lib/entitlements/types";

export type LibrarySection = "materials" | "tasks" | "downloaded";

export function countLibrarySections(
  items: LibraryItem[],
): Record<LibrarySection, number> {
  return {
    materials: items.filter((item) => item.kind === "material").length,
    tasks: items.filter((item) => item.kind === "task").length,
    downloaded: 0,
  };
}

export function filterLibraryBySection(
  items: LibraryItem[],
  section: LibrarySection,
): LibraryItem[] {
  if (section === "materials") {
    return items.filter((item) => item.kind === "material");
  }

  if (section === "tasks") {
    return items.filter((item) => item.kind === "task");
  }

  return [];
}
