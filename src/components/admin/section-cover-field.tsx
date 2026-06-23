"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { ImageIcon, Trash2 } from "lucide-react";

import { uploadSectionCoverAction } from "@/app/actions/admin/media";
import { Button } from "@/components/ui/button";
import { resolveMaterialCoverUrl } from "@/lib/catalog/material-cover";
import { cn } from "@/lib/utils";

type SectionCoverFieldProps = {
  coverPath: string | null;
  disabled?: boolean;
  onChange: (coverPath: string | null) => void;
};

export function SectionCoverField({
  coverPath,
  disabled,
  onChange,
}: SectionCoverFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, startUpload] = useTransition();

  const coverUrl = resolveMaterialCoverUrl(coverPath);

  function handlePickFile() {
    setError(null);
    inputRef.current?.click();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setError(null);
    const formData = new FormData();
    formData.set("file", file);

    startUpload(async () => {
      const result = await uploadSectionCoverAction(formData);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      onChange(result.url);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-foreground">Обложка раздела</span>

      <div
        className={cn(
          "relative aspect-[2/1] w-full overflow-hidden rounded-xl bg-neutral-100",
          !coverUrl && "border border-dashed border-neutral-300",
        )}
      >
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt=""
            fill
            sizes="(min-width: 1024px) 480px, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center text-sm text-neutral-500">
            <ImageIcon className="size-8 text-neutral-400" aria-hidden />
            <span>Обложка для страницы раздела и карточек каталога</span>
          </div>
        )}
      </div>

      {error ? <p className="text-sm text-destructive-foreground">{error}</p> : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={disabled || isUploading}
          onClick={handlePickFile}
        >
          {isUploading ? "Загрузка…" : coverUrl ? "Заменить обложку" : "Загрузить обложку"}
        </Button>
        {coverUrl ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled || isUploading}
            onClick={() => {
              setError(null);
              onChange(null);
            }}
          >
            <Trash2 className="size-4" aria-hidden />
            Удалить
          </Button>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        disabled={disabled || isUploading}
        onChange={handleFileChange}
      />

      <p className="text-xs text-neutral-500">
        Рекомендуемый формат: горизонтальное изображение 1200×600 или больше.
      </p>
    </div>
  );
}
