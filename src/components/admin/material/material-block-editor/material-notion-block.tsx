"use client";

import { useRef } from "react";
import { GripVertical, Plus, Trash2 } from "lucide-react";

import {
  type MaterialBlock,
  type MaterialBlockType,
} from "@/lib/content/material-blocks";
import { cn } from "@/lib/utils";

import {
  isBlockEmpty,
  MaterialNotionBlockContent,
} from "./material-notion-block-content";

type MaterialNotionBlockProps = {
  block: MaterialBlock;
  disabled?: boolean;
  autoFocus?: boolean;
  isDragging?: boolean;
  isDropTarget?: boolean;
  onChange: (block: MaterialBlock) => void;
  onRemove: () => void;
  onInsertBelow: () => void;
  onOpenPicker: (anchor: HTMLElement) => void;
  onEnter: () => void;
  onBackspaceEmpty: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragOver: () => void;
  onDrop: () => void;
};

export function MaterialNotionBlock({
  block,
  disabled,
  autoFocus,
  isDragging,
  isDropTarget,
  onChange,
  onRemove,
  onInsertBelow,
  onOpenPicker,
  onEnter,
  onBackspaceEmpty,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}: MaterialNotionBlockProps) {
  const plusRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className={cn(
        "group relative flex items-start",
        isDragging && "opacity-40",
        isDropTarget && "before:absolute before:inset-x-0 before:-top-1 before:h-0.5 before:bg-primary",
      )}
      onDragOver={(event) => {
        event.preventDefault();
        onDragOver();
      }}
      onDrop={(event) => {
        event.preventDefault();
        onDrop();
      }}
    >
      <div className="flex w-12 shrink-0 items-center justify-end gap-0.5 pt-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        <button
          ref={plusRef}
          type="button"
          disabled={disabled}
          aria-label="Добавить или выбрать блок"
          onClick={() => {
            if (isBlockEmpty(block) && plusRef.current) {
              onOpenPicker(plusRef.current);
              return;
            }

            onInsertBelow();
          }}
          className="flex size-6 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
        >
          <Plus className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          draggable={!disabled}
          disabled={disabled}
          aria-label="Перетащить блок"
          onDragStart={(event) => {
            event.dataTransfer.effectAllowed = "move";
            onDragStart();
          }}
          onDragEnd={onDragEnd}
          className="flex size-6 cursor-grab items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 active:cursor-grabbing"
        >
          <GripVertical className="size-4" aria-hidden />
        </button>
      </div>

      <div className="min-w-0 flex-1 py-0.5">
        <MaterialNotionBlockContent
          block={block}
          disabled={disabled}
          autoFocus={autoFocus}
          inputRef={inputRef}
          onChange={onChange}
          onEnter={onEnter}
          onBackspaceEmpty={onBackspaceEmpty}
          onSlash={() => {
            if (plusRef.current) {
              onOpenPicker(plusRef.current);
            }
          }}
        />
      </div>

      <button
        type="button"
        disabled={disabled}
        aria-label="Удалить блок"
        onClick={onRemove}
        className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-md text-neutral-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-neutral-100 hover:text-neutral-700"
      >
        <Trash2 className="size-4" aria-hidden />
      </button>
    </div>
  );
}

export type PickerTarget = {
  index: number;
  mode: "replace" | "insert";
};

export function applyBlockTypeAtIndex(
  blocks: MaterialBlock[],
  index: number,
  type: MaterialBlockType,
  mode: "replace" | "insert",
  createBlock: (type: MaterialBlockType) => MaterialBlock,
): MaterialBlock[] {
  const nextBlock = createBlock(type);

  if (mode === "replace") {
    return blocks.map((block, blockIndex) => (blockIndex === index ? nextBlock : block));
  }

  return [...blocks.slice(0, index + 1), nextBlock, ...blocks.slice(index + 1)];
}
