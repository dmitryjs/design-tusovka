import type { Database } from "@/types/database.types";

export type FreeProductClaimState = "hidden" | "guest" | "available" | "claimed";

export type ClaimFreeProductCode =
  | "claimed"
  | "already_claimed"
  | "unauthenticated"
  | "not_found"
  | "not_free"
  | "unsupported_kind"
  | "rpc_error";

export type ClaimFreeProductResult = {
  ok: boolean;
  code: ClaimFreeProductCode;
  productId?: string;
  slug?: string;
  message?: string;
};

export type LibraryItem = {
  productId: string;
  slug: string;
  title: string;
  description: string;
  kind: "material" | "task";
  priceKopecks: number;
  level: Database["public"]["Enums"]["designer_level"];
  format?: Database["public"]["Enums"]["material_format"];
  coverPath?: string | null;
  averageRating?: number | null;
  reviewCount?: number | null;
  grantedAt: string;
};
