"use server";

import { revalidatePath } from "next/cache";

import {
  addToCart,
  createPendingOrderFromCart,
  removeFromCart,
} from "@/lib/cart/mutations";
import type { CartMutationResult } from "@/lib/cart/types";
import { getCatalogItemHref } from "@/lib/catalog/paths";

function revalidateCartPaths(kind?: "material" | "task", slug?: string) {
  revalidatePath("/cart");
  revalidatePath("/checkout");
  revalidatePath("/checkout/payment");
  revalidatePath("/profile");
  revalidatePath("/profile/orders");
  if (kind && slug) {
    revalidatePath(getCatalogItemHref(kind, slug));
  }
}

export async function addToCartAction(
  slug: string,
  kind: "material" | "task",
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
