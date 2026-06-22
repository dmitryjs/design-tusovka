import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Container } from "@/components/layout/container";
import {
  Breadcrumbs,
  type BreadcrumbItem,
} from "@/components/layout/breadcrumbs";
import { MaterialMeta } from "@/components/catalog/material/material-meta";
import { MaterialReadingActions } from "@/components/catalog/material/material-reading-actions";
import { MaterialReadingContent } from "@/components/catalog/material/material-reading-content";
import { MaterialReadingToc } from "@/components/catalog/material/material-reading-toc";
import { ProductReviewsSection } from "@/components/reviews/product-reviews-section";
import type { MaterialDetail } from "@/lib/catalog/detail-queries";
import { getCatalogItemHref } from "@/lib/catalog/paths";
import { getPreferredSectionPageHref } from "@/lib/catalog/section-pages";
import {
  collectBlocksFromChapters,
  extractHeadingAnchors,
  findPdfAttachment,
} from "@/lib/content/material-reading";
import type { PaidProductCartState } from "@/lib/cart/types";
import type { FreeProductClaimState } from "@/lib/entitlements/types";
import type { ProductReviewsData } from "@/lib/reviews/types";

type MaterialReadingViewProps = {
  material: MaterialDetail;
  claimState: FreeProductClaimState;
  cartState: PaidProductCartState;
  reviewsData: ProductReviewsData;
};

export function canShowMaterialReadingActions(
  priceKopecks: number,
  hasFullAccess: boolean,
  claimState: FreeProductClaimState,
  cartState: PaidProductCartState,
): boolean {
  if (priceKopecks > 0) {
    return hasFullAccess;
  }

  return claimState === "claimed" || cartState === "in_library";
}

function buildBreadcrumbs(material: MaterialDetail): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    { label: "Главная", href: "/" },
    { label: "Моя библиотека", href: "/profile/library" },
  ];

  if (material.section) {
    items.push({
      label: material.section.title,
      href: getPreferredSectionPageHref(material.section.slug),
    });
  }

  items.push({
    label: material.title,
    href: getCatalogItemHref("material", material.slug),
  });
  items.push({ label: "Чтение" });

  return items;
}

export function MaterialReadingView({
  material,
  claimState,
  cartState,
  reviewsData,
}: MaterialReadingViewProps) {
  const signInReturnPath = `${getCatalogItemHref("material", material.slug)}/read`;
  const blocks = collectBlocksFromChapters(material.chapters);
  const headings = extractHeadingAnchors(blocks);
  const pdfAttachment = findPdfAttachment(blocks);
  const showActions = canShowMaterialReadingActions(
    material.priceKopecks,
    material.hasFullAccess,
    claimState,
    cartState,
  );

  return (
    <Container className="py-6 md:py-8 lg:py-10">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-6 md:gap-8">
        <Breadcrumbs items={buildBreadcrumbs(material)} />

        <div className="grid items-start gap-8 xl:grid-cols-[220px_minmax(0,1fr)_300px]">
          <aside className="hidden xl:block">
            <div className="sticky top-20 space-y-6">
              <Link
                href={getCatalogItemHref("material", material.slug)}
                className="inline-flex items-center gap-1.5 text-sm text-neutral-500 transition-colors hover:text-foreground"
              >
                <ArrowLeft className="size-4" aria-hidden />
                К материалу
              </Link>
              <MaterialReadingToc headings={headings} />
            </div>
          </aside>

          <main className="min-w-0">
            <div className="mx-auto max-w-3xl">
              <div className="mb-6 space-y-4 xl:hidden">
                <Link
                  href={getCatalogItemHref("material", material.slug)}
                  className="inline-flex items-center gap-1.5 text-sm text-neutral-500 transition-colors hover:text-foreground"
                >
                  <ArrowLeft className="size-4" aria-hidden />
                  К материалу
                </Link>
                <MaterialReadingToc
                  headings={headings}
                  className="rounded-xl border border-neutral-200 bg-white p-4"
                />
              </div>

              <h1 className="mb-6 text-3xl leading-tight font-bold text-foreground sm:text-4xl">
                {material.title}
              </h1>

              <div className="mb-8 xl:hidden">
                {showActions ? (
                  <MaterialReadingActions pdfAttachment={pdfAttachment} className="mb-4" />
                ) : null}
                <MaterialMeta material={material} />
              </div>

              <MaterialReadingContent chapters={material.chapters} />

              <div className="mt-12 border-t border-neutral-200 pt-10">
                <ProductReviewsSection
                  productId={material.id}
                  productKind="material"
                  productSlug={material.slug}
                  signInReturnPath={signInReturnPath}
                  reviewsData={reviewsData}
                />
              </div>
            </div>
          </main>

          <aside className="hidden xl:block">
            <div className="sticky top-20 space-y-6">
              {showActions ? (
                <MaterialReadingActions pdfAttachment={pdfAttachment} />
              ) : null}
              <MaterialMeta material={material} />
            </div>
          </aside>
        </div>
      </div>
    </Container>
  );
}
