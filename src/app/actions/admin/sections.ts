"use server";

import { revalidatePath } from "next/cache";

import { assertAdmin } from "@/lib/auth/admin";
import {
  createAdminSection,
  deleteAdminSection,
  updateAdminSection,
} from "@/lib/admin/sections";
import type { AdminMutationResult, AdminSectionFormInput } from "@/lib/admin/types";

function revalidateSectionPaths() {
  revalidatePath("/");
  revalidatePath("/");
  revalidatePath("/admin/sections");
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
    revalidateSectionPaths();
    revalidatePath(`/sections/${input.slug.trim()}`);
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
