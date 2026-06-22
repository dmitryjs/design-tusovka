import Image from "next/image";
import Link from "next/link";
import { BookOpen, FileText, Layers } from "lucide-react";

import { formatPrice } from "@/lib/catalog/format";
import {
  sectionMaterialsCountLabel,
  sectionPracticeCountLabel,
} from "@/lib/catalog/section-detail-utils";
import type { SectionDetail } from "@/lib/catalog/detail-queries";
import { getSectionPageHref } from "@/lib/catalog/section-pages";
import { ProductRatingBadge } from "@/components/reviews/product-rating-badge";
import type { ProductReviewStats } from "@/lib/reviews/types";
import { cn } from "@/lib/utils";

type SectionHeroProps = {
  section: SectionDetail;
  reviewStats: ProductReviewStats;
};

export function SectionHero({ section, reviewStats }: SectionHeroProps) {
  return (
    <header className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="flex flex-col gap-5 p-6 sm:p-8">
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

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="#section-purchase"
              className={cn(
                "inline-flex h-10 items-center justify-center rounded-lg px-5 text-sm font-medium",
                "bg-primary text-primary-foreground hover:bg-primary/90",
              )}
            >
              Купить раздел — {formatPrice(section.priceKopecks)}
            </Link>
          </div>
        </div>

        <div className="relative hidden min-h-[220px] bg-neutral-100 lg:block">
          {section.coverPath ? (
            <Image
              src={section.coverPath}
              alt=""
              fill
              priority
              sizes="280px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-50 to-violet-50 px-6 text-center text-sm text-neutral-500">
              {section.title}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
