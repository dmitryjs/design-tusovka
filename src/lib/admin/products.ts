import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

import {
  chapterContentJsonToText,
  multilineToStringListJson,
  stringListJsonToMultiline,
  textToChapterContentJson,
} from "./content-json";
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
      materials ( level ),
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
    };
  });
}

export async function getAdminProductDetail(
  productId: string,
): Promise<AdminProductDetail | null> {
  const admin = getAdminClient();

  const { data: product, error } = await admin
    .from("products")
    .select("id, title, slug, description, kind, status, price_kopecks")
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
      tagIds,
      chapters: (chapters ?? []).map((chapter) => ({
        id: chapter.id,
        title: chapter.title,
        contentText: chapterContentJsonToText(chapter.content),
        position: chapter.position,
      })),
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
    tagIds,
    chapters: [],
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

async function syncMaterialChapters(
  productId: string,
  chapters: AdminProductFormInput["chapters"],
) {
  const admin = getAdminClient();
  const { data: existing, error: existingError } = await admin
    .from("material_chapters")
    .select("id")
    .eq("material_product_id", productId);

  if (existingError) {
    throw new Error(existingError.message);
  }

  const keepIds = new Set(
    chapters.map((chapter) => chapter.id).filter(Boolean) as string[],
  );
  const deleteIds = (existing ?? [])
    .map((row) => row.id)
    .filter((id) => !keepIds.has(id));

  if (deleteIds.length > 0) {
    const { error } = await admin
      .from("material_chapters")
      .delete()
      .in("id", deleteIds);

    if (error) {
      throw new Error(error.message);
    }
  }

  for (const chapter of chapters) {
    const payload = {
      material_product_id: productId,
      title: chapter.title.trim(),
      content: textToChapterContentJson(chapter.contentText),
      position: chapter.position,
    };

    if (chapter.id) {
      const { error } = await admin
        .from("material_chapters")
        .update(payload)
        .eq("id", chapter.id);

      if (error) {
        throw new Error(error.message);
      }
    } else if (chapter.title.trim()) {
      const { error } = await admin.from("material_chapters").insert(payload);

      if (error) {
        throw new Error(error.message);
      }
    }
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

      await syncMaterialChapters(product.id, input.chapters);
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

      await syncMaterialChapters(productId, input.chapters);
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
    .select("id, title")
    .eq("kind", "section")
    .order("title");

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
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
