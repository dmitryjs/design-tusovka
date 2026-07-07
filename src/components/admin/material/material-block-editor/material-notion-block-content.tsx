"use client";

import { useEffect, useRef, useState } from "react";

import { CheckedListMarker } from "@/components/content/checked-list-marker";
import {
  createChecklistItem,
  materialBlockDividerClassName,
  type ChecklistItem,
  type MaterialBlock,
  type MaterialBlockData,
  type MaterialBlockType,
} from "@/lib/content/material-blocks";
import { richTextToPlainText } from "@/lib/content/rich-text";
import { cn } from "@/lib/utils";

import { FileBlockEditor } from "./file-block-editor";
import { CalloutIconPicker } from "./callout-icon-picker";
import { CtaBlockEditor } from "./cta-block-editor";
import { ImageBlockEditor } from "./image-block-editor";
import { RichTextField } from "./rich-text-field";
import { TableBlockEditor } from "./table-block-editor";

function updateData<T extends MaterialBlockType>(
  block: Extract<MaterialBlock, { type: T }>,
  patch: Partial<MaterialBlockData[T]>,
): MaterialBlock {
  return {
    ...block,
    data: {
      ...block.data,
      ...patch,
    },
  } as MaterialBlock;
}

const bareField =
  "w-full resize-none appearance-none border-0 bg-transparent p-0 shadow-none outline-none [background-color:transparent] focus:ring-0 placeholder:text-neutral-300";

type MaterialNotionBlockContentProps = {
  block: MaterialBlock;
  disabled?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  onChange: (block: MaterialBlock) => void;
  onEnter?: () => void;
  onBackspaceEmpty?: () => void;
  onSlash?: () => void;
  inputRef?: React.RefObject<HTMLDivElement | null>;
};

function GhostInput({
  value,
  onChange,
  disabled,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      value={value}
      disabled={disabled}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className={cn(bareField, "text-sm", className)}
    />
  );
}

export function MaterialNotionBlockContent({
  block,
  disabled,
  placeholder,
  autoFocus,
  onChange,
  onEnter,
  onBackspaceEmpty,
  onSlash,
  inputRef,
}: MaterialNotionBlockContentProps) {
  const [focusListIndex, setFocusListIndex] = useState<number | null>(null);

  useEffect(() => {
    if (focusListIndex === null) {
      return;
    }

    const frame = requestAnimationFrame(() => setFocusListIndex(null));
    return () => cancelAnimationFrame(frame);
  }, [focusListIndex]);

  switch (block.type) {
    case "heading1":
      return (
        <RichTextField
          inputRef={inputRef}
          value={block.data.text}
          onChange={(text) => onChange(updateData(block, { text }))}
          disabled={disabled}
          autoFocus={autoFocus}
          singleLine
          placeholder={placeholder ?? "Заголовок 1"}
          className="text-2xl leading-8 font-semibold"
          onEnter={onEnter}
          onBackspaceEmpty={onBackspaceEmpty}
          onSlash={onSlash}
        />
      );
    case "heading2":
      return (
        <RichTextField
          inputRef={inputRef}
          value={block.data.text}
          onChange={(text) => onChange(updateData(block, { text }))}
          disabled={disabled}
          autoFocus={autoFocus}
          singleLine
          placeholder={placeholder ?? "Подзаголовок"}
          className="text-xl leading-7 font-semibold"
          onEnter={onEnter}
          onBackspaceEmpty={onBackspaceEmpty}
          onSlash={onSlash}
        />
      );
    case "heading3":
      return (
        <RichTextField
          inputRef={inputRef}
          value={block.data.text}
          onChange={(text) => onChange(updateData(block, { text }))}
          disabled={disabled}
          autoFocus={autoFocus}
          singleLine
          placeholder={placeholder ?? "Подзаголовок 3"}
          className="text-lg leading-7 font-semibold"
          onEnter={onEnter}
          onBackspaceEmpty={onBackspaceEmpty}
          onSlash={onSlash}
        />
      );
    case "paragraph":
      return (
        <RichTextField
          inputRef={inputRef}
          value={block.data.text}
          onChange={(text) => onChange(updateData(block, { text }))}
          disabled={disabled}
          autoFocus={autoFocus}
          placeholder={placeholder ?? "Нажмите «/» для выбора блока"}
          className="text-sm leading-6"
          onEnter={onEnter}
          onBackspaceEmpty={onBackspaceEmpty}
          onSlash={onSlash}
        />
      );
    case "bulleted_list":
    case "numbered_list":
    case "checked_list":
      return (
        <div className="space-y-1">
          {block.data.items.map((item, index) => (
            <div key={index} className="flex items-start gap-2">
              {block.type === "checked_list" ? (
                <CheckedListMarker />
              ) : (
                <span className="mt-0.5 w-5 shrink-0 text-sm text-neutral-400">
                  {block.type === "numbered_list" ? `${index + 1}.` : "•"}
                </span>
              )}
              <RichTextField
                value={item}
                onChange={(text) =>
                  onChange(
                    updateData(block, {
                      items: block.data.items.map((entry, itemIndex) =>
                        itemIndex === index ? text : entry,
                      ),
                    }),
                  )
                }
                disabled={disabled}
                autoFocus={focusListIndex === index}
                className="text-sm leading-6"
                onEnter={() => {
                  const nextIndex = index + 1;
                  onChange(
                    updateData(block, {
                      items: [
                        ...block.data.items.slice(0, nextIndex),
                        "",
                        ...block.data.items.slice(nextIndex),
                      ],
                    }),
                  );
                  setFocusListIndex(nextIndex);
                }}
                onBackspaceEmpty={() => {
                  if (block.data.items.length <= 1) {
                    return;
                  }

                  onChange(
                    updateData(block, {
                      items: block.data.items.filter((_, itemIndex) => itemIndex !== index),
                    }),
                  );
                  setFocusListIndex(Math.max(0, index - 1));
                }}
              />
            </div>
          ))}
        </div>
      );
    case "checklist":
      return (
        <div className="space-y-1">
          {block.data.items.map((item, index) => (
            <ChecklistRow
              key={item.id}
              item={item}
              disabled={disabled}
              autoFocus={focusListIndex === index}
              onChange={(nextItem) =>
                onChange(
                  updateData(block, {
                    items: block.data.items.map((entry) =>
                      entry.id === item.id ? nextItem : entry,
                    ),
                  }),
                )
              }
              onEnter={() => {
                const nextIndex = index + 1;
                onChange(
                  updateData(block, {
                    items: [
                      ...block.data.items.slice(0, nextIndex),
                      createChecklistItem(),
                      ...block.data.items.slice(nextIndex),
                    ],
                  }),
                );
                setFocusListIndex(nextIndex);
              }}
              onBackspaceEmpty={() => {
                if (block.data.items.length <= 1) {
                  return;
                }

                onChange(
                  updateData(block, {
                    items: block.data.items.filter((_, itemIndex) => itemIndex !== index),
                  }),
                );
                setFocusListIndex(Math.max(0, index - 1));
              }}
            />
          ))}
        </div>
      );
    case "quote":
      return (
        <div className="rounded-r-lg border-l-4 border-primary bg-blue-50 px-4 py-3 text-primary">
          <RichTextField
            value={block.data.text}
            onChange={(text) => onChange(updateData(block, { text }))}
            disabled={disabled}
            placeholder="Цитата"
            className="text-sm leading-6 text-primary"
          />
          <GhostInput
            value={block.data.author}
            onChange={(author) => onChange(updateData(block, { author }))}
            disabled={disabled}
            placeholder="Автор"
            className="mt-2 text-xs text-primary/70"
          />
        </div>
      );
    case "callout_info":
      return <CalloutEditor block={block} onChange={onChange} disabled={disabled} tone="info" />;
    case "callout_warning":
      return (
        <CalloutEditor block={block} onChange={onChange} disabled={disabled} tone="warning" />
      );
    case "callout_success":
      return (
        <CalloutEditor block={block} onChange={onChange} disabled={disabled} tone="success" />
      );
    case "divider":
      return <hr className={materialBlockDividerClassName} aria-hidden />;
    case "image":
      return <ImageBlockEditor block={block} disabled={disabled} onChange={onChange} />;
    case "file":
      return <FileBlockEditor block={block} disabled={disabled} onChange={onChange} />;
    case "table":
      return <TableBlockEditor block={block} disabled={disabled} onChange={onChange} />;
    case "video":
    case "embed":
    case "accordion":
      return (
        <ComplexBlockEditor block={block} onChange={onChange} disabled={disabled} />
      );
    case "cta":
      return (
        <CtaBlockEditor
          block={block as Extract<MaterialBlock, { type: "cta" }>}
          onChange={onChange}
          disabled={disabled}
        />
      );
    default:
      return null;
  }
}

function ChecklistRow({
  item,
  disabled,
  autoFocus,
  onChange,
  onEnter,
  onBackspaceEmpty,
}: {
  item: ChecklistItem;
  disabled?: boolean;
  autoFocus?: boolean;
  onChange: (item: ChecklistItem) => void;
  onEnter?: () => void;
  onBackspaceEmpty?: () => void;
}) {
  return (
    <div className="flex items-start gap-2">
      <input
        type="checkbox"
        checked={item.checked}
        disabled={disabled}
        onChange={(event) => onChange({ ...item, checked: event.target.checked })}
        className="mt-1"
      />
      <RichTextField
        value={item.text}
        onChange={(text) => onChange({ ...item, text })}
        disabled={disabled}
        autoFocus={autoFocus}
        className="text-sm leading-6"
        onEnter={onEnter}
        onBackspaceEmpty={onBackspaceEmpty}
      />
    </div>
  );
}

function CalloutEditor({
  block,
  onChange,
  disabled,
  tone,
}: {
  block: Extract<MaterialBlock, { type: "callout_info" | "callout_warning" | "callout_success" }>;
  onChange: (block: MaterialBlock) => void;
  disabled?: boolean;
  tone: "info" | "warning" | "success";
}) {
  const toneClass = "bg-neutral-100";

  return (
    <div className={cn("flex gap-2 rounded-lg px-3 py-2 text-neutral-900", toneClass)}>
      <CalloutIconPicker
        value={block.data.icon ?? null}
        onChange={(icon) => onChange(updateData(block, { icon }))}
        disabled={disabled}
        tone={tone}
      />
      <div className="min-w-0 flex-1">
        <GhostInput
          value={block.data.title}
          onChange={(title) => onChange(updateData(block, { title }))}
          disabled={disabled}
          placeholder="Заголовок"
          className="font-medium text-neutral-900"
        />
        <RichTextField
          value={block.data.text}
          onChange={(text) => onChange(updateData(block, { text }))}
          disabled={disabled}
          placeholder="Текст блока"
          className="mt-1 text-sm leading-6 text-neutral-900"
        />
      </div>
    </div>
  );
}

function ComplexBlockEditor({
  block,
  onChange,
  disabled,
}: {
  block: MaterialBlock;
  onChange: (block: MaterialBlock) => void;
  disabled?: boolean;
}) {
  if (block.type === "video") {
    return (
      <GhostInput
        value={block.data.url}
        onChange={(url) => onChange(updateData(block, { url }))}
        disabled={disabled}
        placeholder="URL видео"
      />
    );
  }

  if (block.type === "embed") {
    return (
      <div className="space-y-2">
        <GhostInput
          value={block.data.url}
          onChange={(url) => onChange(updateData(block, { url }))}
          disabled={disabled}
          placeholder="URL"
        />
        <GhostInput
          value={block.data.title}
          onChange={(title) => onChange(updateData(block, { title }))}
          disabled={disabled}
          placeholder="Заголовок"
        />
      </div>
    );
  }

  if (block.type === "accordion") {
    return (
      <div className="space-y-1">
        <GhostInput
          value={block.data.title}
          onChange={(title) => onChange(updateData(block, { title }))}
          disabled={disabled}
          placeholder="Заголовок спойлера"
          className="font-medium"
        />
        <RichTextField
          value={block.data.text}
          onChange={(text) => onChange(updateData(block, { text }))}
          disabled={disabled}
          placeholder="Содержимое"
          className="text-sm leading-6"
        />
      </div>
    );
  }

  return null;
}

export function isTextLikeBlock(
  block: MaterialBlock,
): block is Extract<
  MaterialBlock,
  { type: "paragraph" | "heading1" | "heading2" | "heading3" }
> {
  return (
    block.type === "paragraph" ||
    block.type === "heading1" ||
    block.type === "heading2" ||
    block.type === "heading3"
  );
}

export function isBlockEmpty(block: MaterialBlock): boolean {
  if (isTextLikeBlock(block)) {
    return richTextToPlainText(block.data.text).trim().length === 0;
  }

  return false;
}
