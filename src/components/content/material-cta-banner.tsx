import Image from "next/image";
import Link from "next/link";
import { ImageIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import type { CtaBlockData } from "@/lib/content/cta-block";
import { isCtaBlockConfigured, resolveCtaHref } from "@/lib/content/cta-block";
import {
  getMaterialCoverPlaceholderClass,
  getMaterialFormatTagClass,
  resolveMaterialCoverUrl,
} from "@/lib/catalog/material-cover";
import type { Database } from "@/types/database.types";
import { cn } from "@/lib/utils";

type MaterialCtaBannerProps = {
  data: CtaBlockData;
  className?: string;
  materialFormat?: Database["public"]["Enums"]["material_format"] | null;
};

function CtaCover({
  title,
  coverPath,
  materialFormat,
}: {
  title: string;
  coverPath: string | null;
  materialFormat?: Database["public"]["Enums"]["material_format"] | null;
}) {
  const coverUrl = resolveMaterialCoverUrl(coverPath);
  const format = materialFormat ?? "mini_guide";
  const placeholderClass = getMaterialCoverPlaceholderClass(format);

  if (coverUrl) {
    return (
      <Image
        src={coverUrl}
        alt=""
        fill
        sizes="120px"
        className="object-cover"
      />
    );
  }

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center justify-center gap-1 px-2 text-center",
        placeholderClass,
      )}
      aria-hidden
    >
      <ImageIcon className="size-5 opacity-60" />
      <span
        className={cn(
          "line-clamp-2 text-[10px] leading-3 font-medium",
          getMaterialFormatTagClass(format),
        )}
      >
        {title || "Обложка"}
      </span>
    </div>
  );
}

export function MaterialCtaBanner({ data, className, materialFormat }: MaterialCtaBannerProps) {
  const href = resolveCtaHref(data);
  const configured = isCtaBlockConfigured(data);
  const buttonLabel = data.buttonLabel.trim() || "Перейти";

  return (
    <article
      className={cn(
        "flex h-20 w-full overflow-hidden rounded-xl border bg-blue-50",
        configured ? "border-blue-100" : "border-dashed border-neutral-300 bg-neutral-50",
        className,
      )}
    >
      <div className="relative h-20 w-[120px] shrink-0 border-r border-blue-100/80 bg-neutral-100">
        <CtaCover title={data.title} coverPath={data.coverPath} materialFormat={materialFormat} />
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2 sm:px-4">
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "truncate text-sm font-semibold",
              configured ? "text-foreground" : "text-neutral-500",
            )}
          >
            {data.title.trim() || "Выберите материал для баннера"}
          </p>
          <p
            className={cn(
              "mt-0.5 line-clamp-2 text-xs leading-snug",
              configured ? "text-neutral-600" : "text-neutral-400",
            )}
          >
            {data.description.trim() || "Обложка, заголовок и описание подтянутся из карточки материала"}
          </p>
        </div>

        {href ? (
          <Link
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ size: "sm" }), "shrink-0")}
          >
            {buttonLabel}
          </Link>
        ) : (
          <span
            className={cn(
              buttonVariants({ size: "sm" }),
              "pointer-events-none shrink-0 opacity-50",
            )}
            aria-disabled
          >
            {buttonLabel}
          </span>
        )}
      </div>
    </article>
  );
}
