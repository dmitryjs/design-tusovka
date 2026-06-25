"use client";

import { ImageIcon } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import {
  filterCalloutIconOptions,
  resolveCalloutIcon,
} from "@/lib/content/callout-icons";
import { computeFloatingPanelCoords } from "@/lib/ui/floating-panel-position";
import { cn } from "@/lib/utils";

type CalloutIconPickerProps = {
  value: string | null | undefined;
  onChange: (icon: string | null) => void;
  disabled?: boolean;
  tone?: "info" | "warning" | "success";
};

const TONE_ICON_CLASS = {
  info: "text-blue-600",
  warning: "text-amber-700",
  success: "text-emerald-700",
} as const;

export function CalloutIconPicker({
  value,
  onChange,
  disabled,
  tone = "info",
}: CalloutIconPickerProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<ReturnType<typeof computeFloatingPanelCoords> | null>(
    null,
  );

  const SelectedIcon = resolveCalloutIcon(value);
  const filtered = useMemo(() => filterCalloutIconOptions(query), [query]);

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
    if (!open || !buttonRef.current || !panelRef.current) {
      return;
    }

    function updatePosition() {
      const anchor = buttonRef.current;
      const panel = panelRef.current;
      if (!anchor || !panel) {
        return;
      }

      const panelWidth = panel.offsetWidth || Math.min(320, window.innerWidth - 24);
      const chromeHeight = headerRef.current?.offsetHeight ?? 52;

      setCoords(
        computeFloatingPanelCoords({
          anchorRect: anchor.getBoundingClientRect(),
          panelWidth,
          chromeHeight,
        }),
      );
    }

    updatePosition();

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [filtered.length, open, query]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || buttonRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const panel =
    open && mounted ? (
      <div
        ref={panelRef}
        className="fixed z-[100] w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg"
        style={
          coords
            ? { top: coords.top, left: coords.left }
            : { top: -9999, left: -9999, visibility: "hidden" as const }
        }
        role="listbox"
        aria-label="Выбор иконки"
      >
        <div ref={headerRef} className="border-b border-neutral-200 p-2">
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Поиск иконки…"
            className="h-9 w-full rounded-lg border-0 bg-neutral-50 px-3 text-sm outline-none"
          />
        </div>

        <div
          className="overflow-y-auto overscroll-y-contain p-2"
          style={{ maxHeight: coords?.listMaxHeight ?? 280 }}
        >
          {value ? (
            <button
              type="button"
              className="mb-2 w-full rounded-lg px-3 py-2 text-left text-sm text-neutral-500 hover:bg-neutral-50"
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
            >
              Без иконки
            </button>
          ) : null}

          {filtered.length > 0 ? (
            <div className="grid grid-cols-4 gap-1">
              {filtered.map((option) => {
                const Icon = resolveCalloutIcon(option.id);
                if (!Icon) {
                  return null;
                }

                const isSelected = value === option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    title={option.label}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-center hover:bg-neutral-50",
                      isSelected && "bg-primary/10 ring-1 ring-primary/30",
                    )}
                    onClick={() => {
                      onChange(option.id);
                      setOpen(false);
                    }}
                  >
                    <Icon className={cn("size-5", TONE_ICON_CLASS[tone])} aria-hidden />
                    <span className="line-clamp-2 text-[10px] leading-3 text-neutral-600">
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="px-2 py-6 text-center text-sm text-neutral-500">Ничего не найдено</p>
          )}
        </div>
      </div>
    ) : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-dashed transition-colors",
          SelectedIcon
            ? "border-transparent bg-white/70 hover:bg-white"
            : "border-neutral-300 bg-white/50 text-neutral-400 hover:border-neutral-400 hover:text-neutral-600",
          disabled && "pointer-events-none opacity-50",
        )}
        aria-label={SelectedIcon ? "Изменить иконку" : "Добавить иконку"}
        title={SelectedIcon ? "Изменить иконку" : "Добавить иконку"}
      >
        {SelectedIcon ? (
          <SelectedIcon className={cn("size-5", TONE_ICON_CLASS[tone])} aria-hidden />
        ) : (
          <ImageIcon className="size-4" aria-hidden />
        )}
      </button>
      {panel ? createPortal(panel, document.body) : null}
    </>
  );
}
