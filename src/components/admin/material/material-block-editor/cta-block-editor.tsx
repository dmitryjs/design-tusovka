"use client";

import { Search } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState, useTransition } from "react";

import { searchPromoTargetsAction } from "@/app/actions/admin/products";
import { MaterialCtaBanner } from "@/components/content/material-cta-banner";
import { Input } from "@/components/ui/input";
import type { MaterialBlock } from "@/lib/content/material-blocks";
import type { CtaBlockData } from "@/lib/content/cta-block";
import { resolveMaterialCoverUrl } from "@/lib/catalog/material-cover";
import type { AdminPromoTargetOption } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

type CtaBlockEditorProps = {
  block: Extract<MaterialBlock, { type: "cta" }>;
  onChange: (block: MaterialBlock) => void;
  disabled?: boolean;
};

function updateCtaData(
  block: Extract<MaterialBlock, { type: "cta" }>,
  patch: Partial<CtaBlockData>,
): MaterialBlock {
  return {
    ...block,
    data: {
      ...block.data,
      ...patch,
    },
  };
}

function PromoTargetOption({
  option,
  onSelect,
}: {
  option: AdminPromoTargetOption;
  onSelect: (option: AdminPromoTargetOption) => void;
}) {
  const coverUrl = resolveMaterialCoverUrl(option.coverPath);

  return (
    <button
      type="button"
      onClick={() => onSelect(option)}
      className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-neutral-50"
    >
      <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-neutral-100">
        {coverUrl ? (
          <Image src={coverUrl} alt="" fill sizes="48px" className="object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center text-[10px] text-neutral-400">
            Нет
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{option.title}</p>
        <p className="line-clamp-1 text-xs text-neutral-500">{option.description}</p>
      </div>
    </button>
  );
}

export function CtaBlockEditor({ block, onChange, disabled }: CtaBlockEditorProps) {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<AdminPromoTargetOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const selectedFormat = useMemo(() => {
    if (block.data.targetKind !== "material") {
      return null;
    }

    return options.find((item) => item.id === block.data.targetProductId)?.materialFormat ?? null;
  }, [block.data.targetKind, block.data.targetProductId, options]);

  useEffect(() => {
    if (!pickerOpen) {
      return;
    }

    startTransition(async () => {
      const result = await searchPromoTargetsAction(query);
      if (Array.isArray(result)) {
        setOptions(result);
        setError(null);
        return;
      }

      setError(result.error);
    });
  }, [pickerOpen, query]);

  function selectTarget(option: AdminPromoTargetOption) {
    onChange(
      updateCtaData(block, {
        targetKind: option.kind,
        targetProductId: option.id,
        targetSlug: option.slug,
        title: option.title,
        description: option.description,
        coverPath: option.coverPath,
        url: option.href,
        buttonLabel: block.data.buttonLabel.trim() || "Перейти",
      }),
    );
    setPickerOpen(false);
    setQuery("");
  }

  return (
    <div className="space-y-3">
      <MaterialCtaBanner
        data={block.data}
        materialFormat={selectedFormat}
        className={disabled ? "opacity-60" : undefined}
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setPickerOpen((open) => !open)}
          className={cn(
            "rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-neutral-50",
            disabled && "pointer-events-none opacity-50",
          )}
        >
          {block.data.targetProductId ? "Изменить материал" : "Выбрать материал"}
        </button>
      </div>

      {pickerOpen ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm">
          <div className="relative mb-2">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400"
              aria-hidden
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Поиск по названию или slug"
              className="pl-9"
              disabled={disabled || isPending}
            />
          </div>

          {error ? <p className="mb-2 text-sm text-destructive-foreground">{error}</p> : null}

          <div className="max-h-56 overflow-y-auto">
            {isPending && options.length === 0 ? (
              <p className="px-2 py-3 text-sm text-neutral-500">Загрузка…</p>
            ) : null}

            {!isPending && options.length === 0 ? (
              <p className="px-2 py-3 text-sm text-neutral-500">Ничего не найдено</p>
            ) : null}

            {options.map((option) => (
              <PromoTargetOption key={option.id} option={option} onSelect={selectTarget} />
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-2">
        <label className="block space-y-1">
          <span className="text-xs text-neutral-500">Заголовок</span>
          <Input
            value={block.data.title}
            disabled={disabled}
            onChange={(event) => onChange(updateCtaData(block, { title: event.target.value }))}
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs text-neutral-500">Текст кнопки</span>
          <Input
            value={block.data.buttonLabel}
            disabled={disabled}
            onChange={(event) =>
              onChange(updateCtaData(block, { buttonLabel: event.target.value }))
            }
          />
        </label>
      </div>

      <label className="block space-y-1">
        <span className="text-xs text-neutral-500">Описание</span>
        <textarea
          value={block.data.description}
          disabled={disabled}
          rows={2}
          onChange={(event) =>
            onChange(updateCtaData(block, { description: event.target.value }))
          }
          className="w-full resize-none rounded-lg border border-neutral-300 px-3 py-2 text-sm leading-5 outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-blue-100"
        />
      </label>

      <label className="block space-y-1">
        <span className="text-xs text-neutral-500">Ссылка (заполняется при выборе материала)</span>
        <Input
          value={block.data.url}
          disabled={disabled}
          placeholder="/materials/slug"
          onChange={(event) =>
            onChange(
              updateCtaData(block, {
                url: event.target.value,
                targetKind: event.target.value.trim() ? "custom" : block.data.targetKind,
              }),
            )
          }
        />
      </label>
    </div>
  );
}
