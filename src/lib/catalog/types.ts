import type { Database } from "@/types/database.types";

export type CatalogItemKind = "section" | "material" | "task";

export type CatalogTag = {
  id: string;
  slug: string;
  name: string;
};

export type CatalogItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  kind: CatalogItemKind;
  priceKopecks: number;
  tags: CatalogTag[];
  coverPath?: string | null;
  sectionPosition?: number;
  materialCount?: number;
  averageRating?: number | null;
  reviewCount?: number | null;
  level?: Database["public"]["Enums"]["designer_level"];
  format?: Database["public"]["Enums"]["material_format"];
  sectionProductId?: string | null;
  aiReviewAvailable?: boolean;
  manualReviewAvailable?: boolean;
};

export type CatalogFilter = "all" | CatalogItemKind;

export type CatalogSortOption = "new" | "popular" | "price_asc" | "price_desc";

export type CatalogPriceFilter = "all" | "free" | "paid";

export type CatalogFiltersState = {
  query: string;
  format: Database["public"]["Enums"]["material_format"] | null;
  level: Database["public"]["Enums"]["designer_level"] | null;
  sectionProductId: string | null;
  price: CatalogPriceFilter;
  sort: CatalogSortOption;
};

export type TaskFiltersState = {
  query: string;
  level: Database["public"]["Enums"]["designer_level"] | null;
  price: CatalogPriceFilter;
  sort: CatalogSortOption;
};
