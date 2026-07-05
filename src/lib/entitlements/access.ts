import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

import type { FreeProductClaimState } from "./types";

async function getAuthedClient(): Promise<SupabaseClient<Database>> {
  return (await createSupabaseServerClient()) as unknown as SupabaseClient<Database>;
}

export async function getFreeProductClaimState(
  productId: string,
  priceKopecks: number,
): Promise<FreeProductClaimState> {
  if (priceKopecks !== 0) {
    return "hidden";
  }

  const supabase = await getAuthedClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return "guest";
  }

  const { data: hasAccess, error } = await supabase.rpc("has_product_access", {
    product_id: productId,
  });

  if (error) {
    return "available";
  }

  return hasAccess ? "claimed" : "available";
}

export async function hasProductAccess(productId: string): Promise<boolean> {
  const supabase = await getAuthedClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const { data: hasAccess, error } = await supabase.rpc("has_product_access", {
    product_id: productId,
  });

  if (error) {
    return false;
  }

  return Boolean(hasAccess);
}
