import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

import { getCartMutationMessage } from "./messages";
import type { CartMutationCode, CartMutationResult } from "./types";

type RpcPayload = {
  ok?: boolean;
  code?: string;
  order_id?: string;
  total_kopecks?: number;
};

async function getAuthedClient(): Promise<SupabaseClient<Database>> {
  return (await createSupabaseServerClient()) as unknown as SupabaseClient<Database>;
}

function parseCode(value: string | undefined): CartMutationCode {
  switch (value) {
    case "added":
    case "already_in_cart":
    case "removed":
    case "created":
    case "cancelled":
    case "deleted":
    case "unauthenticated":
    case "not_found":
    case "free_product":
    case "already_owned":
    case "unsupported_kind":
    case "empty_cart":
    case "product_unavailable":
    case "invalid_status":
    case "payment_in_progress":
      return value;
    default:
      return "rpc_error";
  }
}

function mapRpcResult(
  data: RpcPayload | null,
  error: { message: string; code?: string } | null,
): CartMutationResult {
  if (error) {
    const hint =
      error.message.includes("add_to_cart") ||
      error.message.includes("cart_items") ||
      error.code === "PGRST202"
        ? "Выполните supabase/cloud_patch_cart_orders.sql в Supabase SQL Editor."
        : getCartMutationMessage("rpc_error");

    return { ok: false, code: "rpc_error", message: hint };
  }

  const code = parseCode(data?.code);
  const ok = Boolean(data?.ok) && code !== "rpc_error";

  return {
    ok,
    code,
    message: getCartMutationMessage(code),
    orderId: data?.order_id,
    totalKopecks: data?.total_kopecks,
  };
}

export async function addToCart(productSlug: string): Promise<CartMutationResult> {
  const trimmed = productSlug.trim();

  if (!trimmed) {
    return {
      ok: false,
      code: "not_found",
      message: getCartMutationMessage("not_found"),
    };
  }

  const supabase = await getAuthedClient();
  const { data, error } = await supabase.rpc("add_to_cart", {
    p_slug: trimmed,
  });

  return mapRpcResult(data as RpcPayload | null, error);
}

export async function removeFromCart(
  cartItemId: string,
): Promise<CartMutationResult> {
  const supabase = await getAuthedClient();
  const { data, error } = await supabase.rpc("remove_from_cart", {
    p_cart_item_id: cartItemId,
  });

  return mapRpcResult(data as RpcPayload | null, error);
}

export async function createPendingOrderFromCart(): Promise<CartMutationResult> {
  const supabase = await getAuthedClient();
  const { data, error } = await supabase.rpc("create_pending_order_from_cart");

  return mapRpcResult(data as RpcPayload | null, error);
}

export async function cancelPendingOrder(orderId: string): Promise<CartMutationResult> {
  const trimmed = orderId.trim();

  if (!trimmed) {
    return {
      ok: false,
      code: "not_found",
      message: getCartMutationMessage("not_found"),
    };
  }

  const supabase = await getAuthedClient();
  const { data, error } = await supabase.rpc("cancel_pending_order", {
    p_order_id: trimmed,
  });

  return mapRpcResult(data as RpcPayload | null, error);
}

export async function deleteMyOrder(orderId: string): Promise<CartMutationResult> {
  const trimmed = orderId.trim();

  if (!trimmed) {
    return {
      ok: false,
      code: "not_found",
      message: getCartMutationMessage("not_found"),
    };
  }

  const supabase = await getAuthedClient();
  const { data, error } = await supabase.rpc("delete_my_order", {
    p_order_id: trimmed,
  });

  return mapRpcResult(data as RpcPayload | null, error);
}
