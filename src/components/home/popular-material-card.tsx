"use client";

import { Eye, ShoppingCart, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";

import { addToCartAction } from "@/app/actions/cart";
import { claimFreeProductAction } from "@/app/actions/entitlements";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatPrice, getMaterialFormatLabel } from "@/lib/catalog/format";
import {
  getMaterialCoverPlaceholderClass,
  getMaterialFormatTagClass,
  resolveMaterialCoverUrl,
} from "@/lib/catalog/material-cover";
import { resolveMaterialRating } from "@/lib/catalog/material-rating";
import { getCatalogItemHref } from "@/lib/catalog/paths";
import type { Database } from "@/types/database.types";
import { cn } from "@/lib/utils";

export type PopularMaterialCardData = {
  slug: string;
  title: string;
  description: string;
  priceKopecks: number;
  format: Database["public"]["Enums"]["material_format"];
  coverPath?: string | null;
  averageRating?: number | null;
  reviewCount?: number | null;
};

type PopularMaterialCardProps = {
  material: PopularMaterialCardData;
  className?: string;
  /** Без CTA покупки/получения — для «Моя библиотека». */
  variant?: "catalog" | "library";
};

function MaterialCardFooter({
  rating,
  priceKopecks,
}: {
  rating: { averageRating: number; reviewCount: number };
  priceKopecks: number;
}) {
  return (
    <div className="mt-auto flex h-14 shrink-0 items-center justify-between border-t border-neutral-200 px-4">
      <div className="flex items-center gap-1 text-sm text-neutral-700">
        <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden />
        <span className="font-medium">{rating.averageRating.toFixed(1)}</span>
        {rating.reviewCount > 0 ? (
          <span className="text-neutral-500">({rating.reviewCount})</span>
        ) : null}
      </div>
      <span className="text-sm leading-5 font-semibold text-primary">
        {formatPrice(priceKopecks)}
      </span>
    </div>
  );
}

export function PopularMaterialCard({
  material,
  className,
  variant = "catalog",
}: PopularMaterialCardProps) {
  const [error, setError] = useState<string | null>(null);
  const [ctaLabel, setCtaLabel] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isFree = material.priceKopecks === 0;
  const materialHref = getCatalogItemHref("material", material.slug);
  const coverUrl = resolveMaterialCoverUrl(material.coverPath);
  const placeholderClass = getMaterialCoverPlaceholderClass(material.format);
  const formatLabel = getMaterialFormatLabel(material.format);
  const rating = resolveMaterialRating(
    material.slug,
    material.averageRating,
    material.reviewCount,
  );

  const primaryLabel =
    ctaLabel ??
    (isFree ? "Получить" : isPending ? "Добавляем…" : "В корзину");

  function handlePrimaryAction() {
    setError(null);
    startTransition(async () => {
      if (isFree) {
        const result = await claimFreeProductAction(material.slug, "material");

        if (result.ok) {
          setCtaLabel("В библиотеке");
          return;
        }

        if (result.code === "unauthenticated") {
          window.location.href = `/auth/sign-in?next=${encodeURIComponent(materialHref)}`;
          return;
        }

        setError(result.message ?? "Не удалось сохранить материал.");
        return;
      }

      const result = await addToCartAction(material.slug, "material");

      if (result.ok) {
        setCtaLabel("В корзине");
        return;
      }

      if (result.code === "unauthenticated") {
        window.location.href = `/auth/sign-in?next=${encodeURIComponent(materialHref)}`;
        return;
      }

      if (result.code === "already_owned") {
        setCtaLabel("В библиотеке");
        return;
      }

      if (result.code === "free_product") {
        setCtaLabel("Получить");
      }

      setError(result.message ?? "Не удалось добавить в корзину.");
    });
  }

  const articleClassName = cn(
    "group/card relative flex h-full min-w-[240px] flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white transition-colors sm:min-w-[260px] lg:min-w-0",
    "hover:border-primary/20",
  );

  const cardBody = (
    <>
      <div className="relative h-40 w-full shrink-0 overflow-hidden bg-neutral-100">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt=""
            fill
            sizes="(min-width: 1024px) 20vw, 260px"
            className="object-cover"
          />
        ) : (
          <div
            className={cn(
              "flex h-full w-full items-center justify-center px-4 text-center text-xs leading-5 font-medium",
              placeholderClass,
            )}
          >
            {formatLabel}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 pb-0">
        <p
          className={cn(
            "mb-1 text-xs leading-4 font-medium",
            getMaterialFormatTagClass(material.format),
          )}
        >
          {formatLabel}
        </p>
        <h3 className="line-clamp-2 h-10 text-sm leading-5 font-bold text-foreground group-hover/card:text-primary">
          {material.title}
        </h3>
      </div>

      {variant === "library" ? (
        <MaterialCardFooter rating={rating} priceKopecks={material.priceKopecks} />
      ) : (
        <div className="relative mt-auto h-14 shrink-0">
          <div className="absolute inset-0 flex items-center justify-between px-4 transition-opacity duration-150 group-hover/card:pointer-events-none group-hover/card:opacity-0 group-focus-within/card:pointer-events-none group-focus-within/card:opacity-0">
            <div className="flex items-center gap-1 text-sm text-neutral-700">
              <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden />
              <span className="font-medium">{rating.averageRating.toFixed(1)}</span>
              {rating.reviewCount > 0 ? (
                <span className="text-neutral-500">({rating.reviewCount})</span>
              ) : null}
            </div>
            <span className="text-sm leading-5 font-semibold text-primary">
              {formatPrice(material.priceKopecks)}
            </span>
          </div>

          <div className="pointer-events-none absolute inset-0 z-[2] flex w-full items-center gap-2 border-t border-neutral-200 bg-white px-3 opacity-0 transition-opacity duration-150 group-hover/card:pointer-events-auto group-hover/card:opacity-100 group-focus-within/card:pointer-events-auto group-focus-within/card:opacity-100">
            <Button
              type="button"
              className="min-w-0 flex-1"
              disabled={
                isPending || ctaLabel === "В корзине" || ctaLabel === "В библиотеке"
              }
              onClick={handlePrimaryAction}
            >
              <ShoppingCart className="size-4 shrink-0" aria-hidden />
              <span className="truncate">{primaryLabel}</span>
            </Button>
            <Link
              href={materialHref}
              aria-label={`Открыть материал «${material.title}»`}
              className={cn(buttonVariants({ variant: "secondary", size: "icon" }), "shrink-0")}
            >
              <Eye className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      )}

      {variant === "catalog" && error ? (
        <p className="px-4 pb-3 text-xs text-destructive-foreground" role="alert">
          {error}
        </p>
      ) : null}
    </>
  );

  return (
    <article className={cn(articleClassName, className)}>
      <Link
        href={materialHref}
        aria-label={`Открыть материал «${material.title}»`}
        className="absolute inset-0 z-[1] rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
      />
      {cardBody}
    </article>
  );
}
