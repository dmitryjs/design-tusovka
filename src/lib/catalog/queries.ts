import { createSupabaseServerClient } from "@/lib/supabase/server";

import type { CatalogItem, CatalogItemKind, CatalogTag } from "./types";

type CatalogQueryResult = {
  items: CatalogItem[];
  error: string | null;
};

const CATALOG_KINDS: CatalogItemKind[] = ["section", "material", "task"];

const KIND_SORT_ORDER: Record<CatalogItemKind, number> = {
  section: 0,
  material: 1,
  task: 2,
};

function sortCatalogItems(items: CatalogItem[]): CatalogItem[] {
  return [...items].sort((a, b) => {
    const byKind = KIND_SORT_ORDER[a.kind] - KIND_SORT_ORDER[b.kind];
    if (byKind !== 0) {
      return byKind;
    }

    if (a.kind === "section" && b.kind === "section") {
      return (a.sectionPosition ?? 0) - (b.sectionPosition ?? 0);
    }

    return a.title.localeCompare(b.title, "ru");
  });
}

function buildTagsByProductId(
  productTags: Array<{
    product_id: string;
    tags: CatalogTag | CatalogTag[] | null;
  }>,
): Map<string, CatalogTag[]> {
  const map = new Map<string, CatalogTag[]>();

  for (const row of productTags) {
    if (!row.tags) {
      continue;
    }

    const tags = Array.isArray(row.tags) ? row.tags : [row.tags];
    map.set(row.product_id, tags);
  }

  return map;
}

export async function getCatalogItems(): Promise<CatalogQueryResult> {
  try {
    const supabase = createSupabaseServerClient();

    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, kind, slug, title, description, price_kopecks")
      .eq("status", "published")
      .in("kind", CATALOG_KINDS);

    if (productsError) {
      return { items: [], error: productsError.message };
    }

    if (!products?.length) {
      return { items: [], error: null };
    }

    const productIds = products.map((product) => product.id);
    const sectionIds = products
      .filter((product) => product.kind === "section")
      .map((product) => product.id);
    const materialIds = products
      .filter((product) => product.kind === "material")
      .map((product) => product.id);
    const taskIds = products
      .filter((product) => product.kind === "task")
      .map((product) => product.id);

    const [sectionsResult, materialsResult, tasksResult, tagsResult] =
      await Promise.all([
        sectionIds.length
          ? supabase
              .from("sections")
              .select("product_id, position")
              .in("product_id", sectionIds)
          : Promise.resolve({ data: [], error: null }),
        materialIds.length
          ? supabase
              .from("materials")
              .select("product_id, format, level, section_product_id")
              .in("product_id", materialIds)
          : Promise.resolve({ data: [], error: null }),
        taskIds.length
          ? supabase
              .from("tasks")
              .select(
                "product_id, level, ai_review_available, manual_review_available",
              )
              .in("product_id", taskIds)
          : Promise.resolve({ data: [], error: null }),
        supabase
          .from("product_tags")
          .select("product_id, tags ( id, slug, name )")
          .in("product_id", productIds),
      ]);

    const relatedError =
      sectionsResult.error ??
      materialsResult.error ??
      tasksResult.error ??
      tagsResult.error;

    if (relatedError) {
      return { items: [], error: relatedError.message };
    }

    const sectionsById = new Map(
      (sectionsResult.data ?? []).map((section) => [section.product_id, section]),
    );
    const materialsById = new Map(
      (materialsResult.data ?? []).map((material) => [
        material.product_id,
        material,
      ]),
    );
    const tasksById = new Map(
      (tasksResult.data ?? []).map((task) => [task.product_id, task]),
    );
    const tagsByProductId = buildTagsByProductId(tagsResult.data ?? []);

    const items: CatalogItem[] = [];

    for (const product of products) {
      const kind = product.kind as CatalogItemKind;
      const base: CatalogItem = {
        id: product.id,
        slug: product.slug,
        title: product.title,
        description: product.description,
        kind,
        priceKopecks: product.price_kopecks,
        tags: tagsByProductId.get(product.id) ?? [],
      };

      if (kind === "section") {
        const section = sectionsById.get(product.id);
        items.push({
          ...base,
          sectionPosition: section?.position ?? 0,
        });
        continue;
      }

      if (kind === "material") {
        const material = materialsById.get(product.id);
        if (!material) {
          continue;
        }

        items.push({
          ...base,
          level: material.level,
          format: material.format,
        });
        continue;
      }

      const task = tasksById.get(product.id);
      if (!task) {
        continue;
      }

      items.push({
        ...base,
        level: task.level,
        aiReviewAvailable: task.ai_review_available,
        manualReviewAvailable: task.manual_review_available,
      });
    }

    return { items: sortCatalogItems(items), error: null };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Не удалось загрузить каталог из Supabase";

    return { items: [], error: message };
  }
}
