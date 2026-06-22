import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database.types";

import { buildUserEmailMap } from "./users";

export type AdminReviewListItem = {
  id: string;
  rating: number;
  body: string;
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  userEmail: string;
  userDisplayName: string | null;
  productId: string;
  productTitle: string;
  productSlug: string;
  productKind: Database["public"]["Enums"]["product_kind"];
};

export async function listAdminReviews(): Promise<AdminReviewListItem[]> {
  const admin = createSupabaseAdminClient();

  const [{ data, error }, emailMap, { data: profileRows }] = await Promise.all([
    admin
      .from("product_reviews")
      .select(
        `
        id,
        rating,
        body,
        is_hidden,
        created_at,
        updated_at,
        user_id,
        product_id,
        products!inner ( title, slug, kind )
      `,
      )
      .order("created_at", { ascending: false }),
    buildUserEmailMap(admin),
    admin.from("profiles").select("id, display_name"),
  ]);

  if (error) {
    throw new Error(error.message);
  }

  type ReviewRow = {
    id: string;
    rating: number;
    body: string;
    is_hidden: boolean;
    created_at: string;
    updated_at: string;
    user_id: string;
    product_id: string;
    products: { title: string; slug: string; kind: Database["public"]["Enums"]["product_kind"] };
  };

  const displayNameMap = new Map(
    (profileRows ?? []).map((profile) => [profile.id, profile.display_name]),
  );

  return ((data as ReviewRow[] | null) ?? []).map((row) => ({
    id: row.id,
    rating: row.rating,
    body: row.body,
    isHidden: row.is_hidden,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    userId: row.user_id,
    userEmail: emailMap.get(row.user_id) ?? "—",
    userDisplayName: displayNameMap.get(row.user_id) ?? null,
    productId: row.product_id,
    productTitle: row.products.title,
    productSlug: row.products.slug,
    productKind: row.products.kind,
  }));
}

export async function setReviewHidden(reviewId: string, hidden: boolean): Promise<void> {
  const admin = createSupabaseAdminClient();

  const { error } = await admin
    .from("product_reviews")
    .update({ is_hidden: hidden })
    .eq("id", reviewId);

  if (error) {
    throw new Error(error.message);
  }
}
