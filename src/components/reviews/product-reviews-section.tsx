"use client";

import { useState } from "react";
import { Star } from "lucide-react";

import {
  ProductReviewForm,
  ProductReviewGuestPrompt,
} from "@/components/reviews/product-review-form";
import { PRODUCT_REVIEWS_SECTION_ID } from "@/components/reviews/product-rating-badge";
import { reviewCountLabel } from "@/lib/reviews/messages";
import type { ProductReviewsData } from "@/lib/reviews/types";
import { formatProfileDate } from "@/lib/profile/format";
import { cn } from "@/lib/utils";

type ProductReviewsSectionProps = {
  productId: string;
  productKind: "material" | "task" | "section";
  productSlug: string;
  signInReturnPath: string;
  reviewsData: ProductReviewsData;
  className?: string;
};

export function ProductReviewsSection({
  productId,
  productKind,
  productSlug,
  signInReturnPath,
  reviewsData,
  className,
}: ProductReviewsSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { stats, reviews, viewer } = reviewsData;
  const showEditForm = Boolean(viewer.ownReview && isEditing);
  const visibleReviews = showEditForm ? reviews.filter((review) => !review.isOwn) : reviews;

  return (
    <section
      id={PRODUCT_REVIEWS_SECTION_ID}
      className={cn("scroll-mt-24 space-y-5", className)}
    >
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-foreground">Отзывы</h2>
        <p className="text-sm text-neutral-600">
          {stats.reviewCount > 0
            ? `Средняя оценка ${stats.averageRating.toFixed(1)} · ${reviewCountLabel(stats.reviewCount)}`
            : "Пока нет отзывов — будьте первым."}
        </p>
      </div>

      {!viewer.isAuthenticated ? (
        <ProductReviewGuestPrompt signInReturnPath={signInReturnPath} />
      ) : viewer.canReview && !viewer.ownReview ? (
        <ProductReviewForm
          productId={productId}
          productKind={productKind}
          productSlug={productSlug}
          signInReturnPath={signInReturnPath}
          mode="create"
        />
      ) : viewer.isAuthenticated && !viewer.canReview && !viewer.ownReview ? (
        <p className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
          Оставить отзыв могут только те, кто получил или купил этот продукт.
        </p>
      ) : null}

      {viewer.ownReview && !showEditForm ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
          <p className="text-sm text-neutral-700">Вы уже оставили отзыв на этот продукт.</p>
          <button
            type="button"
            className="text-sm font-medium text-primary hover:underline"
            onClick={() => setIsEditing(true)}
          >
            Редактировать
          </button>
        </div>
      ) : null}

      {viewer.ownReview && showEditForm ? (
        <ProductReviewForm
          productId={productId}
          productKind={productKind}
          productSlug={productSlug}
          signInReturnPath={signInReturnPath}
          mode="edit"
          initialRating={viewer.ownReview.rating}
          initialBody={viewer.ownReview.body}
          onCancelEdit={() => setIsEditing(false)}
        />
      ) : null}

      {visibleReviews.length > 0 ? (
        <ul className="space-y-4">
          {visibleReviews.map((review) => (
            <li
              key={review.id}
              className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {review.authorDisplayName}
                    {review.isOwn ? (
                      <span className="ml-2 text-xs font-medium text-primary">Вы</span>
                    ) : null}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {formatProfileDate(review.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-0.5" aria-label={`Оценка ${review.rating} из 5`}>
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star
                      key={index}
                      className={cn(
                        "size-4",
                        index < review.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-neutral-200",
                      )}
                      aria-hidden
                    />
                  ))}
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-neutral-700">
                {review.body}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-neutral-500">Отзывов пока нет.</p>
      )}
    </section>
  );
}
