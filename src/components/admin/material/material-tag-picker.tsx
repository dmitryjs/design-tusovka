"use client";

import Link from "next/link";
import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type TagOption = {
  value: string;
  label: string;
};

type MaterialTagPickerProps = {
  tags: TagOption[];
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
  disabled?: boolean;
};

export function MaterialTagPicker({
  tags,
  selectedTagIds,
  onChange,
  disabled,
}: MaterialTagPickerProps) {
  const [query, setQuery] = useState("");

  const selectedTags = useMemo(
    () => tags.filter((tag) => selectedTagIds.includes(tag.value)),
    [tags, selectedTagIds],
  );

  const suggestions = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return tags.filter((tag) => {
      if (selectedTagIds.includes(tag.value)) {
        return false;
      }

      if (!normalized) {
        return true;
      }

      return tag.label.toLowerCase().includes(normalized);
    });
  }, [tags, query, selectedTagIds]);

  function addTag(tagId: string) {
    if (selectedTagIds.includes(tagId)) {
      return;
    }

    onChange([...selectedTagIds, tagId]);
    setQuery("");
  }

  function removeTag(tagId: string) {
    onChange(selectedTagIds.filter((id) => id !== tagId));
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="tag-search">
          Теги
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400"
            aria-hidden
          />
          <Input
            id="tag-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            disabled={disabled || tags.length === 0}
            placeholder="Найти тег и добавить…"
            className="pl-9"
            onKeyDown={(event) => {
              if (event.key === "Enter" && suggestions[0]) {
                event.preventDefault();
                addTag(suggestions[0].value);
              }
            }}
          />
        </div>
        {tags.length === 0 ? (
          <p className="text-sm text-neutral-500">
            Тегов пока нет.{" "}
            <Link href="/admin/tags" className="text-primary hover:underline">
              Создать тег
            </Link>
          </p>
        ) : null}
      </div>

      {query.trim() && suggestions.length > 0 ? (
        <ul className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          {suggestions.slice(0, 8).map((tag) => (
            <li key={tag.value}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => addTag(tag.value)}
                className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-neutral-50"
              >
                <span>{tag.label}</span>
                <span className="text-xs text-neutral-400">Добавить</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="space-y-2">
        <p className="text-xs font-medium tracking-wide text-neutral-500 uppercase">
          Выбранные теги
        </p>
        {selectedTags.length === 0 ? (
          <p className="text-sm text-neutral-500">Теги не выбраны</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <span
                key={tag.value}
                className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm text-foreground"
              >
                {tag.label}
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => removeTag(tag.value)}
                  className={cn(
                    "rounded-full p-0.5 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-700",
                    disabled && "pointer-events-none opacity-50",
                  )}
                  aria-label={`Удалить тег ${tag.label}`}
                >
                  <X className="size-3.5" aria-hidden />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
