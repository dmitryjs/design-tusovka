import type { Database } from "@/types/database.types";

export type PaidProductCartState =
  | "hidden"
  | "guest"
  | "in_library"
  | "in_cart"
  | "available";

export type CartMutationCode =
  | "added"
  | "already_in_cart"
  | "removed"
  | "created"
  | "unauthenticated"
  | "not_found"
  | "free_product"
  | "already_owned"
  | "unsupported_kind"
  | "empty_cart"
  | "product_unavailable"
  | "rpc_error";

export type CartMutationResult = {
  ok: boolean;
  code: CartMutationCode;
  message?: string;
  orderId?: string;
  totalKopecks?: number;
};

export type CartItemView = {
  id: string;
  productId: string;
  slug: string;
  title: string;
  description: string;
  kind: "material" | "task" | "section";
  priceKopecks: number;
  createdAt: string;
  coverPath: string | null;
  materialFormat?: Database["public"]["Enums"]["material_format"];
  taskLevel?: Database["public"]["Enums"]["designer_level"];
};

export type OrderItemView = {
  id: string;
  productId: string;
  title: string;
  priceKopecks: number;
  slug?: string;
  kind?: "material" | "task";
};

export type OrderView = {
  id: string;
  status: string;
  totalKopecks: number;
  createdAt: string;
  items: OrderItemView[];
};
