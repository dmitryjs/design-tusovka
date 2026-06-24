"use client";

import { ArrowLeft, Eye } from "lucide-react";

import { MaterialAccessCard } from "@/components/catalog/material/material-access-card";
import { MaterialContent } from "@/components/catalog/material/material-content";
import { MaterialCover } from "@/components/catalog/material/material-cover";
import { MaterialHero } from "@/components/catalog/material/material-hero";
import { MaterialMeta } from "@/components/catalog/material/material-meta";
import { MaterialPreviewNotice } from "@/components/catalog/material/material-preview-notice";
import { MaterialTableOfContents } from "@/components/catalog/material/material-table-of-contents";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { buildAdminMaterialPreviewDetail } from "@/lib/admin/material-preview";
import type { AdminProductFormInput } from "@/lib/admin/types";
import { getCatalogItemHref } from "@/lib/catalog/paths";
import type { ProductReviewStats } from "@/lib/reviews/types";

type SelectOption = { value: string; label: string };

const GUEST_REVIEW_STATS: ProductReviewStats = {
  averageRating: 0,
  reviewCount: 0,
};

type MaterialAdminPreviewProps = {
  form: AdminProductFormInput;
  productId?: string;
  tags: SelectOption[];
  sections: SelectOption[];
  onClose: () => void;
};

export function MaterialAdminPreview({
  form,
  productId,
  tags,
  sections,
  onClose,
}: MaterialAdminPreviewProps) {
  const material = buildAdminMaterialPreviewDetail(form, {
    productId,
    tags,
    sections,
  });
  const signInReturnPath = getCatalogItemHref("material", material.slug);
  const accessCardProps = {
    slug: material.slug,
    priceKopecks: material.priceKopecks,
    hasFullAccess: material.hasFullAccess,
    claimState: material.priceKopecks === 0 ? ("guest" as const) : ("hidden" as const),
    cartState: material.priceKopecks === 0 ? ("hidden" as const) : ("guest" as const),
    signInReturnPath,
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/95 backdrop-blur">
        <Container className="flex flex-wrap items-center justify-between gap-3 py-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            <ArrowLeft className="size-4" aria-hidden />
            Вернуться к редактированию
          </Button>
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <Eye className="size-4 shrink-0" aria-hidden />
            <span>
              {material.isPreview
                ? "Предпросмотр для посетителя без доступа к платному материалу"
                : "Предпросмотр для посетителя бесплатного материала"}
            </span>
          </div>
        </Container>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <Container className="py-6 md:py-8 lg:py-10">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 md:gap-8">
            <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="flex min-w-0 flex-col gap-6 md:gap-8">
                <MaterialHero
                  material={material}
                  claimState={accessCardProps.claimState}
                  cartState={accessCardProps.cartState}
                  reviewStats={GUEST_REVIEW_STATS}
                />

                <div className="flex flex-col gap-6 md:gap-8 lg:hidden">
                  <MaterialAccessCard {...accessCardProps} />
                </div>

                <MaterialCover
                  title={material.title}
                  format={material.format}
                  coverPath={material.coverPath}
                />

                {material.isPreview ? <MaterialPreviewNotice /> : null}

                {material.hasFullAccess ? (
                  <MaterialContent chapters={material.chapters} />
                ) : null}
              </div>

              <aside className="hidden flex-col gap-6 lg:flex lg:self-start">
                <MaterialAccessCard {...accessCardProps} />
                <MaterialTableOfContents
                  chapters={material.chapters}
                  isPreview={material.isPreview}
                  anchorBaseHref={material.hasFullAccess ? "" : undefined}
                />
                <MaterialMeta material={material} />
              </aside>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}
