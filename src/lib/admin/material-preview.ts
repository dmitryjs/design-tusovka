import type { Json } from "@/types/database.types";

import type { MaterialDetail } from "@/lib/catalog/detail-queries";
import { extractHeadingAnchors } from "@/lib/content/material-reading";
import { isPersistableMaterialBlock } from "@/lib/content/material-blocks";
import type { CatalogTag } from "@/lib/catalog/types";
import type { AdminProductFormInput } from "@/lib/admin/types";

type SelectOption = { value: string; label: string };

function resolveTags(form: AdminProductFormInput, tagOptions: SelectOption[]): CatalogTag[] {
  return form.tagIds
    .map((tagId) => {
      const option = tagOptions.find((tag) => tag.value === tagId);
      if (!option) {
        return null;
      }

      return {
        id: option.value,
        slug: option.value,
        name: option.label,
      };
    })
    .filter((tag): tag is CatalogTag => tag !== null);
}

function resolveSection(
  form: AdminProductFormInput,
  sectionOptions: SelectOption[],
): MaterialDetail["section"] {
  if (!form.sectionProductId) {
    return null;
  }

  const section = sectionOptions.find((option) => option.value === form.sectionProductId);
  if (!section) {
    return null;
  }

  return {
    slug: section.value,
    title: section.label,
  };
}

function filterContentBlocks(form: AdminProductFormInput) {
  return form.contentBlocks.filter(isPersistableMaterialBlock);
}

export function buildAdminMaterialPreviewDetail(
  form: AdminProductFormInput,
  options: {
    productId?: string;
    tags: SelectOption[];
    sections: SelectOption[];
  },
): MaterialDetail {
  const priceKopecks = Math.round(form.priceRubles * 100);
  const contentBlocks = filterContentBlocks(form);
  const h1Headings = extractHeadingAnchors(contentBlocks);

  return {
    id: options.productId ?? "preview",
    slug: form.slug.trim() || "preview",
    title: form.title.trim() || "Без названия",
    description: form.description.trim(),
    priceKopecks,
    format: form.format ?? "mini_guide",
    level: form.level,
    tags: resolveTags(form, options.tags),
    section: resolveSection(form, options.sections),
    coverPath: form.coverPath ?? null,
    updatedAt: null,
    chapters: [
      {
        id: "preview-content",
        title: "Контент",
        position: 0,
        contentText: null,
        contentJson: contentBlocks as unknown as Json,
      },
    ],
    h1Headings,
    hasFullAccess: true,
    isPreview: false,
  };
}
