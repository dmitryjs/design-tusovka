"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { assertAdmin } from "@/lib/auth/admin";
import {
  createAdminProduct,
  deleteAdminProduct,
  deleteAdminProductsBulk,
  listAdminPromoTargets,
  updateAdminProductsStatusBulk,
  updateAdminProduct,
  type AdminBulkStatusUpdateProductsResult,
  type AdminBulkDeleteProductsResult,
} from "@/lib/admin/products";
import type {
  AdminMutationResult,
  AdminProductFormInput,
  AdminPromoTargetOption,
} from "@/lib/admin/types";
import { getCatalogItemHref } from "@/lib/catalog/paths";

function revalidateCatalogPaths(
  kind: AdminProductFormInput["kind"],
  slug: string,
) {
  revalidatePath("/");
  revalidatePath("/");
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

function revalidateAfterProductDelete(kind: "material" | "task", slug: string) {
  revalidateCatalogPaths(kind, slug);
  revalidatePath("/admin/products");
  revalidatePath("/admin");
}

export async function deleteProductAction(
  productId: string,
): Promise<AdminMutationResult<{ slug: string; kind: "material" | "task" }>> {
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

  const result = await deleteAdminProduct(productId);

  if (result.ok && result.data) {
    revalidateAfterProductDelete(result.data.kind, result.data.slug);
  }

  return result;
}

export async function deleteProductsBulkAction(
  productIds: string[],
): Promise<AdminMutationResult<AdminBulkDeleteProductsResult>> {
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

  const result = await deleteAdminProductsBulk(productIds);

  if (result.ok && result.data) {
    for (const item of result.data.deleted) {
      revalidateCatalogPaths(item.kind, item.slug);
    }
    revalidatePath("/admin/products");
    revalidatePath("/admin");
  }

  return result;
}

export async function updateProductsStatusBulkAction(
  productIds: string[],
  status: "draft" | "published" | "hidden",
): Promise<AdminMutationResult<AdminBulkStatusUpdateProductsResult>> {
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

  const result = await updateAdminProductsStatusBulk(productIds, status);

  if (result.ok && result.data) {
    for (const item of result.data.updated) {
      revalidateCatalogPaths(item.kind, item.slug);
    }
    revalidatePath("/admin/products");
    revalidatePath("/admin");
  }

  return result;
}

export async function searchPromoTargetsAction(
  query?: string,
): Promise<AdminPromoTargetOption[] | { error: string }> {
  try {
    await assertAdmin();
  } catch (error) {
    return {
      error:
        error instanceof Error && error.message === "FORBIDDEN"
          ? "Нет прав администратора"
          : "Требуется вход",
    };
  }

  try {
    return await listAdminPromoTargets(query);
  } catch (loadError) {
    return {
      error: loadError instanceof Error ? loadError.message : "Не удалось загрузить материалы",
    };
  }
}
