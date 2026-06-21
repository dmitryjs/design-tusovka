import { Container } from "@/components/layout/container";
import {
  Breadcrumbs,
  type BreadcrumbItem,
} from "@/components/layout/breadcrumbs";
import { MaterialAccessCard } from "@/components/catalog/material/material-access-card";
import { MaterialContent } from "@/components/catalog/material/material-content";
import { MaterialCover } from "@/components/catalog/material/material-cover";
import { MaterialHero } from "@/components/catalog/material/material-hero";
import { MaterialMeta } from "@/components/catalog/material/material-meta";
import { MaterialPreviewNotice } from "@/components/catalog/material/material-preview-notice";
import { MaterialTableOfContents } from "@/components/catalog/material/material-table-of-contents";
import type { MaterialDetail } from "@/lib/catalog/detail-queries";
import { getCatalogItemHref } from "@/lib/catalog/paths";
import type { FreeProductClaimState } from "@/lib/entitlements/types";
import type { PaidProductCartState } from "@/lib/cart/types";

type MaterialDetailViewProps = {
  material: MaterialDetail;
  claimState: FreeProductClaimState;
  cartState: PaidProductCartState;
};

function buildBreadcrumbs(material: MaterialDetail): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    { label: "Главная", href: "/" },
    { label: "Материалы", href: "/catalog" },
  ];

  if (material.section) {
    items.push({
      label: material.section.title,
      href: getCatalogItemHref("section", material.section.slug),
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
      <MaterialTableOfContents
        chapters={material.chapters}
        isPreview={material.isPreview}
      />
      <MaterialMeta material={material} />
    </>
  );
}

export function MaterialDetailView({
  material,
  claimState,
  cartState,
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

  return (
    <Container className="py-6 md:py-8 lg:py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:gap-8">
        <Breadcrumbs items={buildBreadcrumbs(material)} />

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-6 md:gap-8">
            <MaterialHero
              material={material}
              claimState={claimState}
              cartState={cartState}
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

          <aside className="hidden flex-col gap-6 lg:sticky lg:top-20 lg:flex lg:self-start">
            <MaterialSidebar material={material} accessCardProps={accessCardProps} />
          </aside>
        </div>

        <div className="flex flex-col gap-6 lg:hidden">
          <MaterialTableOfContents
            chapters={material.chapters}
            isPreview={material.isPreview}
          />
          <MaterialMeta material={material} />
        </div>
      </div>
    </Container>
  );
}
