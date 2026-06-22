"use client";

import { useEffect, useRef, useState } from "react";
import { ImageIcon, Upload } from "lucide-react";

import { uploadMaterialMediaAction } from "@/app/actions/admin/media";
import { Button } from "@/components/ui/button";
import { MATERIAL_MEDIA_MAX_BYTES, MATERIAL_MEDIA_MAX_LABEL } from "@/lib/content/media-limits";
import { cn } from "@/lib/utils";

type MediaUploadFieldProps = {
  kind: "image" | "file";
  disabled?: boolean;
  placeholder: string;
  accept: string;
  onComplete: (result: { url: string; fileName: string; fileSize: number }) => void;
  onLinkSubmit: (url: string) => void;
};

type Tab = "upload" | "link";

export function MediaUploadField({
  kind,
  disabled,
  placeholder,
  accept,
  onComplete,
  onLinkSubmit,
}: MediaUploadFieldProps) {
  const [open, setOpen] = useState(true);
  const [tab, setTab] = useState<Tab>("upload");
  const [linkValue, setLinkValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const handleUpload = async (file: File) => {
    setError(null);

    if (file.size > MATERIAL_MEDIA_MAX_BYTES) {
      setError(`Файл слишком большой (максимум ${MATERIAL_MEDIA_MAX_LABEL})`);
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.set("file", file);

    const result = await uploadMaterialMediaAction(formData);
    setUploading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    onComplete({
      url: result.url,
      fileName: file.name,
      fileSize: file.size,
    });
    setOpen(false);
  };

  const handleLink = () => {
    const url = linkValue.trim();
    if (!url) {
      return;
    }

    onLinkSubmit(url);
    setOpen(false);
  };

  const Icon = kind === "image" ? ImageIcon : Upload;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg bg-neutral-100 px-3 py-2.5 text-left text-sm text-neutral-500 transition-colors",
          !disabled && "hover:bg-neutral-200/80",
        )}
      >
        <Icon className="size-4 shrink-0" />
        <span>{placeholder}</span>
      </button>

      {open ? (
        <div className="absolute top-full left-0 z-30 mt-1 w-72 rounded-xl border border-neutral-200 bg-white p-3 shadow-lg">
          <div className="flex gap-4 border-b border-neutral-200 pb-2 text-sm">
            <button
              type="button"
              className={cn(
                "pb-2 font-medium transition-colors",
                tab === "upload"
                  ? "border-b-2 border-foreground text-foreground"
                  : "text-neutral-500",
              )}
              onClick={() => setTab("upload")}
            >
              Загрузка
            </button>
            <button
              type="button"
              className={cn(
                "pb-2 font-medium transition-colors",
                tab === "link"
                  ? "border-b-2 border-foreground text-foreground"
                  : "text-neutral-500",
              )}
              onClick={() => setTab("link")}
            >
              Ссылка
            </button>
          </div>

          {tab === "upload" ? (
            <div className="pt-3">
              <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                className="hidden"
                disabled={disabled || uploading}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    void handleUpload(file);
                  }
                  event.target.value = "";
                }}
              />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={disabled || uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading
                  ? "Загрузка…"
                  : kind === "image"
                    ? "Загрузить файл"
                    : "Выбрать файл"}
              </Button>
            </div>
          ) : (
            <div className="space-y-2 pt-3">
              <input
                value={linkValue}
                onChange={(event) => setLinkValue(event.target.value)}
                placeholder="https://"
                disabled={disabled}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleLink();
                  }
                }}
              />
              <Button type="button" className="w-full" disabled={disabled} onClick={handleLink}>
                Применить
              </Button>
            </div>
          )}

          {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
