import type { Database } from "@/types/database.types";

const FORMAT_THUMB_CLASS: Partial<
  Record<Database["public"]["Enums"]["material_format"], string>
> = {
  practice: "bg-purple-50 text-purple-700",
  lesson: "bg-blue-50 text-blue-700",
  mini_guide: "bg-emerald-50 text-emerald-700",
  full_guide: "bg-sky-50 text-sky-700",
  checklist: "bg-amber-50 text-amber-800",
  template: "bg-orange-50 text-orange-700",
  cheat_sheet: "bg-violet-50 text-violet-700",
  notes: "bg-neutral-100 text-neutral-700",
};

export function getMaterialCoverPlaceholderClass(
  format: Database["public"]["Enums"]["material_format"],
): string {
  return FORMAT_THUMB_CLASS[format] ?? "bg-blue-50 text-blue-700";
}

export function resolveMaterialCoverUrl(coverPath: string | null | undefined): string | null {
  if (!coverPath) {
    return null;
  }

  if (coverPath.startsWith("http://") || coverPath.startsWith("https://") || coverPath.startsWith("/")) {
    return coverPath;
  }

  return `/storage/v1/object/public/${coverPath}`;
}
