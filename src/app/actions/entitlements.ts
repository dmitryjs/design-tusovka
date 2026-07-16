"use server";

import { revalidatePath } from "next/cache";

import { claimFreeProduct } from "@/lib/entitlements/claim-free-product";
import type { ClaimFreeProductResult } from "@/lib/entitlements/types";
import { getCatalogItemHref } from "@/lib/catalog/paths";

export async function claimFreeProductAction(
  slug: string,
  kind: "material" | "task" | "section",
): Promise<ClaimFreeProductResult> {
  const result = await claimFreeProduct(slug);

  if (result.ok) {
    revalidatePath(getCatalogItemHref(kind, slug));
    revalidatePath("/profile");
    revalidatePath("/profile/library");
  }

  return result;
}
