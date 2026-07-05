import { Container } from "@/components/layout/container";
import {
  Breadcrumbs,
  type BreadcrumbItem,
} from "@/components/layout/breadcrumbs";
import { SectionHero } from "@/components/catalog/section/section-hero";
import { SectionMaterialsList } from "@/components/catalog/section/section-materials-list";
import { SectionRoadmapFromSection } from "@/components/catalog/section/section-roadmap";
import { SectionSidebar } from "@/components/catalog/section/section-sidebar";
import { ProductReviewsSection } from "@/components/reviews/product-reviews-section";
import type { SectionDetail } from "@/lib/catalog/detail-queries";
import { getSectionPageHref } from "@/lib/catalog/section-pages";
import type { PaidProductCartState } from "@/lib/cart/types";
import type { ProductReviewsData } from "@/lib/reviews/types";

type SectionDetailViewProps = {
  section: SectionDetail;
  reviewsData: ProductReviewsData;
  cartState: PaidProductCartState;
};

function buildBreadcrumbs(section: SectionDetail): BreadcrumbItem[] {
  return [
    { label: "Главная", href: "/" },
    { label: "Разделы", href: "/#sections" },
    { label: section.title },
  ];
}

export function SectionDetailView({
  section,
  reviewsData,
  cartState,
}: SectionDetailViewProps) {
  const signInReturnPath = getSectionPageHref(section.pageSlug);

  return (
    <Container className="py-6 md:py-8 lg:py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:gap-8">
        <Breadcrumbs items={buildBreadcrumbs(section)} />

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-6 md:gap-8">
            <SectionHero
              section={section}
              reviewStats={reviewsData.stats}
              cartState={cartState}
              signInReturnPath={signInReturnPath}
            />

            <div className="lg:hidden">
              <SectionSidebar
                section={section}
                cartState={cartState}
                signInReturnPath={signInReturnPath}
              />
            </div>

            <SectionRoadmapFromSection section={section} />
            <SectionMaterialsList materials={section.materials} />

            <ProductReviewsSection
              productId={section.id}
              productKind="section"
              productSlug={section.pageSlug}
              signInReturnPath={signInReturnPath}
              reviewsData={reviewsData}
            />
          </div>

          <aside className="hidden lg:sticky lg:top-20 lg:block lg:self-start">
            <SectionSidebar
              section={section}
              cartState={cartState}
              signInReturnPath={signInReturnPath}
            />
          </aside>
        </div>
      </div>
    </Container>
  );
}
