import { createSupabaseAnonServerClient } from "@/lib/supabase/server";
import type { Database, Json } from "@/types/database.types";

import { jsonbToParagraphs, jsonbToStringList } from "./content";
import type { CatalogTag } from "./types";

export type DetailQueryResult<T> = {
  data: T | null;
  error: string | null;
};

export type MaterialChapterView = {
  id: string;
  title: string;
  position: number;
  contentText: string | null;
};

export type MaterialDetail = {
  id: string;
  slug: string;
  title: string;
  description: string;
  priceKopecks: number;
  format: Database["public"]["Enums"]["material_format"];
  level: Database["public"]["Enums"]["designer_level"];
  tags: CatalogTag[];
  section: { slug: string; title: string } | null;
  chapters: MaterialChapterView[];
  isPreview: boolean;
};

export type TaskDetail = {
  id: string;
  slug: string;
  title: string;
  description: string;
  priceKopecks: number;
  level: Database["public"]["Enums"]["designer_level"];
  tags: CatalogTag[];
  aiReviewAvailable: boolean;
  manualReviewAvailable: boolean;
  brief: string[];
  submissionRequirements: string[];
  isPreview: boolean;
};

export type SectionMaterialSummary = {
  id: string;
  slug: string;
  title: string;
  description: string;
  priceKopecks: number;
  format: Database["public"]["Enums"]["material_format"];
  level: Database["public"]["Enums"]["designer_level"];
};

export type SectionDetail = {
  id: string;
  slug: string;
  title: string;
  description: string;
  priceKopecks: number;
  position: number;
  forWhom: string[];
  whatYouGet: string[];
  materials: SectionMaterialSummary[];
};

function queryErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Не удалось загрузить данные из Supabase";
}

export async function fetchTagsForProducts(
  supabase: ReturnType<typeof createSupabaseAnonServerClient>,
  productIds: string[],
): Promise<Map<string, CatalogTag[]>> {
  if (!productIds.length) {
    return new Map();
  }

  const { data, error } = await supabase
    .from("product_tags")
    .select("product_id, tags ( id, slug, name )")
    .in("product_id", productIds);

  if (error) {
    throw new Error(error.message);
  }

  const map = new Map<string, CatalogTag[]>();

  for (const row of data ?? []) {
    if (!row.tags) {
      continue;
    }

    const tags = Array.isArray(row.tags) ? row.tags : [row.tags];
    map.set(row.product_id, tags as CatalogTag[]);
  }

  return map;
}

export async function getMaterialBySlug(
  slug: string,
): Promise<DetailQueryResult<MaterialDetail>> {
  try {
    const supabase = createSupabaseAnonServerClient();

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, slug, title, description, price_kopecks")
      .eq("slug", slug)
      .eq("kind", "material")
      .eq("status", "published")
      .maybeSingle();

    if (productError) {
      return { data: null, error: productError.message };
    }

    if (!product) {
      return { data: null, error: null };
    }

    const { data: material, error: materialError } = await supabase
      .from("materials")
      .select("product_id, format, level, section_product_id")
      .eq("product_id", product.id)
      .maybeSingle();

    if (materialError) {
      return { data: null, error: materialError.message };
    }

    if (!material) {
      return { data: null, error: null };
    }

    const tagsMap = await fetchTagsForProducts(supabase, [product.id]);
    const isFree = product.price_kopecks === 0;

    let section: MaterialDetail["section"] = null;

    if (material.section_product_id) {
      const { data: sectionProduct } = await supabase
        .from("products")
        .select("slug, title")
        .eq("id", material.section_product_id)
        .eq("status", "published")
        .maybeSingle();

      if (sectionProduct) {
        section = {
          slug: sectionProduct.slug,
          title: sectionProduct.title,
        };
      }
    }

    const { data: toc, error: tocError } = await supabase.rpc("get_material_toc", {
      p_material_product_id: product.id,
    });

    if (tocError) {
      return { data: null, error: tocError.message };
    }

    const chapters: MaterialChapterView[] = [];
    const contentByChapterId = new Map<string, string>();

    if (isFree) {
      const { data: chapterRows, error: chaptersError } = await supabase
        .from("material_chapters")
        .select("id, title, content, position")
        .eq("material_product_id", product.id)
        .order("position");

      if (chaptersError) {
        return { data: null, error: chaptersError.message };
      }

      for (const row of chapterRows ?? []) {
        contentByChapterId.set(row.id, jsonbToParagraphs(row.content as Json));
      }
    }

    for (const row of toc ?? []) {
      chapters.push({
        id: row.id,
        title: row.title,
        position: row.position,
        contentText: isFree ? (contentByChapterId.get(row.id) ?? null) : null,
      });
    }

    return {
      data: {
        id: product.id,
        slug: product.slug,
        title: product.title,
        description: product.description,
        priceKopecks: product.price_kopecks,
        format: material.format,
        level: material.level,
        tags: tagsMap.get(product.id) ?? [],
        section,
        chapters,
        isPreview: !isFree,
      },
      error: null,
    };
  } catch (error) {
    return { data: null, error: queryErrorMessage(error) };
  }
}

export async function getTaskBySlug(
  slug: string,
): Promise<DetailQueryResult<TaskDetail>> {
  try {
    const supabase = createSupabaseAnonServerClient();

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, slug, title, description, price_kopecks")
      .eq("slug", slug)
      .eq("kind", "task")
      .eq("status", "published")
      .maybeSingle();

    if (productError) {
      return { data: null, error: productError.message };
    }

    if (!product) {
      return { data: null, error: null };
    }

    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select(
        "product_id, level, ai_review_available, manual_review_available",
      )
      .eq("product_id", product.id)
      .maybeSingle();

    if (taskError) {
      return { data: null, error: taskError.message };
    }

    if (!task) {
      return { data: null, error: null };
    }

    const tagsMap = await fetchTagsForProducts(supabase, [product.id]);
    const isFree = product.price_kopecks === 0;

    let brief: string[] = [];
    let submissionRequirements: string[] = [];

    if (isFree) {
      const { data: content, error: contentError } = await supabase
        .from("task_content")
        .select("brief, submission_requirements")
        .eq("task_product_id", product.id)
        .maybeSingle();

      if (contentError) {
        return { data: null, error: contentError.message };
      }

      if (content) {
        brief = jsonbToStringList(content.brief as Json);
        submissionRequirements = jsonbToStringList(
          content.submission_requirements as Json,
        );
      }
    }

    return {
      data: {
        id: product.id,
        slug: product.slug,
        title: product.title,
        description: product.description,
        priceKopecks: product.price_kopecks,
        level: task.level,
        tags: tagsMap.get(product.id) ?? [],
        aiReviewAvailable: task.ai_review_available,
        manualReviewAvailable: task.manual_review_available,
        brief,
        submissionRequirements,
        isPreview: !isFree,
      },
      error: null,
    };
  } catch (error) {
    return { data: null, error: queryErrorMessage(error) };
  }
}

export async function getSectionBySlug(
  slug: string,
): Promise<DetailQueryResult<SectionDetail>> {
  try {
    const supabase = createSupabaseAnonServerClient();

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, slug, title, description, price_kopecks")
      .eq("slug", slug)
      .eq("kind", "section")
      .eq("status", "published")
      .maybeSingle();

    if (productError) {
      return { data: null, error: productError.message };
    }

    if (!product) {
      return { data: null, error: null };
    }

    const { data: section, error: sectionError } = await supabase
      .from("sections")
      .select("product_id, position, what_you_get, for_whom")
      .eq("product_id", product.id)
      .maybeSingle();

    if (sectionError) {
      return { data: null, error: sectionError.message };
    }

    if (!section) {
      return { data: null, error: null };
    }

    const { data: materialRows, error: materialsError } = await supabase
      .from("materials")
      .select(
        `
        product_id,
        format,
        level,
        products!inner (
          id,
          slug,
          title,
          description,
          price_kopecks,
          status,
          kind
        )
      `,
      )
      .eq("section_product_id", product.id)
      .eq("products.status", "published");

    if (materialsError) {
      return { data: null, error: materialsError.message };
    }

    const materials: SectionMaterialSummary[] = (materialRows ?? [])
      .map((row) => {
        const linked = row.products;
        const productRow = Array.isArray(linked) ? linked[0] : linked;

        if (!productRow) {
          return null;
        }

        return {
          id: productRow.id,
          slug: productRow.slug,
          title: productRow.title,
          description: productRow.description,
          priceKopecks: productRow.price_kopecks,
          format: row.format,
          level: row.level,
        };
      })
      .filter((item): item is SectionMaterialSummary => item !== null)
      .sort((a, b) => a.title.localeCompare(b.title, "ru"));

    return {
      data: {
        id: product.id,
        slug: product.slug,
        title: product.title,
        description: product.description,
        priceKopecks: product.price_kopecks,
        position: section.position,
        forWhom: jsonbToStringList(section.for_whom as Json),
        whatYouGet: jsonbToStringList(section.what_you_get as Json),
        materials,
      },
      error: null,
    };
  } catch (error) {
    return { data: null, error: queryErrorMessage(error) };
  }
}
