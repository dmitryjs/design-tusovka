"use client";

import { Search, X } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";

import { findOrCreateTagByNameAction } from "@/app/actions/admin/tags";
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

function sortTags(tags: TagOption[]): TagOption[] {
  return [...tags].sort((left, right) =>
    left.label.localeCompare(right.label, "ru"),
  );
}

export function MaterialTagPicker({
  tags,
  selectedTagIds,
  onChange,
  disabled,
}: MaterialTagPickerProps) {
  const [query, setQuery] = useState("");
  const [catalog, setCatalog] = useState<TagOption[]>(() => sortTags(tags));
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setCatalog((current) => {
      const merged = new Map<string, TagOption>();

      for (const tag of [...current, ...tags]) {
        merged.set(tag.value, tag);
      }

      return sortTags([...merged.values()]);
    });
  }, [tags]);

  const selectedTags = useMemo(
    () => catalog.filter((tag) => selectedTagIds.includes(tag.value)),
    [catalog, selectedTagIds],
  );

  const suggestions = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return catalog.filter((tag) => {
      if (selectedTagIds.includes(tag.value)) {
        return false;
      }

      if (!normalized) {
        return false;
      }

      return tag.label.toLowerCase().includes(normalized);
    });
  }, [catalog, query, selectedTagIds]);

  const trimmedQuery = query.trim();
  const hasExactMatch = useMemo(() => {
    if (!trimmedQuery) {
      return false;
    }

    const normalized = trimmedQuery.toLowerCase();
    return catalog.some((tag) => tag.label.toLowerCase() === normalized);
  }, [catalog, trimmedQuery]);

  function addTag(tagId: string) {
    if (selectedTagIds.includes(tagId)) {
      return;
    }

    onChange([...selectedTagIds, tagId]);
    setQuery("");
    setError(null);
  }

  function removeTag(tagId: string) {
    onChange(selectedTagIds.filter((id) => id !== tagId));
  }

  function commitQuery() {
    const name = query.trim();
    if (!name || disabled || isPending) {
      return;
    }

    const existing = catalog.find(
      (tag) => tag.label.toLowerCase() === name.toLowerCase(),
    );

    if (existing) {
      addTag(existing.value);
      return;
    }

    startTransition(async () => {
      setError(null);
      const result = await findOrCreateTagByNameAction(name);

      if (!result.ok || !result.data) {
        setError(result.error ?? "Не удалось добавить тег");
        return;
      }

      const option = { value: result.data.id, label: result.data.name };
      setCatalog((current) => {
        if (current.some((tag) => tag.value === option.value)) {
          return current;
        }

        return sortTags([...current, option]);
      });
      onChange([...selectedTagIds, result.data.id]);
      setQuery("");
    });
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
            onChange={(event) => {
              setQuery(event.target.value);
              setError(null);
            }}
            disabled={disabled || isPending}
            placeholder="Введите тег и нажмите Enter"
            className="pl-9"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                commitQuery();
              }
            }}
          />
        </div>
        <p className="text-xs text-neutral-500">
          Любой текст станет тегом после Enter. Повторное имя подставит существующий тег.
        </p>
        {error ? <p className="text-sm text-destructive-foreground">{error}</p> : null}
      </div>

      {trimmedQuery && (suggestions.length > 0 || !hasExactMatch) ? (
        <ul className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          {suggestions.slice(0, 8).map((tag) => (
            <li key={tag.value}>
              <button
                type="button"
                disabled={disabled || isPending}
                onClick={() => addTag(tag.value)}
                className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-neutral-50"
              >
                <span>{tag.label}</span>
                <span className="text-xs text-neutral-400">Добавить</span>
              </button>
            </li>
          ))}
          {!hasExactMatch ? (
            <li>
              <button
                type="button"
                disabled={disabled || isPending}
                onClick={commitQuery}
                className="flex w-full items-center justify-between border-t border-neutral-100 px-4 py-2.5 text-left text-sm hover:bg-neutral-50"
              >
                <span>Создать «{trimmedQuery}»</span>
                <span className="text-xs text-neutral-400">Enter</span>
              </button>
            </li>
          ) : null}
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
