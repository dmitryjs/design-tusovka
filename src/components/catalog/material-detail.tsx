import Link from "next/link";

import { Container } from "@/components/layout/container";
import {
  Breadcrumbs,
  type BreadcrumbItem,
} from "@/components/layout/breadcrumbs";
import { MaterialAccessCard } from "@/components/catalog/material/material-access-card";
import { MaterialCover } from "@/components/catalog/material/material-cover";
import { MaterialHero } from "@/components/catalog/material/material-hero";
import { MaterialInfoTabs } from "@/components/catalog/material/material-info-tabs";
import { MaterialMeta } from "@/components/catalog/material/material-meta";
import { MaterialPreviewNotice } from "@/components/catalog/material/material-preview-notice";
import { MaterialTableOfContents } from "@/components/catalog/material/material-table-of-contents";
import { ProductReviewsSection } from "@/components/reviews/product-reviews-section";
import { buttonVariants } from "@/components/ui/button";
import type { MaterialDetail } from "@/lib/catalog/detail-queries";
import { getCatalogItemHref, getMaterialReadHref } from "@/lib/catalog/paths";
import { getPreferredSectionPageHref } from "@/lib/catalog/section-pages";
import type { FreeProductClaimState } from "@/lib/entitlements/types";
import type { PaidProductCartState } from "@/lib/cart/types";
import type { ProductReviewsData } from "@/lib/reviews/types";
import { cn } from "@/lib/utils";

type MaterialDetailViewProps = {
  material: MaterialDetail;
  claimState: FreeProductClaimState;
  cartState: PaidProductCartState;
  reviewsData: ProductReviewsData;
};

function buildBreadcrumbs(material: MaterialDetail): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    { label: "Главная", href: "/" },
    { label: "Материалы", href: "/#materials" },
  ];

  if (material.section) {
    items.push({
      label: material.section.title,
      href: getPreferredSectionPageHref(material.section.slug),
    });
  }

  items.push({ label: material.title });

  return items;
}

function MaterialSidebar({
  material,
  accessCardProps,
}: {
  material: MaterialDetail;
  accessCardProps: React.ComponentProps<typeof MaterialAccessCard>;
}) {
  return (
    <>
      <MaterialAccessCard {...accessCardProps} />
      <MaterialMeta material={material} />
      <MaterialTableOfContents
        chapters={material.chapters}
        h1Headings={material.h1Headings}
        isPreview={material.isPreview}
      />
    </>
  );
}

export function MaterialDetailView({
  material,
  claimState,
  cartState,
  reviewsData,
}: MaterialDetailViewProps) {
  const signInReturnPath = getCatalogItemHref("material", material.slug);
  const accessCardProps = {
    slug: material.slug,
    priceKopecks: material.priceKopecks,
    hasFullAccess: material.hasFullAccess,
    claimState,
    cartState,
    signInReturnPath,
  };

  const cover = (
    <MaterialCover
      title={material.title}
      format={material.format}
      coverPath={material.coverPath}
    />
  );

  return (
    <Container className="py-6 md:py-8 lg:py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:gap-8">
        <Breadcrumbs
          items={buildBreadcrumbs(material)}
          className="hidden md:block"
        />

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-6 md:gap-8">
            {/* Mobile: title + cover + meta, без оценки */}
            <div className="md:hidden">
              <MaterialHero
                material={material}
                claimState={claimState}
                cartState={cartState}
                reviewStats={reviewsData.stats}
                showBackButton
                hideRating
                cover={cover}
              />
            </div>

            {/* Desktop: прежний порядок hero → cover отдельно */}
            <div className="hidden md:block">
              <MaterialHero
                material={material}
                claimState={claimState}
                cartState={cartState}
                reviewStats={reviewsData.stats}
              />
            </div>

            <div className="flex flex-col gap-6 md:gap-8 lg:hidden">
              <MaterialAccessCard {...accessCardProps} />
            </div>

            <div className="hidden md:block">{cover}</div>

            {material.isPreview ? <MaterialPreviewNotice /> : null}

            {material.hasFullAccess ? (
              <section className="hidden rounded-xl border border-neutral-200 bg-white px-5 py-5 md:block">
                <h2 className="text-lg font-semibold text-foreground">Чтение материала</h2>
                <p className="mt-2 text-sm leading-6 text-neutral-600">
                  {material.priceKopecks === 0
                    ? "На этой странице — описание и содержание. Полный текст открывается в режиме чтения с навигацией по заголовкам."
                    : "Полный контент открыт в режиме чтения с навигацией по заголовкам."}
                </p>
                <Link
                  href={getMaterialReadHref(material.slug)}
                  className={cn(buttonVariants(), "mt-4 inline-flex")}
                >
                  Читать материал
                </Link>
              </section>
            ) : null}

            <MaterialInfoTabs material={material} className="md:hidden" />

            <div className="hidden md:block">
              <ProductReviewsSection
                productId={material.id}
                productKind="material"
                productSlug={material.slug}
                signInReturnPath={signInReturnPath}
                reviewsData={reviewsData}
              />
            </div>
          </div>

          <aside className="hidden flex-col gap-6 lg:sticky lg:top-20 lg:flex lg:self-start">
            <MaterialSidebar material={material} accessCardProps={accessCardProps} />
          </aside>
        </div>

        {/* Tablet: meta + toc below (desktop lg имеет sidebar; mobile — tabs) */}
        <div className="hidden flex-col gap-6 md:flex lg:hidden">
          <MaterialMeta material={material} />
          <MaterialTableOfContents
            chapters={material.chapters}
            h1Headings={material.h1Headings}
            isPreview={material.isPreview}
          />
        </div>
      </div>
    </Container>
  );
}
