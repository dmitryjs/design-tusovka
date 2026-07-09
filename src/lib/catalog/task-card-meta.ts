import type { Database } from "@/types/database.types";

import { resolveTaskEstimatedHours } from "./task-detail-utils";
import type { CatalogTag } from "./types";

type LabeledPattern = {
  pattern: RegExp;
  label: string;
};

const SPHERE_PATTERNS: LabeledPattern[] = [
  { pattern: /\bb2b\b/i, label: "B2B" },
  { pattern: /\bb2c\b/i, label: "B2C" },
  { pattern: /\bsaas\b/i, label: "SaaS" },
  { pattern: /финтех|fintech/i, label: "Финтех" },
  { pattern: /e-?commerce|ecommerce|маркетплейс/i, label: "E-commerce" },
  { pattern: /mobile|мобил/i, label: "Mobile" },
  { pattern: /edtech|образован/i, label: "EdTech" },
  { pattern: /health|медицин|healthcare/i, label: "Health" },
];

const TASK_TYPE_PATTERNS: LabeledPattern[] = [
  { pattern: /whiteboard|вайтборд/i, label: "Вайтборд" },
  { pattern: /тестов|test.?task|тестовое/i, label: "Тестовое" },
  { pattern: /ui-?kit|ui kit|дизайн.?систем|компонент/i, label: "Причесать Figma" },
  { pattern: /figma|фигм/i, label: "Figma" },
  { pattern: /онборд|onboard/i, label: "Онбординг" },
  { pattern: /кейс|case|портфолио|portfolio/i, label: "Кейс" },
  { pattern: /аудит|audit|разобрать/i, label: "UX-аудит" },
  { pattern: /экран|screen|макет|интерфейс/i, label: "Экран" },
  { pattern: /лимит|limit|настройк|системн/i, label: "Системное" },
  { pattern: /research|исслед|интервью/i, label: "Исследование" },
];

const DEFAULT_SPHERE = "Продукт";
const DEFAULT_TASK_TYPE = "Практика";

function collectTagText(tags: CatalogTag[]): string {
  return tags.map((tag) => `${tag.slug} ${tag.name}`).join(" ");
}

function matchPattern(
  patterns: LabeledPattern[],
  ...sources: string[]
): string | null {
  const haystack = sources.join(" ");

  for (const entry of patterns) {
    if (entry.pattern.test(haystack)) {
      return entry.label;
    }
  }

  return null;
}

export function resolveTaskSphere(
  tags: CatalogTag[],
  title: string,
  description: string,
): string {
  const tagText = collectTagText(tags);

  return (
    matchPattern(SPHERE_PATTERNS, tagText, title, description) ?? DEFAULT_SPHERE
  );
}

export function resolveTaskType(
  tags: CatalogTag[],
  title: string,
  description: string,
): string {
  const tagText = collectTagText(tags);

  return (
    matchPattern(TASK_TYPE_PATTERNS, tagText, title, description) ??
    DEFAULT_TASK_TYPE
  );
}

export function resolveTaskCardEstimatedHours(
  level: Database["public"]["Enums"]["designer_level"] | undefined,
): string {
  return resolveTaskEstimatedHours(level ?? "all");
}
