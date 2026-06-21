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
    description: string;
    kind: Database["public"]["Enums"]["product_kind"];
    price_kopecks: number;
    status: Database["public"]["Enums"]["product_status"];
    cover_path: string | null;
    materials:
      | { format: Database["public"]["Enums"]["material_format"] }
      | { format: Database["public"]["Enums"]["material_format"] }[]
      | null;
    tasks:
      | { level: Database["public"]["Enums"]["designer_level"] }
      | { level: Database["public"]["Enums"]["designer_level"] }[]
      | null;
  };
};

function firstOrNull<T>(value: T | T[] | null | undefined): T | null {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? (value[0] ?? null) : value;
}

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
        description,
        kind,
        price_kopecks,
        status,
        cover_path,
        materials ( format ),
        tasks ( level )
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

    const material = firstOrNull(product.materials);
    const task = firstOrNull(product.tasks);

    items.push({
      id: row.id,
      productId: product.id,
      slug: product.slug,
      title: product.title,
      description: product.description,
      kind: product.kind,
      priceKopecks: product.price_kopecks,
      createdAt: row.created_at,
      coverPath: product.cover_path,
      materialFormat: material?.format,
      taskLevel: task?.level,
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
