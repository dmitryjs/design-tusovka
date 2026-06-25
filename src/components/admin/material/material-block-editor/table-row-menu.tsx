"use client";

import { forwardRef, useEffect, useRef } from "react";
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Eraser,
  GripVertical,
  Trash2,
} from "lucide-react";

import { cn } from "@/lib/utils";

type TableRowMenuProps = {
  open: boolean;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  rowIndex: number;
  canDelete: boolean;
  onClose: () => void;
  onInsertAbove: () => void;
  onInsertBelow: () => void;
  onDuplicate: () => void;
  onClear: () => void;
  onDelete: () => void;
};

const MENU_ITEMS = [
  { id: "insert-above", label: "Вставить сверху", icon: ArrowUp },
  { id: "insert-below", label: "Вставить снизу", icon: ArrowDown },
  { id: "duplicate", label: "Дублировать", icon: Copy, shortcut: "Ctrl+D" },
  { id: "clear", label: "Очистить содержимое", icon: Eraser },
  { id: "delete", label: "Удалить", icon: Trash2, destructive: true },
] as const;

export const TableRowGrip = forwardRef<
  HTMLButtonElement,
  { onClick: () => void; className?: string }
>(function TableRowGrip({ onClick, className }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      className={cn(
        "flex size-5 items-center justify-center rounded-md border border-primary bg-white text-primary shadow-sm hover:bg-blue-50",
        className,
      )}
      aria-label="Управление строкой"
    >
      <GripVertical className="size-3.5" aria-hidden />
    </button>
  );
});

export function TableRowMenu({
  open,
  anchorRef,
  rowIndex,
  canDelete,
  onClose,
  onInsertAbove,
  onInsertBelow,
  onDuplicate,
  onClear,
  onDelete,
}: TableRowMenuProps) {
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
        top: rect.top + rect.height / 2,
        left: rect.right + 6,
        transform: "translateY(-50%)",
      }}
      role="menu"
      aria-label={`Строка ${rowIndex + 1}`}
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
                case "insert-above":
                  onInsertAbove();
                  break;
                case "insert-below":
                  onInsertBelow();
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
