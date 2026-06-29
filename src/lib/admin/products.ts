import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

import {
  chapterContentJsonToText,
  multilineToStringListJson,
  stringListJsonToMultiline,
} from "./content-json";
import {
  chaptersToMaterialBlocks,
  materialBlocksToJson,
} from "@/lib/content/material-blocks";
import {
  isPublishedCatalogSectionSlug,
  resolveSectionCatalogSlug,
  resolveSectionDisplayTitle,
} from "@/lib/catalog/section-pages";
import type {
  AdminMutationResult,
  AdminProductDetail,
  AdminProductFormInput,
  AdminProductListItem,
} from "./types";
import {
  kopecksToRubles,
  publishedAtForStatus,
  rublesToKopecks,
  validateProductInput,
} from "./validation";

function getAdminClient() {
  return createSupabaseAdminClient();
}

export async function listAdminProducts(): Promise<AdminProductListItem[]> {
  const admin = getAdminClient();

  const { data, error } = await admin
    .from("products")
    .select(
      `
      id,
      title,
      slug,
      kind,
      status,
      price_kopecks,
      cover_path,
      materials ( level, format ),
      tasks ( level )
    `,
    )
    .in("kind", ["material", "task"])
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => {
    const material = Array.isArray(row.materials)
      ? row.materials[0]
      : row.materials;
    const task = Array.isArray(row.tasks) ? row.tasks[0] : row.tasks;

    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      kind: row.kind,
      status: row.status,
      priceKopecks: row.price_kopecks,
      level: material?.level ?? task?.level ?? null,
      coverPath: row.cover_path,
      materialFormat: material?.format ?? null,
    };
  });
}

export async function getAdminProductDetail(
  productId: string,
): Promise<AdminProductDetail | null> {
  const admin = getAdminClient();

  const { data: product, error } = await admin
    .from("products")
    .select("id, title, slug, description, kind, status, price_kopecks, cover_path")
    .eq("id", productId)
    .in("kind", ["material", "task"])
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!product) {
    return null;
  }

  const { data: tagRows } = await admin
    .from("product_tags")
    .select("tag_id")
    .eq("product_id", productId);

  const tagIds = (tagRows ?? []).map((row) => row.tag_id);

  if (product.kind === "material") {
    const { data: material, error: materialError } = await admin
      .from("materials")
      .select("format, level, section_product_id")
      .eq("product_id", productId)
      .maybeSingle();

    if (materialError || !material) {
      throw new Error(materialError?.message ?? "Material row not found");
    }

    const { data: chapters, error: chaptersError } = await admin
      .from("material_chapters")
      .select("id, title, content, position")
      .eq("material_product_id", productId)
      .order("position");

    if (chaptersError) {
      throw new Error(chaptersError.message);
    }

    return {
      id: product.id,
      title: product.title,
      slug: product.slug,
      description: product.description,
      kind: "material",
      level: material.level,
      format: material.format,
      priceKopecks: product.price_kopecks,
      priceRubles: kopecksToRubles(product.price_kopecks),
      status: product.status,
      sectionProductId: material.section_product_id,
      coverPath: product.cover_path,
      tagIds,
      chapters: (chapters ?? []).map((chapter) => ({
        id: chapter.id,
        title: chapter.title,
        contentText: chapterContentJsonToText(chapter.content),
        position: chapter.position,
      })),
      contentBlocks: chaptersToMaterialBlocks(
        (chapters ?? []).map((chapter) => ({
          title: chapter.title,
          content: chapter.content,
        })),
      ),
      taskBriefText: "",
      taskSubmissionText: "",
    };
  }

  const { data: task, error: taskError } = await admin
    .from("tasks")
    .select("level")
    .eq("product_id", productId)
    .maybeSingle();

  if (taskError || !task) {
    throw new Error(taskError?.message ?? "Task row not found");
  }

  const { data: content } = await admin
    .from("task_content")
    .select("brief, submission_requirements")
    .eq("task_product_id", productId)
    .maybeSingle();

  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    description: product.description,
    kind: "task",
    level: task.level,
    priceKopecks: product.price_kopecks,
    priceRubles: kopecksToRubles(product.price_kopecks),
    status: product.status,
    coverPath: product.cover_path,
    tagIds,
    chapters: [],
    contentBlocks: [],
    taskBriefText: stringListJsonToMultiline(content?.brief ?? []),
    taskSubmissionText: stringListJsonToMultiline(
      content?.submission_requirements ?? [],
    ),
  };
}

async function syncProductTags(productId: string, tagIds: string[]) {
  const admin = getAdminClient();

  await admin.from("product_tags").delete().eq("product_id", productId);

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

async function syncMaterialContentBlocks(
  productId: string,
  blocks: AdminProductFormInput["contentBlocks"],
  existingChapterId?: string,
) {
  const admin = getAdminClient();
  const { data: existing, error: existingError } = await admin
    .from("material_chapters")
    .select("id")
    .eq("material_product_id", productId);

  if (existingError) {
    throw new Error(existingError.message);
  }

  const keepId = existingChapterId ?? existing?.[0]?.id;
  const deleteIds = (existing ?? [])
    .map((row) => row.id)
    .filter((id) => id !== keepId);

  if (deleteIds.length > 0) {
    const { error } = await admin
      .from("material_chapters")
      .delete()
      .in("id", deleteIds);

    if (error) {
      throw new Error(error.message);
    }
  }

  const payload = {
    material_product_id: productId,
    title: "Контент",
    content: materialBlocksToJson(blocks),
    position: 0,
  };

  if (keepId) {
    const { error } = await admin
      .from("material_chapters")
      .update(payload)
      .eq("id", keepId);

    if (error) {
      throw new Error(error.message);
    }

    return;
  }

  const { error } = await admin.from("material_chapters").insert(payload);

  if (error) {
    throw new Error(error.message);
  }
}

export async function createAdminProduct(
  input: AdminProductFormInput,
): Promise<AdminMutationResult> {
  const fieldErrors = validateProductInput(input);

  if (fieldErrors) {
    return { ok: false, fieldErrors };
  }

  const admin = getAdminClient();
  const priceKopecks = rublesToKopecks(input.priceRubles);

  const { data: product, error: productError } = await admin
    .from("products")
    .insert({
      kind: input.kind,
      slug: input.slug.trim(),
      title: input.title.trim(),
      description: input.description.trim(),
      price_kopecks: priceKopecks,
      status: input.status,
      cover_path: input.kind === "material" ? input.coverPath?.trim() || null : null,
      published_at: publishedAtForStatus(input.status),
    })
    .select("id")
    .single();

  if (productError || !product) {
    return {
      ok: false,
      error: productError?.message ?? "Не удалось создать продукт",
    };
  }

  try {
    if (input.kind === "material") {
      const { error } = await admin.from("materials").insert({
        product_id: product.id,
        section_product_id: input.sectionProductId!,
        format: input.format!,
        level: input.level,
      });

      if (error) {
        throw new Error(error.message);
      }

      await syncMaterialContentBlocks(
        product.id,
        input.contentBlocks,
        input.chapters[0]?.id,
      );
    } else {
      const { error: taskError } = await admin.from("tasks").insert({
        product_id: product.id,
        level: input.level,
        ai_review_available: true,
        manual_review_available: false,
      });

      if (taskError) {
        throw new Error(taskError.message);
      }

      const { error: contentError } = await admin.from("task_content").insert({
        task_product_id: product.id,
        brief: multilineToStringListJson(input.taskBriefText),
        submission_requirements: multilineToStringListJson(
          input.taskSubmissionText,
        ),
      });

      if (contentError) {
        throw new Error(contentError.message);
      }
    }

    await syncProductTags(product.id, input.tagIds);

    return { ok: true, data: product.id };
  } catch (error) {
    await admin.from("products").delete().eq("id", product.id);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Ошибка создания",
    };
  }
}

export async function updateAdminProduct(
  productId: string,
  input: AdminProductFormInput,
): Promise<AdminMutationResult> {
  const fieldErrors = validateProductInput(input);

  if (fieldErrors) {
    return { ok: false, fieldErrors };
  }

  const admin = getAdminClient();
  const existing = await getAdminProductDetail(productId);

  if (!existing) {
    return { ok: false, error: "Продукт не найден" };
  }

  if (existing.kind !== input.kind) {
    return { ok: false, error: "Нельзя менять тип продукта" };
  }

  const priceKopecks = rublesToKopecks(input.priceRubles);

  const { error: productError } = await admin
    .from("products")
    .update({
      slug: input.slug.trim(),
      title: input.title.trim(),
      description: input.description.trim(),
      price_kopecks: priceKopecks,
      status: input.status,
      published_at: publishedAtForStatus(input.status),
      ...(input.kind === "material"
        ? { cover_path: input.coverPath?.trim() || null }
        : {}),
    })
    .eq("id", productId);

  if (productError) {
    return { ok: false, error: productError.message };
  }

  try {
    if (input.kind === "material") {
      const { error } = await admin
        .from("materials")
        .update({
          section_product_id: input.sectionProductId!,
          format: input.format!,
          level: input.level,
        })
        .eq("product_id", productId);

      if (error) {
        throw new Error(error.message);
      }

      await syncMaterialContentBlocks(
        productId,
        input.contentBlocks,
        input.chapters[0]?.id,
      );
    } else {
      const { error: taskError } = await admin
        .from("tasks")
        .update({ level: input.level })
        .eq("product_id", productId);

      if (taskError) {
        throw new Error(taskError.message);
      }

      const { error: contentError } = await admin.from("task_content").upsert(
        {
          task_product_id: productId,
          brief: multilineToStringListJson(input.taskBriefText),
          submission_requirements: multilineToStringListJson(
            input.taskSubmissionText,
          ),
        },
        { onConflict: "task_product_id" },
      );

      if (contentError) {
        throw new Error(contentError.message);
      }
    }

    await syncProductTags(productId, input.tagIds);

    return { ok: true, data: productId };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Ошибка сохранения",
    };
  }
}

export async function listAdminSectionOptions(): Promise<
  Array<{ id: string; title: string }>
> {
  const admin = getAdminClient();

  const { data, error } = await admin
    .from("products")
    .select("id, slug, title")
    .eq("kind", "section")
    .eq("status", "published")
    .order("title");

  if (error) {
    throw new Error(error.message);
  }

  const options = new Map<string, { id: string; title: string }>();

  for (const row of data ?? []) {
    const catalogSlug = resolveSectionCatalogSlug(row.slug);
    if (!isPublishedCatalogSectionSlug(catalogSlug)) {
      continue;
    }

    const title = resolveSectionDisplayTitle(row.slug, row.title);
    const existing = options.get(catalogSlug);

    if (!existing || row.slug === catalogSlug) {
      options.set(catalogSlug, { id: row.id, title });
    }
  }

  return [...options.values()].sort((left, right) =>
    left.title.localeCompare(right.title, "ru"),
  );
}

export async function listAdminTagOptions(): Promise<
  Array<{ id: string; name: string }>
> {
  const admin = getAdminClient();

  const { data, error } = await admin
    .from("tags")
    .select("id, name")
    .order("name");

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export type AdminBulkDeleteProductsResult = {
  deleted: Array<{ id: string; slug: string; kind: "material" | "task" }>;
  failures: Array<{ id: string; message: string }>;
};

async function assertProductDeletable(
  admin: ReturnType<typeof getAdminClient>,
  productId: string,
): Promise<AdminMutationResult<{ slug: string; kind: "material" | "task" }>> {
  const { data: product, error: productError } = await admin
    .from("products")
    .select("id, slug, kind")
    .eq("id", productId)
    .in("kind", ["material", "task"])
    .maybeSingle();

  if (productError) {
    return { ok: false, error: productError.message };
  }

  if (!product || (product.kind !== "material" && product.kind !== "task")) {
    return { ok: false, error: "Продукт не найден" };
  }

  const { count, error: orderError } = await admin
    .from("order_items")
    .select("*", { count: "exact", head: true })
    .eq("product_id", productId);

  if (orderError) {
    return { ok: false, error: orderError.message };
  }

  if ((count ?? 0) > 0) {
    return {
      ok: false,
      error:
        "Нельзя удалить продукт из заказов. Установите статус «Скрыт», если нужно убрать с витрины.",
    };
  }

  return {
    ok: true,
    data: { slug: product.slug, kind: product.kind },
  };
}

export async function deleteAdminProduct(
  productId: string,
): Promise<AdminMutationResult<{ slug: string; kind: "material" | "task" }>> {
  const admin = getAdminClient();
  const check = await assertProductDeletable(admin, productId);

  if (!check.ok || !check.data) {
    return { ok: false, error: check.error };
  }

  const { error } = await admin.from("products").delete().eq("id", productId);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, data: check.data };
}

export async function deleteAdminProductsBulk(
  productIds: string[],
): Promise<AdminMutationResult<AdminBulkDeleteProductsResult>> {
  const uniqueIds = [...new Set(productIds.map((id) => id.trim()).filter(Boolean))];

  if (uniqueIds.length === 0) {
    return { ok: false, error: "Не выбрано ни одного продукта" };
  }

  const admin = getAdminClient();
  const deleted: AdminBulkDeleteProductsResult["deleted"] = [];
  const failures: AdminBulkDeleteProductsResult["failures"] = [];

  for (const productId of uniqueIds) {
    const check = await assertProductDeletable(admin, productId);

    if (!check.ok || !check.data) {
      failures.push({ id: productId, message: check.error ?? "Не удалось удалить" });
      continue;
    }

    const { error } = await admin.from("products").delete().eq("id", productId);

    if (error) {
      failures.push({ id: productId, message: error.message });
      continue;
    }

    deleted.push({ id: productId, slug: check.data.slug, kind: check.data.kind });
  }

  if (deleted.length === 0) {
    return {
      ok: false,
      error: failures[0]?.message ?? "Не удалось удалить выбранные продукты",
      data: { deleted, failures },
    };
  }

  return {
    ok: true,
    data: { deleted, failures },
  };
}
