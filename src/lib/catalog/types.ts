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
  aiReviewAvailable?: boolean;
  manualReviewAvailable?: boolean;
};

export type CatalogFilter = "all" | CatalogItemKind;
