"use client";

import { useEffect, useRef, useState } from "react";
import { Bold, Italic, Link2, Strikethrough, Underline, X } from "lucide-react";

const TEXT_COLORS = [
  { label: "По умолчанию", value: "" },
  { label: "Серый", value: "#6B7280" },
  { label: "Коричневый", value: "#92400E" },
  { label: "Оранжевый", value: "#EA580C" },
  { label: "Жёлтый", value: "#CA8A04" },
  { label: "Зелёный", value: "#16A34A" },
  { label: "Синий", value: "#2563EB" },
  { label: "Фиолетовый", value: "#7C3AED" },
  { label: "Розовый", value: "#DB2777" },
  { label: "Красный", value: "#DC2626" },
];

const HIGHLIGHT_COLORS = [
  { label: "Без фона", value: "" },
  { label: "Серый", value: "#F3F4F6" },
  { label: "Коричневый", value: "#FEF3C7" },
  { label: "Оранжевый", value: "#FFEDD5" },
  { label: "Жёлтый", value: "#FEF9C3" },
  { label: "Зелёный", value: "#DCFCE7" },
  { label: "Синий", value: "#DBEAFE" },
  { label: "Фиолетовый", value: "#EDE9FE" },
  { label: "Розовый", value: "#FCE7F3" },
  { label: "Красный", value: "#FEE2E2" },
];

type TextFormatToolbarProps = {
  containerRef: React.RefObject<HTMLElement | null>;
  disabled?: boolean;
};

type ToolbarPosition = {
  top: number;
  left: number;
};

export function TextFormatToolbar({ containerRef, disabled }: TextFormatToolbarProps) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState<ToolbarPosition>({ top: 0, left: 0 });
  const [showColors, setShowColors] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      if (disabled) {
        setVisible(false);
        return;
      }

      const container = containerRef.current;
      const selection = window.getSelection();

      if (!container || !selection || selection.rangeCount === 0 || selection.isCollapsed) {
        setVisible(false);
        setShowColors(false);
        return;
      }

      const range = selection.getRangeAt(0);
      const anchor = range.commonAncestorContainer;

      if (!container.contains(anchor)) {
        setVisible(false);
        return;
      }

      const rect = range.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) {
        setVisible(false);
        return;
      }

      setPosition({
        top: rect.bottom + window.scrollY + 8,
        left: Math.max(8, rect.left + window.scrollX - 40),
      });
      setVisible(true);
    };

    document.addEventListener("selectionchange", update);
    document.addEventListener("mouseup", update);
    document.addEventListener("keyup", update);

    return () => {
      document.removeEventListener("selectionchange", update);
      document.removeEventListener("mouseup", update);
      document.removeEventListener("keyup", update);
    };
  }, [containerRef, disabled]);

  if (!visible) {
    return null;
  }

  const exec = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    containerRef.current?.dispatchEvent(new Event("input", { bubbles: true }));
  };

  const applyLink = () => {
    const url = window.prompt("Введите ссылку", "https://");
    if (!url?.trim()) {
      return;
    }
    exec("createLink", url.trim());
  };

  return (
    <div
      ref={toolbarRef}
      className="fixed z-50 w-64 rounded-xl border border-neutral-200 bg-white p-2 shadow-lg"
      style={{ top: position.top, left: position.left }}
      onMouseDown={(event) => event.preventDefault()}
    >
      {showColors ? (
        <div className="space-y-3 p-1">
          <div>
            <p className="mb-1 text-xs text-neutral-500">Цвет текста</p>
            <div className="grid grid-cols-5 gap-1">
              {TEXT_COLORS.map((color) => (
                <button
                  key={color.label}
                  type="button"
                  title={color.label}
                  className="flex h-7 items-center justify-center rounded-md border border-neutral-200 text-xs font-semibold hover:bg-neutral-50"
                  style={{ color: color.value || "#111827" }}
                  onClick={() => {
                    exec("foreColor", color.value || "#111827");
                    setShowColors(false);
                  }}
                >
                  A
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1 text-xs text-neutral-500">Цвет фона</p>
            <div className="grid grid-cols-5 gap-1">
              {HIGHLIGHT_COLORS.map((color) => (
                <button
                  key={color.label}
                  type="button"
                  title={color.label}
                  className="h-7 rounded-md border border-neutral-200 hover:ring-1 hover:ring-neutral-300"
                  style={{ backgroundColor: color.value || "#FFFFFF" }}
                  onClick={() => {
                    exec("hiliteColor", color.value || "transparent");
                    setShowColors(false);
                  }}
                />
              ))}
            </div>
          </div>
          <button
            type="button"
            className="text-xs text-neutral-500 hover:text-foreground"
            onClick={() => setShowColors(false)}
          >
            Назад
          </button>
        </div>
      ) : (
        <div className="space-y-1">
          <div className="flex flex-wrap gap-0.5">
            <ToolbarButton title="Цвет" onClick={() => setShowColors(true)}>
              <span className="text-sm font-semibold">A</span>
            </ToolbarButton>
            <ToolbarButton title="Жирный" onClick={() => exec("bold")}>
              <Bold className="size-3.5" />
            </ToolbarButton>
            <ToolbarButton title="Курсив" onClick={() => exec("italic")}>
              <Italic className="size-3.5" />
            </ToolbarButton>
            <ToolbarButton title="Подчёркивание" onClick={() => exec("underline")}>
              <Underline className="size-3.5" />
            </ToolbarButton>
            <ToolbarButton title="Очистить формат" onClick={() => exec("removeFormat")}>
              <X className="size-3.5" />
            </ToolbarButton>
          </div>
          <div className="flex flex-wrap gap-0.5">
            <ToolbarButton title="Ссылка" onClick={applyLink}>
              <Link2 className="size-3.5" />
            </ToolbarButton>
            <ToolbarButton title="Зачёркнутый" onClick={() => exec("strikeThrough")}>
              <Strikethrough className="size-3.5" />
            </ToolbarButton>
          </div>
        </div>
      )}
    </div>
  );
}

function ToolbarButton({
  children,
  title,
  onClick,
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      className="flex size-7 items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-100"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
