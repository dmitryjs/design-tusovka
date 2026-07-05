"use server";

import { revalidatePath } from "next/cache";

import {
  deleteMyProductReview,
  upsertProductReview,
} from "@/lib/reviews/queries";
import type { ReviewMutationResult } from "@/lib/reviews/types";
import { getCatalogItemHref } from "@/lib/catalog/paths";

function revalidateProductPaths(
  productId: string,
  kind: "material" | "task" | "section",
  slug: string,
) {
  revalidatePath(getCatalogItemHref(kind, slug));
  revalidatePath("/");
  revalidatePath("/tasks");
  revalidatePath("/");
}

export async function submitProductReviewAction(
  productId: string,
  kind: "material" | "task" | "section",
  slug: string,
  rating: number,
  body: string,
): Promise<ReviewMutationResult> {
  const result = await upsertProductReview(productId, rating, body);

  if (result.ok) {
    revalidateProductPaths(productId, kind, slug);
  }

  return result;
}

export async function deleteProductReviewAction(
  productId: string,
  kind: "material" | "task" | "section",
  slug: string,
): Promise<ReviewMutationResult> {
  const result = await deleteMyProductReview(productId);

  if (result.ok) {
    revalidateProductPaths(productId, kind, slug);
  }

  return result;
}
