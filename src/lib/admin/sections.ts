import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

import type {
  AdminMutationResult,
  AdminSectionFormInput,
  AdminSectionListItem,
} from "./types";
import { publishedAtForStatus, validateSectionInput } from "./validation";

function getAdminClient() {
  return createSupabaseAdminClient();
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
      sections ( position )
    `,
    )
    .eq("kind", "section")
    .order("title");

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => {
    const section = Array.isArray(row.sections) ? row.sections[0] : row.sections;

    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      description: row.description,
      status: row.status,
      position: section?.position ?? 0,
    };
  });
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

  const section = Array.isArray(data.sections) ? data.sections[0] : data.sections;

  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    description: data.description,
    status: data.status,
    position: section?.position ?? 0,
  };
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
