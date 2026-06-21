import type { Database } from "@/types/database.types";

const FORMAT_BADGE_CLASS: Partial<
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

export function getSectionMaterialFormatBadgeClass(
  format: Database["public"]["Enums"]["material_format"],
): string {
  return FORMAT_BADGE_CLASS[format] ?? "bg-blue-50 text-blue-700";
}

export function sectionMaterialsCountLabel(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return "материал";
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return "материала";
  }

  return "материалов";
}

export function sectionPracticeCountLabel(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return "практика";
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return "практики";
  }

  return "практик";
}
