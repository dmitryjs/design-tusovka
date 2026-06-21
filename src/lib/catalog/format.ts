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

export const MATERIAL_FORMAT_OPTIONS = (
  Object.entries(MATERIAL_FORMAT_LABELS) as Array<
    [Database["public"]["Enums"]["material_format"], string]
  >
).map(([value, label]) => ({ value, label }));

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

const LEVEL_DIFFICULTY_LABELS: Record<
  Database["public"]["Enums"]["designer_level"],
  string
> = {
  junior: "Начальный",
  middle: "Средний",
  senior: "Сложный",
  all: "Любой уровень",
};

export function getLevelDifficultyLabel(
  level: Database["public"]["Enums"]["designer_level"],
): string {
  return LEVEL_DIFFICULTY_LABELS[level];
}

const LEVEL_LONG_LABELS: Record<
  Database["public"]["Enums"]["designer_level"],
  string
> = {
  junior: "Начальный уровень",
  middle: "Средний уровень",
  senior: "Senior уровень",
  all: "Все уровни",
};

export function getLevelLongLabel(
  level: Database["public"]["Enums"]["designer_level"],
): string {
  return LEVEL_LONG_LABELS[level];
}

export function getMaterialFormatLabel(
  format: Database["public"]["Enums"]["material_format"],
): string {
  return MATERIAL_FORMAT_LABELS[format];
}

export function materialCountLabel(count: number): string {
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
