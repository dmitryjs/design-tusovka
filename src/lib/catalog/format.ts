import type { Database } from "@/types/database.types";

import type { CatalogItemKind } from "./types";

const MATERIAL_FORMAT_LABELS: Record<
  Database["public"]["Enums"]["material_format"],
  string
> = {
  mini_guide: "Мини-гайд",
  full_guide: "Полный гайд",
  notes: "Заметки",
  checklist: "Чеклист",
  template: "Шаблон",
  cheat_sheet: "Шпаргалка",
  lesson: "Урок",
  practice: "Практика",
};

const LEVEL_LABELS: Record<
  Database["public"]["Enums"]["designer_level"],
  string
> = {
  junior: "Junior",
  middle: "Middle",
  senior: "Senior",
  all: "Все уровни",
};

const KIND_LABELS: Record<CatalogItemKind, string> = {
  section: "Раздел",
  material: "Материал",
  task: "Задание",
};

export function formatPrice(kopecks: number): string {
  if (kopecks === 0) {
    return "Бесплатно";
  }

  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(kopecks / 100);
}

export function getKindLabel(kind: CatalogItemKind): string {
  return KIND_LABELS[kind];
}

export function getLevelLabel(
  level: Database["public"]["Enums"]["designer_level"],
): string {
  return LEVEL_LABELS[level];
}

export function getMaterialFormatLabel(
  format: Database["public"]["Enums"]["material_format"],
): string {
  return MATERIAL_FORMAT_LABELS[format];
}
