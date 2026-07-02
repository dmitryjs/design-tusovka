"use server";

import { revalidatePath } from "next/cache";

import {
  addToCart,
  cancelPendingOrder,
  createPendingOrderFromCart,
  deleteMyOrder,
  removeFromCart,
} from "@/lib/cart/mutations";
import type { CartMutationResult } from "@/lib/cart/types";
import { getCatalogItemHref } from "@/lib/catalog/paths";
import { getPreferredSectionPageHref } from "@/lib/catalog/section-pages";

function revalidateCartPaths(
  kind?: "material" | "task" | "section",
  slug?: string,
) {
  revalidatePath("/cart");
  revalidatePath("/checkout");
  revalidatePath("/checkout/payment");
  revalidatePath("/profile");
  revalidatePath("/profile/orders");
  if (kind && slug) {
    if (kind === "section") {
      revalidatePath(getPreferredSectionPageHref(slug));
      revalidatePath(getCatalogItemHref("section", slug));
    } else {
      revalidatePath(getCatalogItemHref(kind, slug));
    }
  }
}

export async function addToCartAction(
  slug: string,
  kind: "material" | "task" | "section",
): Promise<CartMutationResult> {
  const result = await addToCart(slug);

  if (result.ok) {
    revalidateCartPaths(kind, slug);
  }

  return result;
}

export async function removeFromCartAction(
  cartItemId: string,
): Promise<CartMutationResult> {
  const result = await removeFromCart(cartItemId);

  if (result.ok) {
    revalidateCartPaths();
  }

  return result;
}

export async function createPendingOrderAction(): Promise<CartMutationResult> {
  const result = await createPendingOrderFromCart();

  if (result.ok) {
    revalidateCartPaths();
  }

  return result;
}

export async function cancelPendingOrderAction(
  orderId: string,
): Promise<CartMutationResult> {
  const result = await cancelPendingOrder(orderId);

  if (result.ok) {
    revalidateCartPaths();
  }

  return result;
}

export async function deleteMyOrderAction(orderId: string): Promise<CartMutationResult> {
  const result = await deleteMyOrder(orderId);

  if (result.ok) {
    revalidateCartPaths();
  }

  return result;
}
