import type { SupabaseClient } from "@supabase/supabase-js";

import { createSupabaseAnonServerClient, createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database, Json } from "@/types/database.types";

import { jsonbToParagraphs, jsonbToStringList } from "./content";
import { calculateSectionPriceKopecks } from "./section-pricing";
import {
  resolveSectionCatalogSlug,
  resolveSectionDisplayTitle,
  resolveSectionPageConfig,
} from "./section-pages";
import { getSectionCoverPath } from "./section-covers";
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
  contentJson: Json | null;
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
  coverPath: string | null;
  updatedAt: string | null;
  chapters: MaterialChapterView[];
  h1Headings: Array<{
    id: string;
    blockId: string;
    level: 1 | 2 | 3;
    title: string;
  }>;
  hasFullAccess: boolean;
  isPreview: boolean;
};

export type TaskAiCriterion = {
  id: string;
  title: string;
  description: string;
  position: number;
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
  manualReviewPriceKopecks: number | null;
  brief: string[];
  submissionRequirements: string[];
  aiCriteria: TaskAiCriterion[];
  hasFullAccess: boolean;
  isPreview: boolean;
  updatedAt: string | null;
};

export type SectionMaterialSummary = {
  id: string;
  slug: string;
  title: string;
  description: string;
  priceKopecks: number;
  format: Database["public"]["Enums"]["material_format"];
  level: Database["public"]["Enums"]["designer_level"];
  coverPath: string | null;
};

export type SectionStats = {
  materialCount: number;
  practiceCount: number;
  templateCount: number;
  guideCount: number;
};

export type SectionDetail = {
  id: string;
  pageSlug: string;
  catalogSlug: string;
  slug: string;
  title: string;
  description: string;
  priceKopecks: number;
  position: number;
  coverPath: string | null;
  forWhom: string[];
  whatYouGet: string[];
  materials: SectionMaterialSummary[];
  stats: SectionStats;
};

function queryErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Не удалось загрузить данные из Supabase";
}

export async function fetchTagsForProducts(
  supabase: SupabaseClient<Database>,
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
  options?: { includeChapterContent?: boolean },
): Promise<DetailQueryResult<MaterialDetail>> {
  const includeChapterContent = options?.includeChapterContent ?? false;
  try {
    const supabase = createSupabaseAnonServerClient();

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, slug, title, description, price_kopecks, cover_path, updated_at")
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
    let hasFullAccess = isFree;

    if (!isFree) {
      const authSupabase = (await createSupabaseServerClient()) as unknown as SupabaseClient<Database>;
      const {
        data: { user },
      } = await authSupabase.auth.getUser();

      if (user) {
        const { data: hasAccess } = await authSupabase.rpc("has_product_access", {
          product_id: product.id,
        });

        hasFullAccess = Boolean(hasAccess);
      }
    }

    let section: MaterialDetail["section"] = null;

    if (material.section_product_id) {
      const { data: sectionProduct } = await supabase
        .from("products")
        .select("slug, title")
        .eq("id", material.section_product_id)
        .eq("status", "published")
        .maybeSingle();

      if (sectionProduct) {
        const { count: sectionMaterialCount, error: sectionMaterialCountError } =
          await supabase
            .from("materials")
            .select("product_id, products!inner(status)", {
              count: "exact",
              head: true,
            })
            .eq("section_product_id", material.section_product_id)
            .eq("products.status", "published");

        if (sectionMaterialCountError) {
          return { data: null, error: sectionMaterialCountError.message };
        }

        if ((sectionMaterialCount ?? 0) > 0) {
          section = {
            slug: sectionProduct.slug,
            title: resolveSectionDisplayTitle(
              sectionProduct.slug,
              sectionProduct.title,
            ),
          };
        }
      }
    }

    const { data: h1Outline, error: h1OutlineError } = await supabase.rpc(
      "get_material_h1_outline",
      {
        p_material_product_id: product.id,
      },
    );

    if (h1OutlineError) {
      console.error("get_material_h1_outline failed:", h1OutlineError.message);
    }

    const h1Headings = (h1Outline ?? []).map((row) => ({
      id: row.anchor_id,
      blockId: row.anchor_id.replace(/^block-/, ""),
      level: (row.level === 2 ? 2 : row.level === 3 ? 3 : 1) as 1 | 2 | 3,
      title: row.title,
    }));

    const { data: toc, error: tocError } = await supabase.rpc("get_material_toc", {
      p_material_product_id: product.id,
    });

    if (tocError) {
      return { data: null, error: tocError.message };
    }

    const chapters: MaterialChapterView[] = [];
    const contentByChapterId = new Map<string, { text: string; json: Json }>();

    if (hasFullAccess && includeChapterContent) {
      const chaptersClient = isFree
        ? supabase
        : ((await createSupabaseServerClient()) as unknown as SupabaseClient<Database>);

      const { data: chapterRows, error: chaptersError } = await chaptersClient
        .from("material_chapters")
        .select("id, title, content, position")
        .eq("material_product_id", product.id)
        .order("position");

      if (chaptersError) {
        return { data: null, error: chaptersError.message };
      }

      for (const row of chapterRows ?? []) {
        contentByChapterId.set(row.id, {
          text: jsonbToParagraphs(row.content as Json),
          json: row.content as Json,
        });
      }
    }

    for (const row of toc ?? []) {
      const content = contentByChapterId.get(row.id);
      chapters.push({
        id: row.id,
        title: row.title,
        position: row.position,
        contentText: hasFullAccess && includeChapterContent ? (content?.text ?? null) : null,
        contentJson: hasFullAccess && includeChapterContent ? (content?.json ?? null) : null,
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
        coverPath: product.cover_path,
        updatedAt: product.updated_at,
        chapters,
        h1Headings,
        hasFullAccess,
        isPreview: !hasFullAccess,
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
      .select("id, slug, title, description, price_kopecks, updated_at")
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
        "product_id, level, ai_review_available, manual_review_available, manual_review_price_kopecks",
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
    let hasFullAccess = isFree;

    if (!isFree) {
      const authSupabase = (await createSupabaseServerClient()) as unknown as SupabaseClient<Database>;
      const {
        data: { user },
      } = await authSupabase.auth.getUser();

      if (user) {
        const { data: hasAccess } = await authSupabase.rpc("has_product_access", {
          product_id: product.id,
        });

        hasFullAccess = Boolean(hasAccess);
      }
    }

    let brief: string[] = [];
    let submissionRequirements: string[] = [];
    let aiCriteria: TaskAiCriterion[] = [];

    if (hasFullAccess) {
      const contentClient = isFree
        ? supabase
        : ((await createSupabaseServerClient()) as unknown as SupabaseClient<Database>);

      const { data: content, error: contentError } = await contentClient
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

      const { data: criteriaRows, error: criteriaError } = await contentClient
        .from("task_ai_criteria")
        .select("id, title, description, position")
        .eq("task_product_id", product.id)
        .order("position");

      if (criteriaError) {
        return { data: null, error: criteriaError.message };
      }

      aiCriteria = (criteriaRows ?? []).map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        position: row.position,
      }));
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
        manualReviewPriceKopecks: task.manual_review_price_kopecks,
        brief,
        submissionRequirements,
        aiCriteria,
        hasFullAccess,
        isPreview: !hasFullAccess,
        updatedAt: product.updated_at,
      },
      error: null,
    };
  } catch (error) {
    return { data: null, error: queryErrorMessage(error) };
  }
}

export async function getSectionBySlug(
  requestedSlug: string,
): Promise<DetailQueryResult<SectionDetail>> {
  try {
    const supabase = createSupabaseAnonServerClient();

    async function loadPublishedSection(slug: string) {
      const { data, error } = await supabase
        .from("products")
        .select("id, slug, title, description, price_kopecks, cover_path")
        .eq("kind", "section")
        .eq("status", "published")
        .eq("slug", slug)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data;
    }

    let product = await loadPublishedSection(requestedSlug);

    if (!product) {
      const legacyCatalogSlug = resolveSectionCatalogSlug(requestedSlug);
      if (legacyCatalogSlug !== requestedSlug) {
        product = await loadPublishedSection(legacyCatalogSlug);
      }
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
          cover_path,
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
          coverPath: productRow.cover_path,
        };
      })
      .filter((item): item is SectionMaterialSummary => item !== null)
      .sort((a, b) => a.title.localeCompare(b.title, "ru"));

    if (materials.length === 0) {
      return { data: null, error: null };
    }

    const pageConfig = resolveSectionPageConfig(product.slug, product.slug);
    const displayTitle = resolveSectionDisplayTitle(product.slug, product.title);
    const displayDescription = product.description || pageConfig?.heroDescription || "";
    const coverPath =
      product.cover_path ??
      pageConfig?.coverPath ??
      getSectionCoverPath(product.slug);
    const priceKopecks = calculateSectionPriceKopecks(materials);

    const stats: SectionStats = {
      materialCount: materials.length,
      practiceCount: materials.filter((item) => item.format === "practice").length,
      templateCount: materials.filter((item) => item.format === "template").length,
      guideCount: materials.filter(
        (item) => item.format === "mini_guide" || item.format === "full_guide",
      ).length,
    };

    return {
      data: {
        id: product.id,
        pageSlug: product.slug,
        catalogSlug: product.slug,
        slug: product.slug,
        title: displayTitle,
        description: displayDescription,
        priceKopecks,
        position: section.position,
        coverPath,
        forWhom: jsonbToStringList(section.for_whom as Json),
        whatYouGet: jsonbToStringList(section.what_you_get as Json),
        materials,
        stats,
      },
      error: null,
    };
  } catch (error) {
    return { data: null, error: queryErrorMessage(error) };
  }
}
