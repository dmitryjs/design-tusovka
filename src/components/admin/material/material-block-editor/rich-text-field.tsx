"use client";

import { useEffect, useRef } from "react";

import { normalizeRichTextValue, richTextToPlainText, sanitizeRichHtml } from "@/lib/content/rich-text";
import { RICH_TEXT_FORMAT_CLASS } from "@/lib/content/rich-text-content";
import { cn } from "@/lib/utils";

import { TextFormatToolbar } from "./text-format-toolbar";

type RichTextFieldProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  singleLine?: boolean;
  onEnter?: () => void;
  onBackspaceEmpty?: () => void;
  onSlash?: () => void;
  onFocus?: () => void;
  inputRef?: React.RefObject<HTMLDivElement | null>;
};

export function RichTextField({
  value,
  onChange,
  disabled,
  placeholder,
  className,
  autoFocus,
  singleLine,
  onEnter,
  onBackspaceEmpty,
  onSlash,
  onFocus,
  inputRef,
}: RichTextFieldProps) {
  const localRef = useRef<HTMLDivElement>(null);
  const ref = inputRef ?? localRef;
  const lastHtmlRef = useRef<string | null>(null);

  useEffect(() => {
    try {
      document.execCommand("defaultParagraphSeparator", false, "br");
    } catch {
      // execCommand may be unavailable in some environments
    }
  }, []);

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }

    if (lastHtmlRef.current === value) {
      return;
    }

    if (document.activeElement === node) {
      lastHtmlRef.current = value;
      return;
    }

    node.innerHTML = sanitizeRichHtml(normalizeRichTextValue(value));
    lastHtmlRef.current = value;
  }, [ref, value]);

  useEffect(() => {
    if (!autoFocus) {
      return;
    }

    const node = ref.current;
    if (!node) {
      return;
    }

    node.focus();
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(node);
    range.collapse(false);
    selection?.removeAllRanges();
    selection?.addRange(range);
  }, [autoFocus, ref]);

  return (
    <>
      <div
        ref={ref}
        contentEditable={!disabled}
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onFocus={() => onFocus?.()}
        onBlur={() => {
          const node = ref.current;
          if (!node) {
            return;
          }

          const cleaned = sanitizeRichHtml(node.innerHTML);
          if (cleaned !== node.innerHTML) {
            node.innerHTML = cleaned;
            lastHtmlRef.current = cleaned;
            onChange(cleaned);
          }
        }}
        onInput={() => {
          const html = ref.current?.innerHTML ?? "";
          lastHtmlRef.current = html;
          onChange(html);
        }}
        onKeyDown={(event) => {
          if (singleLine && event.key === "Enter") {
            event.preventDefault();
            onEnter?.();
            return;
          }

          if (event.key === "Enter" && !event.shiftKey && !singleLine) {
            event.preventDefault();
            onEnter?.();
            return;
          }

          const plain = richTextToPlainText(ref.current?.innerHTML ?? "");

          if (event.key === "Backspace" && plain.length === 0) {
            event.preventDefault();
            onBackspaceEmpty?.();
            return;
          }

          if (event.key === "/" && plain.length === 0) {
            event.preventDefault();
            onSlash?.();
          }
        }}
        className={cn(
          "notion-rich-text w-full border-0 bg-transparent p-0 shadow-none outline-none focus:ring-0",
          RICH_TEXT_FORMAT_CLASS,
          "empty:before:pointer-events-none empty:before:text-neutral-300 empty:before:content-[attr(data-placeholder)]",
          className,
        )}
      />
      <TextFormatToolbar containerRef={ref} disabled={disabled} />
    </>
  );
}
