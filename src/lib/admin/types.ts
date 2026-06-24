import type { Database } from "@/types/database.types";
import type { MaterialBlock } from "@/lib/content/material-blocks";

export type ProductKind = Extract<
  Database["public"]["Enums"]["product_kind"],
  "material" | "task"
>;

export type AdminChapterInput = {
  id?: string;
  title: string;
  contentText: string;
  position: number;
};

export type AdminProductFormInput = {
  title: string;
  slug: string;
  description: string;
  kind: ProductKind;
  level: Database["public"]["Enums"]["designer_level"];
  format?: Database["public"]["Enums"]["material_format"];
  priceRubles: number;
  status: Database["public"]["Enums"]["product_status"];
  sectionProductId?: string;
  coverPath?: string | null;
  tagIds: string[];
  chapters: AdminChapterInput[];
  contentBlocks: MaterialBlock[];
  taskBriefText: string;
  taskSubmissionText: string;
};

export type AdminProductListItem = {
  id: string;
  title: string;
  slug: string;
  kind: Database["public"]["Enums"]["product_kind"];
  status: Database["public"]["Enums"]["product_status"];
  priceKopecks: number;
  level: Database["public"]["Enums"]["designer_level"] | null;
  coverPath: string | null;
  materialFormat: Database["public"]["Enums"]["material_format"] | null;
};

export type AdminProductDetail = AdminProductFormInput & {
  id: string;
  priceKopecks: number;
};

export type AdminSectionFormInput = {
  title: string;
  slug: string;
  description: string;
  status: Database["public"]["Enums"]["product_status"];
  position: number;
  coverPath: string | null;
};

export type AdminSectionListItem = AdminSectionFormInput & {
  id: string;
};

export type AdminTagFormInput = {
  name: string;
  slug: string;
};

export type AdminTagListItem = AdminTagFormInput & {
  id: string;
};

export type AdminMutationResult<T = string> = {
  ok: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string>;
};
