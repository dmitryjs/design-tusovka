"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { setReviewHiddenAction } from "@/app/actions/admin/reviews";
import { AdminAlert } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAdminProductHref, getAdminProductKindLabel } from "@/lib/admin/product-kind";
import type { AdminReviewListItem } from "@/lib/admin/reviews";
import { cn } from "@/lib/utils";

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-500" aria-label={`${rating} из 5`}>
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} className={cn(index < rating ? "opacity-100" : "opacity-25")}>
          ★
        </span>
      ))}
    </span>
  );
}

export function ReviewsTable({ reviews }: { reviews: AdminReviewListItem[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggleHidden(reviewId: string, hidden: boolean) {
    setError(null);
    startTransition(async () => {
      const result = await setReviewHiddenAction(reviewId, hidden);
      if (!result.ok) {
        setError(result.error ?? "Не удалось обновить отзыв");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {error ? <AdminAlert variant="error">{error}</AdminAlert> : null}

      <div className="overflow-x-auto rounded-xl border border-neutral-200">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-600">
            <tr>
              <th className="px-4 py-3 font-medium">Товар</th>
              <th className="px-4 py-3 font-medium">Автор</th>
              <th className="px-4 py-3 font-medium">Оценка</th>
              <th className="px-4 py-3 font-medium">Текст</th>
              <th className="px-4 py-3 font-medium">Статус</th>
              <th className="px-4 py-3 font-medium">Дата</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {reviews.map((review) => {
              const productHref = getAdminProductHref(review.productKind, review.productSlug);

              return (
                <tr key={review.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-4 py-3">
                    {productHref ? (
                      <Link href={productHref} className="font-medium text-primary hover:underline">
                        {review.productTitle}
                      </Link>
                    ) : (
                      <span className="font-medium text-foreground">{review.productTitle}</span>
                    )}
                    <p className="mt-1 text-neutral-500">
                      {getAdminProductKindLabel(review.productKind)}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">
                      {review.userDisplayName?.trim() || "Без имени"}
                    </p>
                    <p className="text-neutral-600">{review.userEmail}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Stars rating={review.rating} />
                  </td>
                  <td className="max-w-xs px-4 py-3 text-neutral-700">
                    <p className="line-clamp-3 whitespace-pre-wrap">{review.body || "—"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="secondary"
                      className={cn(
                        "border-0",
                        review.isHidden
                          ? "bg-neutral-100 text-neutral-600"
                          : "bg-emerald-50 text-emerald-700",
                      )}
                    >
                      {review.isHidden ? "Скрыт" : "Опубликован"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {formatDateTime(review.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={isPending}
                      onClick={() => toggleHidden(review.id, !review.isHidden)}
                    >
                      {review.isHidden ? "Показать" : "Скрыть"}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
