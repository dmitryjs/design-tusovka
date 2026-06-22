import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { createSupabaseAnonServerClient, createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

import { getReviewMutationMessage } from "./messages";
import type {
  ProductReviewStats,
  ProductReviewView,
  ProductReviewsData,
  ProductReviewsViewer,
  ReviewMutationCode,
  ReviewMutationResult,
} from "./types";

type RpcPayload = {
  ok?: boolean;
  code?: string;
  review_id?: string;
};

type ReviewRowPayload = {
  id: string;
  rating: number;
  body: string;
  created_at: string;
  updated_at: string;
  author_display_name: string;
  is_own: boolean;
};

function parseReviewMutationCode(value: string | undefined): ReviewMutationCode {
  switch (value) {
    case "saved":
    case "deleted":
    case "unauthenticated":
    case "invalid_rating":
    case "empty_body":
    case "body_too_long":
    case "not_entitled":
    case "not_found":
      return value;
    default:
      return "rpc_error";
  }
}

function mapRpcResult(
  data: RpcPayload | null,
  error: { message: string } | null,
): ReviewMutationResult {
  if (error) {
    const hint = error.message.includes("product_reviews")
      ? "Выполните supabase/cloud_patch_product_reviews.sql в Supabase SQL Editor."
      : getReviewMutationMessage("rpc_error");

    return { ok: false, code: "rpc_error", message: hint };
  }

  const code = parseReviewMutationCode(data?.code);
  const ok = Boolean(data?.ok) && code !== "rpc_error";

  return {
    ok,
    code,
    message: getReviewMutationMessage(code),
  };
}

function mapReviewRow(row: ReviewRowPayload): ProductReviewView {
  return {
    id: row.id,
    rating: row.rating,
    body: row.body,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    authorDisplayName: row.author_display_name,
    isOwn: row.is_own,
  };
}

export async function getProductReviewStats(
  productId: string,
): Promise<ProductReviewStats> {
  const supabase = createSupabaseAnonServerClient() as unknown as SupabaseClient<Database>;

  const { data, error } = await supabase.rpc("get_product_review_stats", {
    p_product_id: productId,
  });

  if (error || !data?.length) {
    return { averageRating: 0, reviewCount: 0 };
  }

  const row = data[0] as { average_rating: number | string; review_count: number | string };

  return {
    averageRating: Number(row.average_rating) || 0,
    reviewCount: Number(row.review_count) || 0,
  };
}

export async function getProductReviewsData(
  productId: string,
): Promise<ProductReviewsData> {
  const supabase = (await createSupabaseServerClient()) as unknown as SupabaseClient<Database>;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const anon = createSupabaseAnonServerClient() as unknown as SupabaseClient<Database>;

  const [statsResult, reviewsResult, canReviewResult] = await Promise.all([
    getProductReviewStats(productId),
    anon.rpc("list_product_reviews", { p_product_id: productId }),
    user
      ? supabase.rpc("can_review_product", { p_product_id: productId })
      : Promise.resolve({ data: false, error: null }),
  ]);

  const reviewsPayload = (reviewsResult.data ?? []) as ReviewRowPayload[];
  const reviews = reviewsPayload.map(mapReviewRow);
  const ownReview = reviews.find((review) => review.isOwn) ?? null;

  const viewer: ProductReviewsViewer = {
    isAuthenticated: Boolean(user),
    canReview: Boolean(canReviewResult.data),
    ownReview,
  };

  return {
    stats: statsResult,
    reviews,
    viewer,
  };
}

export async function upsertProductReview(
  productId: string,
  rating: number,
  body: string,
): Promise<ReviewMutationResult> {
  const supabase = (await createSupabaseServerClient()) as unknown as SupabaseClient<Database>;
  const { data, error } = await supabase.rpc("upsert_product_review", {
    p_product_id: productId,
    p_rating: rating,
    p_body: body,
  });

  return mapRpcResult(data as RpcPayload | null, error);
}

export async function deleteMyProductReview(
  productId: string,
): Promise<ReviewMutationResult> {
  const supabase = (await createSupabaseServerClient()) as unknown as SupabaseClient<Database>;
  const { data, error } = await supabase.rpc("delete_my_product_review", {
    p_product_id: productId,
  });

  return mapRpcResult(data as RpcPayload | null, error);
}
