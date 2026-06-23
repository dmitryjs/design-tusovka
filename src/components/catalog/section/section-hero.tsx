import Image from "next/image";
import { BookOpen, FileText, Layers } from "lucide-react";

import { SectionPurchaseCta } from "@/components/catalog/section/section-purchase-cta";
import { resolveMaterialCoverUrl } from "@/lib/catalog/material-cover";
import {
  sectionMaterialsCountLabel,
  sectionPracticeCountLabel,
} from "@/lib/catalog/section-detail-utils";
import type { SectionDetail } from "@/lib/catalog/detail-queries";
import { ProductRatingBadge } from "@/components/reviews/product-rating-badge";
import type { ProductReviewStats } from "@/lib/reviews/types";
import type { PaidProductCartState } from "@/lib/cart/types";

type SectionHeroProps = {
  section: SectionDetail;
  reviewStats: ProductReviewStats;
  cartState: PaidProductCartState;
  signInReturnPath: string;
};

export function SectionHero({
  section,
  reviewStats,
  cartState,
  signInReturnPath,
}: SectionHeroProps) {
  const coverUrl = resolveMaterialCoverUrl(section.coverPath);

  return (
    <header className="flex flex-col gap-6 md:gap-8">
      <div className="relative aspect-[2/1] w-full overflow-hidden sm:aspect-[21/9]">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 960px, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-neutral-100 px-6 text-center text-sm text-neutral-500">
            {section.title}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap gap-4 text-sm text-neutral-600">
          <span className="inline-flex items-center gap-1.5">
            <FileText className="size-4 text-neutral-400" aria-hidden />
            {section.stats.materialCount}{" "}
            {sectionMaterialsCountLabel(section.stats.materialCount)}
          </span>
          {section.stats.practiceCount > 0 ? (
            <span className="inline-flex items-center gap-1.5">
              <Layers className="size-4 text-neutral-400" aria-hidden />
              {section.stats.practiceCount}{" "}
              {sectionPracticeCountLabel(section.stats.practiceCount)}
            </span>
          ) : null}
          {section.stats.guideCount > 0 ? (
            <span className="inline-flex items-center gap-1.5">
              <BookOpen className="size-4 text-neutral-400" aria-hidden />
              {section.stats.guideCount} гайдов
            </span>
          ) : null}
        </div>

        <div className="space-y-3">
          <h1 className="text-[28px] leading-[36px] font-semibold tracking-tight text-foreground sm:text-[32px] sm:leading-[40px] md:text-[36px] md:leading-[44px]">
            {section.title}
          </h1>
          <ProductRatingBadge stats={reviewStats} />
          {section.description ? (
            <p className="max-w-2xl text-base leading-6 text-neutral-600">
              {section.description}
            </p>
          ) : null}
        </div>

        <SectionPurchaseCta
          catalogSlug={section.catalogSlug}
          priceKopecks={section.priceKopecks}
          cartState={cartState}
          signInReturnPath={signInReturnPath}
        />
      </div>
    </header>
  );
}
