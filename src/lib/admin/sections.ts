import "server-only";

import {
  getSectionSiteVisibility,
  isSectionVisibleOnSite,
} from "@/lib/catalog/section-visibility";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database.types";

import type {
  AdminMutationResult,
  AdminSectionFormInput,
  AdminSectionListItem,
} from "./types";
import { publishedAtForStatus, validateSectionInput } from "./validation";

type ProductStatus = Database["public"]["Enums"]["product_status"];

const STATUSES = new Set<ProductStatus>(["draft", "published", "hidden"]);

function getAdminClient() {
  return createSupabaseAdminClient();
}

async function loadPublishedMaterialCountsBySection(
  sectionIds: string[],
): Promise<Map<string, number>> {
  if (sectionIds.length === 0) {
    return new Map();
  }

  const admin = getAdminClient();

  const { data, error } = await admin
    .from("materials")
    .select("section_product_id, products!inner(status)")
    .in("section_product_id", sectionIds)
    .eq("products.status", "published");

  if (error) {
    throw new Error(error.message);
  }

  const counts = new Map<string, number>();

  for (const row of data ?? []) {
    if (!row.section_product_id) {
      continue;
    }

    counts.set(
      row.section_product_id,
      (counts.get(row.section_product_id) ?? 0) + 1,
    );
  }

  return counts;
}

function mapAdminSectionRow(
  row: {
    id: string;
    title: string;
    slug: string;
    description: string;
    status: ProductStatus;
    cover_path: string | null;
    sections: { position: number } | { position: number }[] | null;
  },
  publishedMaterialCount: number,
): AdminSectionListItem {
  const section = Array.isArray(row.sections) ? row.sections[0] : row.sections;

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    status: row.status,
    position: section?.position ?? 0,
    coverPath: row.cover_path,
    publishedMaterialCount,
    isVisibleOnSite: isSectionVisibleOnSite(row.status, publishedMaterialCount),
    siteVisibility: getSectionSiteVisibility(row.status, publishedMaterialCount),
  };
}

export async function listAdminSections(): Promise<AdminSectionListItem[]> {
  const admin = getAdminClient();

  const { data, error } = await admin
    .from("products")
    .select(
      `
      id,
      title,
      slug,
      description,
      status,
      cover_path,
      sections ( position )
    `,
    )
    .eq("kind", "section")
    .order("title");

  if (error) {
    throw new Error(error.message);
  }

  const rows = data ?? [];
  const materialCounts = await loadPublishedMaterialCountsBySection(
    rows.map((row) => row.id),
  );

  return rows.map((row) =>
    mapAdminSectionRow(row, materialCounts.get(row.id) ?? 0),
  );
}

export async function getAdminSectionDetail(
  sectionProductId: string,
): Promise<AdminSectionListItem | null> {
  const admin = getAdminClient();

  const { data, error } = await admin
    .from("products")
    .select(
      `
      id,
      title,
      slug,
      description,
      status,
      cover_path,
      sections ( position )
    `,
    )
    .eq("id", sectionProductId)
    .eq("kind", "section")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const materialCounts = await loadPublishedMaterialCountsBySection([data.id]);

  return mapAdminSectionRow(data, materialCounts.get(data.id) ?? 0);
}

export async function createAdminSection(
  input: AdminSectionFormInput,
): Promise<AdminMutationResult> {
  const fieldErrors = validateSectionInput(input);

  if (fieldErrors) {
    return { ok: false, fieldErrors };
  }

  const admin = getAdminClient();

  const { data: product, error: productError } = await admin
    .from("products")
    .insert({
      kind: "section",
      slug: input.slug.trim(),
      title: input.title.trim(),
      description: input.description.trim(),
      price_kopecks: 0,
      status: input.status,
      published_at: publishedAtForStatus(input.status),
      cover_path: input.coverPath?.trim() || null,
    })
    .select("id")
    .single();

  if (productError || !product) {
    return {
      ok: false,
      error: productError?.message ?? "Не удалось создать раздел",
    };
  }

  const { error: sectionError } = await admin.from("sections").insert({
    product_id: product.id,
    position: input.position,
    what_you_get: [],
    for_whom: [],
  });

  if (sectionError) {
    await admin.from("products").delete().eq("id", product.id);
    return { ok: false, error: sectionError.message };
  }

  return { ok: true, data: product.id };
}

export async function updateAdminSection(
  sectionProductId: string,
  input: AdminSectionFormInput,
): Promise<AdminMutationResult> {
  const fieldErrors = validateSectionInput(input);

  if (fieldErrors) {
    return { ok: false, fieldErrors };
  }

  const admin = getAdminClient();

  const { error: productError } = await admin
    .from("products")
    .update({
      slug: input.slug.trim(),
      title: input.title.trim(),
      description: input.description.trim(),
      status: input.status,
      published_at: publishedAtForStatus(input.status),
      cover_path: input.coverPath?.trim() || null,
    })
    .eq("id", sectionProductId)
    .eq("kind", "section");

  if (productError) {
    return { ok: false, error: productError.message };
  }

  const { error: sectionError } = await admin
    .from("sections")
    .update({ position: input.position })
    .eq("product_id", sectionProductId);

  if (sectionError) {
    return { ok: false, error: sectionError.message };
  }

  return { ok: true, data: sectionProductId };
}

export async function updateAdminSectionStatus(
  sectionProductId: string,
  status: ProductStatus,
): Promise<AdminMutationResult<string>> {
  if (!STATUSES.has(status)) {
    return { ok: false, error: "Недопустимый статус" };
  }

  const admin = getAdminClient();

  const { data: existing, error: fetchError } = await admin
    .from("products")
    .select("slug")
    .eq("id", sectionProductId)
    .eq("kind", "section")
    .maybeSingle();

  if (fetchError) {
    return { ok: false, error: fetchError.message };
  }

  if (!existing) {
    return { ok: false, error: "Раздел не найден" };
  }

  const { error } = await admin
    .from("products")
    .update({
      status,
      published_at: publishedAtForStatus(status),
    })
    .eq("id", sectionProductId)
    .eq("kind", "section");

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, data: existing.slug };
}

export async function deleteAdminSection(
  sectionProductId: string,
): Promise<AdminMutationResult> {
  const admin = getAdminClient();

  const { count, error: countError } = await admin
    .from("materials")
    .select("*", { count: "exact", head: true })
    .eq("section_product_id", sectionProductId);

  if (countError) {
    return { ok: false, error: countError.message };
  }

  if ((count ?? 0) > 0) {
    return {
      ok: false,
      error: "Нельзя удалить раздел с привязанными материалами. Сначала перенесите или удалите их.",
    };
  }

  const { error } = await admin
    .from("products")
    .delete()
    .eq("id", sectionProductId)
    .eq("kind", "section");

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, data: sectionProductId };
}
