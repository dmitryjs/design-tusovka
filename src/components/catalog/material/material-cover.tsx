import Image from "next/image";

import {
  getMaterialCoverPlaceholderClass,
  getMaterialFormatTagClass,
  resolveMaterialCoverUrl,
} from "@/lib/catalog/material-cover";
import { getMaterialFormatLabel } from "@/lib/catalog/format";
import type { Database } from "@/types/database.types";
import { cn } from "@/lib/utils";

type MaterialCoverProps = {
  title: string;
  format: Database["public"]["Enums"]["material_format"];
  coverPath: string | null;
  className?: string;
};

export function MaterialCover({
  title,
  format,
  coverPath,
  className,
}: MaterialCoverProps) {
  const coverUrl = resolveMaterialCoverUrl(coverPath);
  const formatLabel = getMaterialFormatLabel(format);

  return (
    <div
      className={cn(
        "relative aspect-video w-full overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100",
        className,
      )}
    >
      {coverUrl ? (
        <Image
          src={coverUrl}
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 66vw, 100vw"
          className="object-cover"
        />
      ) : (
        <div
          className={cn(
            "flex h-full w-full flex-col items-center justify-center gap-2 px-6 text-center",
            getMaterialCoverPlaceholderClass(format),
          )}
          aria-hidden
        >
          <span className={cn("text-sm font-medium", getMaterialFormatTagClass(format))}>
            {formatLabel}
          </span>
          <span className="line-clamp-2 max-w-md text-xs leading-5 text-neutral-600">
            {title}
          </span>
        </div>
      )}
    </div>
  );
}
