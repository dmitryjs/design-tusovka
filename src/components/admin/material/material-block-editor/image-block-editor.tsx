"use client";

import { Trash2 } from "lucide-react";

import type { MaterialBlock } from "@/lib/content/material-blocks";
import { cn } from "@/lib/utils";

import { MediaUploadField } from "./media-upload-field";

type ImageBlockEditorProps = {
  block: Extract<MaterialBlock, { type: "image" }>;
  disabled?: boolean;
  onChange: (block: MaterialBlock) => void;
};

export function ImageBlockEditor({ block, disabled, onChange }: ImageBlockEditorProps) {
  if (!block.data.url) {
    return (
      <MediaUploadField
        kind="image"
        disabled={disabled}
        placeholder="Добавить изображение"
        accept="image/*"
        onComplete={({ url, fileName }) =>
          onChange({
            ...block,
            data: {
              ...block.data,
              url,
              alt: fileName,
            },
          })
        }
        onLinkSubmit={(url) =>
          onChange({
            ...block,
            data: { ...block.data, url },
          })
        }
      />
    );
  }

  return (
    <div className="group relative">
      <div className="overflow-hidden rounded-lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={block.data.url}
          alt={block.data.alt || ""}
          className="h-auto max-h-[480px] w-full object-contain"
        />
      </div>
      {!disabled ? (
        <button
          type="button"
          title="Удалить изображение"
          onClick={() =>
            onChange({
              ...block,
              data: { url: "", alt: "", caption: "" },
            })
          }
          className={cn(
            "absolute top-2 right-2 flex size-8 items-center justify-center rounded-lg bg-white/90 text-neutral-600 shadow-sm",
            "opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white hover:text-red-600",
          )}
        >
          <Trash2 className="size-4" />
        </button>
      ) : null}
    </div>
  );
}
