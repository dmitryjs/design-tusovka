"use server";

import { revalidatePath } from "next/cache";

import {
  importTaskRecords,
  parseTaskImportJson,
  previewTaskImport,
  validateTaskImportItems,
  type TaskImportPreview,
  type TaskImportResult,
} from "@/lib/admin/task-import";
import { assertAdmin } from "@/lib/auth/admin";
import { getCatalogItemHref } from "@/lib/catalog/paths";

type TaskImportActionError = {
  ok: false;
  error: string;
};

type TaskImportPreviewActionResult =
  | TaskImportActionError
  | {
      ok: true;
      preview: TaskImportPreview;
    };

type TaskImportRunActionResult =
  | TaskImportActionError
  | {
      ok: true;
      result: TaskImportResult;
    };

function adminAuthError(error: unknown): TaskImportActionError {
  return {
    ok: false,
    error:
      error instanceof Error && error.message === "FORBIDDEN"
        ? "Нет прав администратора"
        : "Требуется вход",
  };
}

function parseAndValidate(jsonText: string) {
  const parsed = parseTaskImportJson(jsonText);
  if (!parsed.ok) {
    return { ok: false as const, error: parsed.error };
  }

  const { records, errors } = validateTaskImportItems(parsed.items);
  return { ok: true as const, records, errors };
}

export async function previewTaskImportAction(
  jsonText: string,
): Promise<TaskImportPreviewActionResult> {
  try {
    await assertAdmin();
  } catch (error) {
    return adminAuthError(error);
  }

  const validation = parseAndValidate(jsonText);
  if (!validation.ok) {
    return { ok: false, error: validation.error };
  }

  const preview = await previewTaskImport(validation.records);
  const errors = [...validation.errors, ...preview.errors];

  return {
    ok: true,
    preview: {
      ...preview,
      errorCount: errors.length,
      errors,
      canImport: validation.records.length > 0 && errors.length === 0,
    },
  };
}

export async function importTasksAction(
  jsonText: string,
): Promise<TaskImportRunActionResult> {
  try {
    await assertAdmin();
  } catch (error) {
    return adminAuthError(error);
  }

  const validation = parseAndValidate(jsonText);
  if (!validation.ok) {
    return { ok: false, error: validation.error };
  }

  if (validation.errors.length > 0) {
    return {
      ok: false,
      error: `Исправьте ${validation.errors.length} ошибок перед импортом`,
    };
  }

  const preview = await previewTaskImport(validation.records);
  if (!preview.canImport) {
    return {
      ok: false,
      error: "Импорт невозможен: есть критичные ошибки",
    };
  }

  const result = await importTaskRecords(validation.records);

  revalidatePath("/");
  revalidatePath("/tasks");
  revalidatePath("/admin");
  revalidatePath("/admin/products");

  for (const item of [...result.created, ...result.updated]) {
    revalidatePath(getCatalogItemHref("task", item.slug));
    revalidatePath(item.adminHref);
  }

  return { ok: true, result };
}
