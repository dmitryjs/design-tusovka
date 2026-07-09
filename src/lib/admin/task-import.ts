import "server-only";

import type { Json } from "@/types/database.types";
import type { Database } from "@/types/database.types";

import { multilineToStringListJson } from "@/lib/admin/content-json";
import { findOrCreateAdminTagByName } from "@/lib/admin/tags";
import type {
  TaskImportPreview,
  TaskImportPreviewItem,
  TaskImportRecord,
  TaskImportResult,
  TaskImportResultItem,
  TaskImportValidationError,
} from "@/lib/admin/task-import-types";
import { getCatalogItemHref } from "@/lib/catalog/paths";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

import { publishedAtForStatus, validateSlug } from "./validation";

export type {
  TaskImportPreview,
  TaskImportPreviewItem,
  TaskImportRecord,
  TaskImportResult,
  TaskImportResultItem,
  TaskImportValidationError,
} from "@/lib/admin/task-import-types";

function getAdminClient() {
  return createSupabaseAdminClient();
}

type ProductStatus = Database["public"]["Enums"]["product_status"];
type DesignerLevel = Database["public"]["Enums"]["designer_level"];

const LEVELS = new Set<DesignerLevel>(["junior", "middle", "senior", "all"]);
const STATUSES = new Set<ProductStatus>(["draft", "published", "hidden"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(
  value: unknown,
  field: string,
  index: number,
  errors: TaskImportValidationError[],
  required = true,
): string | null {
  if (typeof value !== "string") {
    if (required || value !== undefined) {
      errors.push({
        index,
        field,
        message: `Поле "${field}" должно быть строкой`,
      });
    }
    return null;
  }

  const trimmed = value.trim();
  if (required && !trimmed) {
    errors.push({
      index,
      field,
      message: `Поле "${field}" обязательно`,
    });
    return null;
  }

  return trimmed;
}

function readStringArray(
  value: unknown,
  field: string,
  index: number,
  errors: TaskImportValidationError[],
): string[] {
  if (value === undefined) {
    return [];
  }

  if (!Array.isArray(value)) {
    errors.push({
      index,
      field,
      message: `Поле "${field}" должно быть массивом строк`,
    });
    return [];
  }

  const items: string[] = [];

  for (let itemIndex = 0; itemIndex < value.length; itemIndex += 1) {
    const item = value[itemIndex];
    if (typeof item !== "string" || !item.trim()) {
      errors.push({
        index,
        field,
        message: `Элемент ${itemIndex} в "${field}" должен быть непустой строкой`,
      });
      continue;
    }

    items.push(item.trim());
  }

  return items;
}

function readInteger(
  value: unknown,
  field: string,
  index: number,
  errors: TaskImportValidationError[],
): number | null {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    errors.push({
      index,
      field,
      message: `Поле "${field}" должно быть целым числом`,
    });
    return null;
  }

  if (value < 0) {
    errors.push({
      index,
      field,
      message: `Поле "${field}" не может быть отрицательным`,
    });
    return null;
  }

  return value;
}

export function parseTaskImportJson(
  raw: string,
): { ok: true; items: unknown[] } | { ok: false; error: string } {
  const trimmed = raw.trim();

  if (!trimmed) {
    return { ok: false, error: "Вставьте JSON или загрузите файл" };
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return { ok: false, error: "Некорректный JSON" };
  }

  if (!Array.isArray(parsed)) {
    return { ok: false, error: "JSON должен быть массивом задач" };
  }

  return { ok: true, items: parsed };
}

export function validateTaskImportItems(items: unknown[]): {
  records: TaskImportRecord[];
  errors: TaskImportValidationError[];
} {
  const records: TaskImportRecord[] = [];
  const errors: TaskImportValidationError[] = [];
  const slugToIndex = new Map<string, number>();

  items.forEach((item, index) => {
    if (!isRecord(item)) {
      errors.push({
        index,
        message: "Элемент должен быть объектом",
      });
      return;
    }

    const title = readString(item.title, "title", index, errors);
    const slug = readString(item.slug, "slug", index, errors);
    const description = readString(item.description, "description", index, errors);
    const brief = readString(item.brief, "brief", index, errors);
    const levelRaw = readString(item.level, "level", index, errors);
    const statusRaw = readString(item.status, "status", index, errors);
    const priceKopecks = readInteger(item.price_kopecks, "price_kopecks", index, errors);
    const tags = readStringArray(item.tags, "tags", index, errors);
    const criteria = readStringArray(item.criteria, "criteria", index, errors);

    if (!slug) {
      return;
    }

    const fieldErrors: Record<string, string> = {};
    validateSlug(slug, fieldErrors);
    for (const [field, message] of Object.entries(fieldErrors)) {
      errors.push({ index, field, message });
    }

    if (levelRaw && !LEVELS.has(levelRaw as DesignerLevel)) {
      errors.push({
        index,
        field: "level",
        message: "level должен быть junior, middle, senior или all",
      });
    }

    if (statusRaw && !STATUSES.has(statusRaw as ProductStatus)) {
      errors.push({
        index,
        field: "status",
        message: "status должен быть draft, published или hidden",
      });
    }

    const duplicateIndex = slugToIndex.get(slug);
    if (duplicateIndex !== undefined) {
      errors.push({
        index,
        field: "slug",
        message: `Дублирующийся slug (уже в элементе ${duplicateIndex})`,
      });
    } else {
      slugToIndex.set(slug, index);
    }

    if (
      !title ||
      !description ||
      !brief ||
      !levelRaw ||
      !statusRaw ||
      priceKopecks === null ||
      !LEVELS.has(levelRaw as DesignerLevel) ||
      !STATUSES.has(statusRaw as ProductStatus) ||
      fieldErrors.slug
    ) {
      return;
    }

    records.push({
      title,
      slug,
      description,
      level: levelRaw as DesignerLevel,
      priceKopecks,
      status: statusRaw as ProductStatus,
      brief,
      tags,
      criteria,
    });
  });

  return { records, errors };
}

async function loadExistingProductsBySlug(
  slugs: string[],
): Promise<Map<string, { id: string; kind: Database["public"]["Enums"]["product_kind"] }>> {
  if (slugs.length === 0) {
    return new Map();
  }

  const admin = getAdminClient();
  const { data, error } = await admin
    .from("products")
    .select("id, slug, kind")
    .in("slug", slugs);

  if (error) {
    throw new Error(error.message);
  }

  return new Map((data ?? []).map((row) => [row.slug, { id: row.id, kind: row.kind }]));
}

export async function previewTaskImport(records: TaskImportRecord[]): Promise<TaskImportPreview> {
  const existing = await loadExistingProductsBySlug(records.map((record) => record.slug));

  const items: TaskImportPreviewItem[] = records.map((record, index) => {
    const found = existing.get(record.slug);

    if (found && found.kind !== "task") {
      return {
        index,
        slug: record.slug,
        title: record.title,
        action: "error",
        error: `slug уже используется продуктом типа ${found.kind}`,
      };
    }

    return {
      index,
      slug: record.slug,
      title: record.title,
      action: found ? "update" : "create",
    };
  });

  const structuralErrors = items
    .filter((item) => item.action === "error")
    .map((item) => ({
      index: item.index,
      field: "slug",
      message: item.error ?? "Невозможно импортировать",
    }));

  const toCreate = items.filter((item) => item.action === "create").length;
  const toUpdate = items.filter((item) => item.action === "update").length;
  const errorCount = structuralErrors.length;

  return {
    total: records.length,
    toCreate,
    toUpdate,
    errorCount,
    errors: structuralErrors,
    slugs: records.map((record) => record.slug),
    items,
    canImport: records.length > 0 && errorCount === 0,
  };
}

async function syncProductTags(productId: string, tagIds: string[]) {
  const admin = getAdminClient();

  const { error: deleteError } = await admin
    .from("product_tags")
    .delete()
    .eq("product_id", productId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  if (tagIds.length === 0) {
    return;
  }

  const { error } = await admin.from("product_tags").insert(
    tagIds.map((tagId) => ({
      product_id: productId,
      tag_id: tagId,
    })),
  );

  if (error) {
    throw new Error(error.message);
  }
}

async function syncTaskAiCriteria(productId: string, criteria: string[]) {
  const admin = getAdminClient();

  const { error: deleteError } = await admin
    .from("task_ai_criteria")
    .delete()
    .eq("task_product_id", productId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  if (criteria.length === 0) {
    return;
  }

  const { error } = await admin.from("task_ai_criteria").insert(
    criteria.map((title, position) => ({
      task_product_id: productId,
      title,
      position,
    })),
  );

  if (error) {
    throw new Error(error.message);
  }
}

async function resolveTagIds(tagNames: string[]): Promise<string[]> {
  const tagIds: string[] = [];

  for (const name of tagNames) {
    const result = await findOrCreateAdminTagByName(name);
    if (!result.ok || !result.data) {
      throw new Error(result.error ?? `Не удалось создать тег «${name}»`);
    }

    tagIds.push(result.data.id);
  }

  return tagIds;
}

function briefToJson(brief: string): Json {
  return multilineToStringListJson(brief);
}

async function upsertImportedTask(
  record: TaskImportRecord,
  existingProductId: string | null,
): Promise<{ id: string; action: "create" | "update" }> {
  const admin = getAdminClient();
  const tagIds = await resolveTagIds(record.tags);
  const briefJson = briefToJson(record.brief);

  if (existingProductId) {
    const { error: productError } = await admin
      .from("products")
      .update({
        title: record.title,
        description: record.description,
        price_kopecks: record.priceKopecks,
        status: record.status,
        published_at: publishedAtForStatus(record.status),
      })
      .eq("id", existingProductId);

    if (productError) {
      throw new Error(productError.message);
    }

    const { error: taskError } = await admin
      .from("tasks")
      .update({ level: record.level })
      .eq("product_id", existingProductId);

    if (taskError) {
      throw new Error(taskError.message);
    }

    const { error: contentError } = await admin.from("task_content").upsert(
      {
        task_product_id: existingProductId,
        brief: briefJson,
        submission_requirements: [],
      },
      { onConflict: "task_product_id" },
    );

    if (contentError) {
      throw new Error(contentError.message);
    }

    await syncTaskAiCriteria(existingProductId, record.criteria);
    await syncProductTags(existingProductId, tagIds);

    return { id: existingProductId, action: "update" };
  }

  const { data: product, error: productError } = await admin
    .from("products")
    .insert({
      kind: "task",
      slug: record.slug,
      title: record.title,
      description: record.description,
      price_kopecks: record.priceKopecks,
      status: record.status,
      cover_path: null,
      published_at: publishedAtForStatus(record.status),
    })
    .select("id")
    .single();

  if (productError || !product) {
    throw new Error(productError?.message ?? "Не удалось создать продукт");
  }

  try {
    const { error: taskError } = await admin.from("tasks").insert({
      product_id: product.id,
      level: record.level,
      ai_review_available: true,
      manual_review_available: false,
    });

    if (taskError) {
      throw new Error(taskError.message);
    }

    const { error: contentError } = await admin.from("task_content").insert({
      task_product_id: product.id,
      brief: briefJson,
      submission_requirements: [],
    });

    if (contentError) {
      throw new Error(contentError.message);
    }

    await syncTaskAiCriteria(product.id, record.criteria);
    await syncProductTags(product.id, tagIds);

    return { id: product.id, action: "create" };
  } catch (error) {
    await admin.from("products").delete().eq("id", product.id);
    throw error;
  }
}

export async function importTaskRecords(records: TaskImportRecord[]): Promise<TaskImportResult> {
  const preview = await previewTaskImport(records);

  if (!preview.canImport) {
    return {
      created: [],
      updated: [],
      skipped: [],
      errors: preview.errors,
    };
  }

  const existing = await loadExistingProductsBySlug(records.map((record) => record.slug));
  const created: TaskImportResultItem[] = [];
  const updated: TaskImportResultItem[] = [];
  const skipped: Array<{ slug: string; reason: string }> = [];
  const errors: TaskImportValidationError[] = [];

  for (let index = 0; index < records.length; index += 1) {
    const record = records[index];
    const found = existing.get(record.slug);

    if (found && found.kind !== "task") {
      errors.push({
        index,
        field: "slug",
        message: `slug уже используется продуктом типа ${found.kind}`,
      });
      skipped.push({
        slug: record.slug,
        reason: `slug занят продуктом типа ${found.kind}`,
      });
      continue;
    }

    try {
      const result = await upsertImportedTask(record, found?.id ?? null);
      const item = {
        slug: record.slug,
        id: result.id,
        href: getCatalogItemHref("task", record.slug),
        adminHref: `/admin/products/${result.id}`,
      };

      if (result.action === "create") {
        created.push(item);
      } else {
        updated.push(item);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Ошибка импорта";
      errors.push({ index, message });
      skipped.push({ slug: record.slug, reason: message });
    }
  }

  return { created, updated, skipped, errors };
}
