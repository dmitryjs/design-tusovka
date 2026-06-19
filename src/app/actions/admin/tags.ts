"use server";

import { revalidatePath } from "next/cache";

import { assertAdmin } from "@/lib/auth/admin";
import { createAdminTag, updateAdminTag } from "@/lib/admin/tags";
import type { AdminMutationResult, AdminTagFormInput } from "@/lib/admin/types";

export async function createTagAction(
  input: AdminTagFormInput,
): Promise<AdminMutationResult> {
  try {
    await assertAdmin();
  } catch {
    return { ok: false, error: "Нет доступа" };
  }

  const result = await createAdminTag(input);

  if (result.ok) {
    revalidatePath("/admin/tags");
    revalidatePath("/catalog");
  }

  return result;
}

export async function updateTagAction(
  tagId: string,
  input: AdminTagFormInput,
): Promise<AdminMutationResult> {
  try {
    await assertAdmin();
  } catch {
    return { ok: false, error: "Нет доступа" };
  }

  const result = await updateAdminTag(tagId, input);

  if (result.ok) {
    revalidatePath("/admin/tags");
    revalidatePath("/catalog");
  }

  return result;
}
