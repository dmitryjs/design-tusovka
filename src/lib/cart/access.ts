import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

import type { PaidProductCartState } from "./types";

async function getAuthedClient(): Promise<SupabaseClient<Database>> {
  return (await createSupabaseServerClient()) as unknown as SupabaseClient<Database>;
}

export async function getPaidProductCartState(
  productId: string,
  priceKopecks: number,
): Promise<PaidProductCartState> {
  if (priceKopecks <= 0) {
    return "hidden";
  }

  const supabase = await getAuthedClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return "guest";
  }

  const { data: hasAccess } = await supabase.rpc("has_product_access", {
    product_id: productId,
  });

  if (hasAccess) {
    return "in_library";
  }

  const { data: cartRow } = await supabase
    .from("cart_items")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  if (cartRow) {
    return "in_cart";
  }

  return "available";
}
