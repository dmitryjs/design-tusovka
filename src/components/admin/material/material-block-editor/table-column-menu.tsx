"use client";

import { forwardRef, useEffect, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Copy,
  Eraser,
  GripVertical,
  Trash2,
} from "lucide-react";

import { cn } from "@/lib/utils";

type TableColumnMenuProps = {
  open: boolean;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  columnIndex: number;
  canDelete: boolean;
  onClose: () => void;
  onInsertLeft: () => void;
  onInsertRight: () => void;
  onDuplicate: () => void;
  onClear: () => void;
  onDelete: () => void;
};

const MENU_ITEMS = [
  { id: "insert-left", label: "Вставить слева", icon: ArrowLeft },
  { id: "insert-right", label: "Вставить справа", icon: ArrowRight },
  { id: "duplicate", label: "Дублировать", icon: Copy, shortcut: "Ctrl+D" },
  { id: "clear", label: "Очистить содержимое", icon: Eraser },
  { id: "delete", label: "Удалить", icon: Trash2, destructive: true },
] as const;

export const TableColumnGrip = forwardRef<
  HTMLButtonElement,
  { onClick: () => void; className?: string }
>(function TableColumnGrip({ onClick, className }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      className={cn(
        "flex size-5 items-center justify-center rounded-md border border-primary bg-white text-primary shadow-sm hover:bg-blue-50",
        className,
      )}
      aria-label="Управление колонкой"
    >
      <GripVertical className="size-3.5" aria-hidden />
    </button>
  );
});

export function TableColumnMenu({
  open,
  anchorRef,
  columnIndex,
  canDelete,
  onClose,
  onInsertLeft,
  onInsertRight,
  onDuplicate,
  onClear,
  onDelete,
}: TableColumnMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (
        panelRef.current?.contains(target) ||
        anchorRef.current?.contains(target)
      ) {
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
  }, [anchorRef, onClose, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleShortcut(event: KeyboardEvent) {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "d") {
        return;
      }
      event.preventDefault();
      onDuplicate();
      onClose();
    }

    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, [onClose, onDuplicate, open]);

  if (!open || !anchorRef.current) {
    return null;
  }

  const rect = anchorRef.current.getBoundingClientRect();

  return (
    <div
      ref={panelRef}
      className="fixed z-50 w-56 rounded-xl border border-neutral-200 bg-white py-1 shadow-lg"
      style={{
        top: rect.bottom + 6,
        left: Math.max(12, rect.left + rect.width / 2 - 112),
      }}
      role="menu"
      aria-label={`Колонка ${columnIndex + 1}`}
    >
      {MENU_ITEMS.map((item) => {
        const isDestructive = item.id === "delete";
        const disabled = isDestructive && !canDelete;

        return (
          <button
            key={item.id}
            type="button"
            role="menuitem"
            disabled={disabled}
            className={cn(
              "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors",
              disabled
                ? "cursor-not-allowed text-neutral-400"
                : isDestructive
                  ? "text-destructive-foreground hover:bg-destructive-bg"
                  : "text-neutral-800 hover:bg-neutral-100",
            )}
            onClick={() => {
              if (disabled) {
                return;
              }

              switch (item.id) {
                case "insert-left":
                  onInsertLeft();
                  break;
                case "insert-right":
                  onInsertRight();
                  break;
                case "duplicate":
                  onDuplicate();
                  break;
                case "clear":
                  onClear();
                  break;
                case "delete":
                  onDelete();
                  break;
              }
              onClose();
            }}
          >
            <item.icon className="size-4 shrink-0" aria-hidden />
            <span className="min-w-0 flex-1">{item.label}</span>
            {"shortcut" in item && item.shortcut ? (
              <span className="text-xs text-neutral-400">{item.shortcut}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
