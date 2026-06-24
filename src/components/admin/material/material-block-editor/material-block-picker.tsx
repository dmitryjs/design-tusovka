"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import {
  MATERIAL_BLOCK_DEFINITIONS,
  type MaterialBlockDefinition,
  type MaterialBlockType,
} from "@/lib/content/material-blocks";
import {
  computeFloatingPanelCoords,
  type FloatingPanelCoords,
} from "@/lib/ui/floating-panel-position";

type MaterialBlockPickerProps = {
  open: boolean;
  anchor: HTMLElement | null;
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
  anchor,
  onClose,
  onSelect,
}: MaterialBlockPickerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [coords, setCoords] = useState<FloatingPanelCoords | null>(null);
  const [mounted, setMounted] = useState(false);

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
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setCoords(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    inputRef.current?.focus();
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !anchor || !panelRef.current) {
      return;
    }

    function updatePosition() {
      if (!anchor || !panelRef.current) {
        return;
      }

      const panel = panelRef.current;
      const panelWidth = panel.offsetWidth || Math.min(352, window.innerWidth - 24);
      const chromeHeight = headerRef.current?.offsetHeight ?? 52;

      const next = computeFloatingPanelCoords({
        anchorRect: anchor.getBoundingClientRect(),
        panelWidth,
        chromeHeight,
      });

      setCoords(next);

      requestAnimationFrame(() => {
        if (!anchor || !panelRef.current) {
          return;
        }

        const measuredPanel = panelRef.current;
        const actualHeight = measuredPanel.offsetHeight;
        const anchorRect = anchor.getBoundingClientRect();
        const viewportPadding = 12;
        const gap = 8;
        let top = next.top;

        if (next.placement === "below") {
          const bottom = top + actualHeight;
          if (bottom > window.innerHeight - viewportPadding) {
            top = Math.max(
              viewportPadding,
              window.innerHeight - viewportPadding - actualHeight,
            );
          }
        } else {
          top = anchorRect.top - gap - actualHeight;
          if (top < viewportPadding) {
            top = viewportPadding;
          }
        }

        if (top !== next.top) {
          setCoords({ ...next, top });
        }
      });
    }

    updatePosition();

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [anchor, filtered.length, open, query]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || anchor?.contains(target)) {
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
  }, [anchor, onClose, open]);

  if (!open || !anchor || !mounted) {
    return null;
  }

  const panel = (
    <div
      ref={panelRef}
      className="fixed z-[100] w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg"
      style={
        coords
          ? {
              top: coords.top,
              left: coords.left,
            }
          : {
              top: -9999,
              left: -9999,
              visibility: "hidden" as const,
            }
      }
      role="listbox"
      aria-label="Выбор блока"
      data-placement={coords?.placement}
    >
      <div ref={headerRef} className="border-b border-neutral-200 p-2">
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Введите название блока…"
          className="h-9 w-full rounded-lg border-0 bg-neutral-50 px-3 text-sm outline-none"
        />
      </div>

      <div
        className="overflow-y-auto overscroll-y-contain p-1"
        style={{ maxHeight: coords?.listMaxHeight ?? 320 }}
      >
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

  return createPortal(panel, document.body);
}
