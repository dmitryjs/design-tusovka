"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  MATERIAL_BLOCK_DEFINITIONS,
  type MaterialBlockDefinition,
  type MaterialBlockType,
} from "@/lib/content/material-blocks";

type MaterialBlockPickerProps = {
  open: boolean;
  position: { top: number; left: number } | null;
  onClose: () => void;
  onSelect: (type: MaterialBlockType) => void;
};

const CATEGORY_LABELS = {
  text: "Текстовые",
  media: "Медиа и данные",
  layout: "Блоки оформления",
} as const;

export function MaterialBlockPicker({
  open,
  position,
  onClose,
  onSelect,
}: MaterialBlockPickerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return MATERIAL_BLOCK_DEFINITIONS;
    }

    return MATERIAL_BLOCK_DEFINITIONS.filter(
      (item) =>
        item.label.toLowerCase().includes(normalized) ||
        item.description.toLowerCase().includes(normalized),
    );
  }, [query]);

  const groups = useMemo(() => {
    const map: Record<MaterialBlockDefinition["category"], MaterialBlockDefinition[]> = {
      text: [],
      media: [],
      layout: [],
    };

    for (const item of filtered) {
      map[item.category].push(item);
    }

    return map;
  }, [filtered]);

  useEffect(() => {
    if (!open) {
      return;
    }

    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (panelRef.current?.contains(target)) {
        return;
      }
      onClose();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || !position) {
    return null;
  }

  return (
    <div
      ref={panelRef}
      className="fixed z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg"
      style={{ top: position.top, left: position.left }}
      role="listbox"
      aria-label="Выбор блока"
    >
      <div className="border-b border-neutral-200 p-2">
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Введите название блока…"
          className="h-9 w-full rounded-lg border-0 bg-neutral-50 px-3 text-sm outline-none"
        />
      </div>

      <div className="max-h-80 overflow-y-auto p-1">
        {(Object.keys(groups) as Array<keyof typeof groups>).map((category) =>
          groups[category].length > 0 ? (
            <section key={category} className="py-1">
              <p className="px-3 py-1.5 text-xs font-medium tracking-wide text-neutral-400 uppercase">
                {CATEGORY_LABELS[category]}
              </p>
              <ul>
                {groups[category].map((item) => (
                  <li key={item.type}>
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-neutral-50"
                      onClick={() => {
                        onSelect(item.type);
                        setQuery("");
                        onClose();
                      }}
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-sm text-neutral-600">
                        {item.icon}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-foreground">
                          {item.label}
                        </span>
                        <span className="block text-xs text-neutral-500">
                          {item.description}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ) : null,
        )}
        {filtered.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-neutral-500">Ничего не найдено</p>
        ) : null}
      </div>
    </div>
  );
}
