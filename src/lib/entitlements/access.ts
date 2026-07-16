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

/** Free section: claimed when section or all its free materials are in library. */
export async function getFreeSectionClaimState(
  sectionProductId: string,
  priceKopecks: number,
  materialIds: readonly string[],
): Promise<FreeProductClaimState> {
  if (priceKopecks !== 0) {
    return "hidden";
  }

  const sectionState = await getFreeProductClaimState(sectionProductId, priceKopecks);

  if (sectionState !== "available") {
    return sectionState;
  }

  if (materialIds.length === 0) {
    return "available";
  }

  const supabase = await getAuthedClient();
  const accessFlags = await Promise.all(
    materialIds.map(async (materialId) => {
      const { data: hasAccess } = await supabase.rpc("has_product_access", {
        product_id: materialId,
      });
      return Boolean(hasAccess);
    }),
  );

  return accessFlags.every(Boolean) ? "claimed" : "available";
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
