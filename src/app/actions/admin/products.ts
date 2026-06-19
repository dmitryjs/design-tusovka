"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { assertAdmin } from "@/lib/auth/admin";
import {
  createAdminProduct,
  updateAdminProduct,
} from "@/lib/admin/products";
import type {
  AdminMutationResult,
  AdminProductFormInput,
} from "@/lib/admin/types";
import { getCatalogItemHref } from "@/lib/catalog/paths";

function revalidateCatalogPaths(
  kind: AdminProductFormInput["kind"],
  slug: string,
) {
  revalidatePath("/");
  revalidatePath("/catalog");
  revalidatePath("/tasks");
  revalidatePath(getCatalogItemHref(kind, slug));
}

export async function createProductAction(
  input: AdminProductFormInput,
): Promise<AdminMutationResult> {
  try {
    await assertAdmin();
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error && error.message === "FORBIDDEN"
          ? "Нет прав администратора"
          : "Требуется вход",
    };
  }

  const result = await createAdminProduct(input);

  if (result.ok && result.data) {
    revalidateCatalogPaths(input.kind, input.slug.trim());
    redirect(`/admin/products/${result.data}?saved=1`);
  }

  return result;
}

export async function updateProductAction(
  productId: string,
  input: AdminProductFormInput,
): Promise<AdminMutationResult> {
  try {
    await assertAdmin();
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error && error.message === "FORBIDDEN"
          ? "Нет прав администратора"
          : "Требуется вход",
    };
  }

  const result = await updateAdminProduct(productId, input);

  if (result.ok) {
    revalidateCatalogPaths(input.kind, input.slug.trim());
    revalidatePath(`/admin/products/${productId}`);
  }

  return result;
}
