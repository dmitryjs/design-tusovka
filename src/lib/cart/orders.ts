import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

import type { OrderItemView, OrderView } from "./types";

type ServerSupabase = Awaited<ReturnType<typeof createSupabaseServerClient>>;

type OrderRow = {
  id: string;
  status: Database["public"]["Enums"]["order_status"];
  total_kopecks: number;
  created_at: string;
  order_items: Array<{
    id: string;
    product_id: string;
    title: string;
    price_kopecks: number;
    products: {
      slug: string;
      kind: Database["public"]["Enums"]["product_kind"];
    } | null;
  }>;
};

async function getClient(
  supabase?: ServerSupabase,
): Promise<SupabaseClient<Database>> {
  if (supabase) {
    return supabase as unknown as SupabaseClient<Database>;
  }

  return (await createSupabaseServerClient()) as unknown as SupabaseClient<Database>;
}

export async function getUserOrders(
  supabase?: ServerSupabase,
): Promise<{ orders: OrderView[]; error: string | null }> {
  const client = await getClient(supabase);

  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return { orders: [], error: "Требуется вход" };
  }

  const { data, error } = await client
    .from("orders")
    .select(
      `
      id,
      status,
      total_kopecks,
      created_at,
      order_items (
        id,
        product_id,
        title,
        price_kopecks,
        products ( slug, kind )
      )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    return { orders: [], error: error.message };
  }

  const orders: OrderView[] = (data as OrderRow[] | null ?? []).map((order) => ({
    id: order.id,
    status: order.status,
    totalKopecks: order.total_kopecks,
    createdAt: order.created_at,
    items: (order.order_items ?? []).map((item): OrderItemView => {
      const product = Array.isArray(item.products)
        ? item.products[0]
        : item.products;

      return {
        id: item.id,
        productId: item.product_id,
        title: item.title,
        priceKopecks: item.price_kopecks,
        slug: product?.slug,
        kind:
          product?.kind === "material" || product?.kind === "task"
            ? product.kind
            : undefined,
      };
    }),
  }));

  return { orders, error: null };
}
