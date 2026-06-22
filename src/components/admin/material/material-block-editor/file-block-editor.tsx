"use client";

import { FileUp, Trash2 } from "lucide-react";

import type { MaterialBlock } from "@/lib/content/material-blocks";
import { formatFileSize } from "@/lib/content/format-file-size";
import { cn } from "@/lib/utils";

import { MediaUploadField } from "./media-upload-field";

type FileBlockEditorProps = {
  block: Extract<MaterialBlock, { type: "file" }>;
  disabled?: boolean;
  onChange: (block: MaterialBlock) => void;
};

function fileNameFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const segment = pathname.split("/").pop();
    return segment ? decodeURIComponent(segment) : "Файл";
  } catch {
    return "Файл";
  }
}

export function FileBlockEditor({ block, disabled, onChange }: FileBlockEditorProps) {
  if (!block.data.url) {
    return (
      <MediaUploadField
        kind="file"
        disabled={disabled}
        placeholder="Загрузить или встроить файл"
        accept="*/*"
        onComplete={({ url, fileName, fileSize }) =>
          onChange({
            ...block,
            data: {
              name: fileName,
              url,
              sizeLabel: formatFileSize(fileSize),
            },
          })
        }
        onLinkSubmit={(url) =>
          onChange({
            ...block,
            data: {
              name: fileNameFromUrl(url),
              url,
              sizeLabel: "",
            },
          })
        }
      />
    );
  }

  return (
    <div className="group flex items-center gap-2">
      <FileUp className="size-4 shrink-0 text-neutral-500" />
      <a
        href={block.data.url}
        target="_blank"
        rel="noreferrer"
        className="min-w-0 flex-1 truncate text-sm text-foreground hover:underline"
      >
        {block.data.name || "Файл"}
      </a>
      {block.data.sizeLabel ? (
        <span className="shrink-0 text-sm text-neutral-400">{block.data.sizeLabel}</span>
      ) : null}
      {!disabled ? (
        <button
          type="button"
          title="Удалить файл"
          onClick={() =>
            onChange({
              ...block,
              data: { name: "", url: "", sizeLabel: "" },
            })
          }
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-md text-neutral-400",
            "opacity-0 transition-opacity group-hover:opacity-100 hover:bg-neutral-100 hover:text-red-600",
          )}
        >
          <Trash2 className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}
