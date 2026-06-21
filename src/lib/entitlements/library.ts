import "server-only";

import type { Database } from "@/types/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import type { LibraryItem } from "./types";

type ServerSupabase = Awaited<ReturnType<typeof createSupabaseServerClient>>;

type EntitlementRow = {
  granted_at: string;
  products: {
    id: string;
    slug: string;
    title: string;
    description: string;
    cover_path: string | null;
    kind: Database["public"]["Enums"]["product_kind"];
    price_kopecks: number;
    status: Database["public"]["Enums"]["product_status"];
    materials:
      | {
          format: Database["public"]["Enums"]["material_format"];
          level: Database["public"]["Enums"]["designer_level"];
        }
      | {
          format: Database["public"]["Enums"]["material_format"];
          level: Database["public"]["Enums"]["designer_level"];
        }[]
      | null;
    tasks:
      | {
          level: Database["public"]["Enums"]["designer_level"];
        }
      | {
          level: Database["public"]["Enums"]["designer_level"];
        }[]
      | null;
  };
};

function firstOrNull<T>(value: T | T[] | null | undefined): T | null {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export async function getUserLibrary(
  supabase: ServerSupabase,
): Promise<{ items: LibraryItem[]; error: string | null }> {
  const { data, error } = await supabase
    .from("entitlements")
    .select(
      `
      granted_at,
      products!inner (
        id,
        slug,
        title,
        description,
        cover_path,
        kind,
        price_kopecks,
        status,
        materials ( format, level ),
        tasks ( level )
      )
    `,
    )
    .is("revoked_at", null)
    .order("granted_at", { ascending: false });

  if (error) {
    return { items: [], error: error.message };
  }

  const items: LibraryItem[] = [];

  for (const row of (data as EntitlementRow[] | null) ?? []) {
    const product = row.products;

    if (
      !product ||
      product.status !== "published" ||
      (product.kind !== "material" && product.kind !== "task")
    ) {
      continue;
    }

    const material = firstOrNull(product.materials);
    const task = firstOrNull(product.tasks);

    items.push({
      productId: product.id,
      slug: product.slug,
      title: product.title,
      description: product.description,
      kind: product.kind,
      priceKopecks: product.price_kopecks,
      level: material?.level ?? task?.level ?? "all",
      format: material?.format,
      coverPath: product.cover_path,
      grantedAt: row.granted_at,
    });
  }

  return { items, error: null };
}
