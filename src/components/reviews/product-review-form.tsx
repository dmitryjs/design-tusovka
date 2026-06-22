"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Star, Trash2 } from "lucide-react";

import {
  deleteProductReviewAction,
  submitProductReviewAction,
} from "@/app/actions/reviews";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ProductReviewFormProps = {
  productId: string;
  productKind: "material" | "task" | "section";
  productSlug: string;
  signInReturnPath: string;
  initialRating?: number;
  initialBody?: string;
  mode: "create" | "edit";
  onCancelEdit?: () => void;
};

export function ProductReviewForm({
  productId,
  productKind,
  productSlug,
  signInReturnPath,
  initialRating = 0,
  initialBody = "",
  mode,
  onCancelEdit,
}: ProductReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(initialRating);
  const [body, setBody] = useState(initialBody);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDelete] = useTransition();

  function handleSubmit() {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await submitProductReviewAction(
        productId,
        productKind,
        productSlug,
        rating,
        body,
      );

      if (!result.ok) {
        setError(result.message ?? "Не удалось сохранить отзыв");
        return;
      }

      setSuccess(result.message ?? "Отзыв сохранён");
      if (mode === "create") {
        setBody("");
        setRating(0);
      }
      router.refresh();
    });
  }

  function handleDelete() {
    setError(null);
    setSuccess(null);
    startDelete(async () => {
      const result = await deleteProductReviewAction(productId, productKind, productSlug);

      if (!result.ok) {
        setError(result.message ?? "Не удалось удалить отзыв");
        return;
      }

      setSuccess(result.message ?? "Отзыв удалён");
      setBody("");
      setRating(0);
      onCancelEdit?.();
      router.refresh();
    });
  }

  return (
    <div className="space-y-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 sm:p-5">
      <div>
        <p className="text-sm font-medium text-foreground">
          {mode === "edit" ? "Ваш отзыв" : "Оставить отзыв"}
        </p>
        <p className="mt-1 text-sm text-neutral-600">
          Оценка от 1 до 5 и короткий комментарий о продукте.
        </p>
      </div>

      <StarRatingInput value={rating} onChange={setRating} disabled={isPending || isDeleting} />

      <div className="space-y-1.5">
        <label htmlFor="review-body" className="text-sm font-medium text-foreground">
          Текст отзыва
        </label>
        <textarea
          id="review-body"
          value={body}
          disabled={isPending || isDeleting}
          maxLength={5000}
          rows={4}
          placeholder="Что понравилось, что было полезно..."
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm leading-6 text-foreground outline-none transition-colors placeholder:text-neutral-500 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-blue-100 disabled:bg-neutral-100"
          onChange={(event) => setBody(event.target.value)}
        />
      </div>

      {error ? (
        <p className="text-sm text-destructive-foreground" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="text-sm text-emerald-700" role="status">
          {success}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          disabled={isPending || isDeleting || rating < 1 || !body.trim()}
          onClick={handleSubmit}
        >
          {isPending ? "Сохраняем…" : mode === "edit" ? "Обновить отзыв" : "Отправить отзыв"}
        </Button>
        {mode === "edit" ? (
          <>
            <Button
              type="button"
              variant="secondary"
              disabled={isPending || isDeleting}
              onClick={onCancelEdit}
            >
              Отмена
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="text-destructive-foreground"
              disabled={isPending || isDeleting}
              onClick={handleDelete}
            >
              <Trash2 className="size-4" aria-hidden />
              {isDeleting ? "Удаляем…" : "Удалить"}
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
}

type ProductReviewGuestPromptProps = {
  signInReturnPath: string;
};

export function ProductReviewGuestPrompt({ signInReturnPath }: ProductReviewGuestPromptProps) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-4 sm:px-5">
      <p className="text-sm text-neutral-700">
        Войдите в аккаунт, чтобы оставить отзыв.
      </p>
      <Link
        href={`/auth/sign-in?next=${encodeURIComponent(signInReturnPath)}`}
        className={cn(buttonVariants({ size: "sm" }), "mt-3")}
      >
        Войти
      </Link>
    </div>
  );
}

function StarRatingInput({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Оценка">
      {Array.from({ length: 5 }, (_, index) => {
        const starValue = index + 1;
        const isActive = starValue <= value;

        return (
          <button
            key={starValue}
            type="button"
            disabled={disabled}
            className="rounded p-0.5 transition-colors hover:text-amber-500 disabled:opacity-50"
            aria-label={`${starValue} из 5`}
            onClick={() => onChange(starValue)}
          >
            <Star
              className={cn(
                "size-6",
                isActive ? "fill-amber-400 text-amber-400" : "text-neutral-300",
              )}
              aria-hidden
            />
          </button>
        );
      })}
    </div>
  );
}
