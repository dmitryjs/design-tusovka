import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

import type { CartItemView } from "./types";

type ServerSupabase = Awaited<ReturnType<typeof createSupabaseServerClient>>;

type CartRow = {
  id: string;
  created_at: string;
  products: {
    id: string;
    slug: string;
    title: string;
    kind: Database["public"]["Enums"]["product_kind"];
    price_kopecks: number;
    status: Database["public"]["Enums"]["product_status"];
  };
};

async function getClient(
  supabase?: ServerSupabase,
): Promise<SupabaseClient<Database>> {
  if (supabase) {
    return supabase as unknown as SupabaseClient<Database>;
  }

  return (await createSupabaseServerClient()) as unknown as SupabaseClient<Database>;
}

export async function getCart(
  supabase?: ServerSupabase,
): Promise<{ items: CartItemView[]; error: string | null }> {
  const client = await getClient(supabase);

  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return { items: [], error: "Требуется вход" };
  }

  const { data, error } = await client
    .from("cart_items")
    .select(
      `
      id,
      created_at,
      products!inner (
        id,
        slug,
        title,
        kind,
        price_kopecks,
        status
      )
    `,
    )
    .order("created_at", { ascending: true });

  if (error) {
    return { items: [], error: error.message };
  }

  const items: CartItemView[] = [];

  for (const row of (data as CartRow[] | null) ?? []) {
    const product = row.products;

    if (
      !product ||
      product.status !== "published" ||
      (product.kind !== "material" && product.kind !== "task") ||
      product.price_kopecks <= 0
    ) {
      continue;
    }

    items.push({
      id: row.id,
      productId: product.id,
      slug: product.slug,
      title: product.title,
      kind: product.kind,
      priceKopecks: product.price_kopecks,
      createdAt: row.created_at,
    });
  }

  return { items, error: null };
}

export async function getCartItemCount(
  supabase?: ServerSupabase,
): Promise<number> {
  const { items, error } = await getCart(supabase);
  if (error) {
    return 0;
  }
  return items.length;
}
