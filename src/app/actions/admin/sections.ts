"use server";

import { revalidatePath } from "next/cache";

import { assertAdmin } from "@/lib/auth/admin";
import {
  createAdminSection,
  deleteAdminSection,
  updateAdminSection,
  updateAdminSectionStatus,
} from "@/lib/admin/sections";
import type { AdminMutationResult, AdminSectionFormInput } from "@/lib/admin/types";
import type { Database } from "@/types/database.types";

type ProductStatus = Database["public"]["Enums"]["product_status"];

function revalidateSectionPaths(slug?: string) {
  revalidatePath("/");
  revalidatePath("/admin/sections");

  if (slug) {
    revalidatePath(`/sections/${slug}`);
  }
}

export async function createSectionAction(
  input: AdminSectionFormInput,
): Promise<AdminMutationResult> {
  try {
    await assertAdmin();
  } catch {
    return { ok: false, error: "Нет доступа" };
  }

  const result = await createAdminSection(input);

  if (result.ok) {
    revalidateSectionPaths();
  }

  return result;
}

export async function updateSectionAction(
  sectionId: string,
  input: AdminSectionFormInput,
): Promise<AdminMutationResult> {
  try {
    await assertAdmin();
  } catch {
    return { ok: false, error: "Нет доступа" };
  }

  const result = await updateAdminSection(sectionId, input);

  if (result.ok) {
    revalidateSectionPaths(input.slug.trim());
  }

  return result;
}

export async function updateSectionStatusAction(
  sectionId: string,
  status: ProductStatus,
): Promise<AdminMutationResult> {
  try {
    await assertAdmin();
  } catch {
    return { ok: false, error: "Нет доступа" };
  }

  const result = await updateAdminSectionStatus(sectionId, status);

  if (result.ok) {
    revalidateSectionPaths(result.data);
  }

  return result;
}

export async function deleteSectionAction(
  sectionId: string,
): Promise<AdminMutationResult> {
  try {
    await assertAdmin();
  } catch {
    return { ok: false, error: "Нет доступа" };
  }

  const result = await deleteAdminSection(sectionId);

  if (result.ok) {
    revalidateSectionPaths();
  }

  return result;
}
