import type { Database } from "@/types/database.types";

import type {
  AdminProductFormInput,
  AdminSectionFormInput,
  AdminTagFormInput,
} from "./types";

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const PRODUCT_KINDS = new Set(["material", "task"]);
const STATUSES = new Set(["draft", "published", "hidden"]);
const LEVELS = new Set(["junior", "middle", "senior", "all"]);
const FORMATS = new Set([
  "mini_guide",
  "full_guide",
  "notes",
  "checklist",
  "template",
  "cheat_sheet",
  "lesson",
  "practice",
]);

function fieldError(
  fieldErrors: Record<string, string>,
  field: string,
  message: string,
) {
  if (!fieldErrors[field]) {
    fieldErrors[field] = message;
  }
}

export function validateSlug(
  slug: string,
  fieldErrors: Record<string, string>,
  field = "slug",
): boolean {
  const normalized = slug.trim();

  if (!normalized) {
    fieldError(fieldErrors, field, "Укажите slug");
    return false;
  }

  if (!SLUG_RE.test(normalized)) {
    fieldError(
      fieldErrors,
      field,
      "Slug: латиница, цифры и дефисы (например: my-product)",
    );
    return false;
  }

  return true;
}

export function validateProductInput(
  input: AdminProductFormInput,
): Record<string, string> | null {
  const fieldErrors: Record<string, string> = {};

  if (!input.title.trim()) {
    fieldError(fieldErrors, "title", "Укажите название");
  }

  validateSlug(input.slug, fieldErrors);

  if (!PRODUCT_KINDS.has(input.kind)) {
    fieldError(fieldErrors, "kind", "Выберите тип material или task");
  }

  if (!STATUSES.has(input.status)) {
    fieldError(fieldErrors, "status", "Выберите статус");
  }

  if (!LEVELS.has(input.level)) {
    fieldError(fieldErrors, "level", "Выберите уровень");
  }

  if (!Number.isFinite(input.priceRubles) || input.priceRubles < 0) {
    fieldError(fieldErrors, "priceRubles", "Цена не может быть отрицательной");
  }

  if (input.kind === "material") {
    if (!input.format || !FORMATS.has(input.format)) {
      fieldError(fieldErrors, "format", "Выберите формат материала");
    }

    if (!input.sectionProductId) {
      fieldError(fieldErrors, "sectionProductId", "Выберите раздел");
    }
  }

  return Object.keys(fieldErrors).length > 0 ? fieldErrors : null;
}

export function validateSectionInput(
  input: AdminSectionFormInput,
): Record<string, string> | null {
  const fieldErrors: Record<string, string> = {};

  if (!input.title.trim()) {
    fieldError(fieldErrors, "title", "Укажите название");
  }

  validateSlug(input.slug, fieldErrors);

  if (!STATUSES.has(input.status)) {
    fieldError(fieldErrors, "status", "Выберите статус");
  }

  if (!Number.isInteger(input.position) || input.position < 0) {
    fieldError(fieldErrors, "position", "Позиция должна быть ≥ 0");
  }

  return Object.keys(fieldErrors).length > 0 ? fieldErrors : null;
}

export function validateTagInput(
  input: AdminTagFormInput,
): Record<string, string> | null {
  const fieldErrors: Record<string, string> = {};

  if (!input.name.trim()) {
    fieldError(fieldErrors, "name", "Укажите название");
  }

  validateSlug(input.slug, fieldErrors);

  return Object.keys(fieldErrors).length > 0 ? fieldErrors : null;
}

export function rublesToKopecks(rubles: number): number {
  return Math.round(rubles * 100);
}

export function kopecksToRubles(kopecks: number): number {
  return kopecks / 100;
}

export function publishedAtForStatus(
  status: Database["public"]["Enums"]["product_status"],
): string | null {
  return status === "published" ? new Date().toISOString() : null;
}
