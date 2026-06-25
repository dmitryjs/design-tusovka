"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  createMaterialBlock,
  duplicateMaterialBlock,
  moveBlock,
  type MaterialBlock,
  type MaterialBlockType,
} from "@/lib/content/material-blocks";
import { cn } from "@/lib/utils";

import { MaterialBlockPicker } from "./material-block-picker";
import {
  applyBlockTypeAtIndex,
  MaterialNotionBlock,
  type PickerTarget,
} from "./material-notion-block";
import { isBlockEmpty } from "./material-notion-block-content";

type MaterialBlockEditorProps = {
  documentTitle: string;
  onDocumentTitleChange: (value: string) => void;
  blocks: MaterialBlock[];
  onChange: (blocks: MaterialBlock[]) => void;
  disabled?: boolean;
};

export function MaterialBlockEditor({
  documentTitle,
  onDocumentTitleChange,
  blocks,
  onChange,
  disabled,
}: MaterialBlockEditorProps) {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [focusBlockId, setFocusBlockId] = useState<string | null>(null);
  const [pickerTarget, setPickerTarget] = useState<PickerTarget | null>(null);
  const [pickerAnchor, setPickerAnchor] = useState<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const displayBlocks = useMemo(
    () => (blocks.length > 0 ? blocks : [createMaterialBlock("paragraph")]),
    [blocks],
  );

  useEffect(() => {
    if (!focusBlockId) {
      return;
    }

    const frame = requestAnimationFrame(() => setFocusBlockId(null));
    return () => cancelAnimationFrame(frame);
  }, [focusBlockId]);

  const insertBlockAfter = useCallback(
    (index: number, type: MaterialBlockType = "paragraph") => {
      const nextBlock = createMaterialBlock(type);
      const next = [
        ...displayBlocks.slice(0, index + 1),
        nextBlock,
        ...displayBlocks.slice(index + 1),
      ];
      onChange(next);
      setFocusBlockId(nextBlock.id);
    },
    [displayBlocks, onChange],
  );

  const updateBlock = useCallback(
    (index: number, block: MaterialBlock) => {
      onChange(displayBlocks.map((item, itemIndex) => (itemIndex === index ? block : item)));
    },
    [displayBlocks, onChange],
  );

  const removeBlock = useCallback(
    (index: number) => {
      const next = displayBlocks.filter((_, itemIndex) => itemIndex !== index);
      onChange(next.length > 0 ? next : [createMaterialBlock("paragraph")]);
    },
    [displayBlocks, onChange],
  );

  const duplicateBlockAt = useCallback(
    (index: number) => {
      const source = displayBlocks[index];
      if (!source) {
        return;
      }

      const duplicated = duplicateMaterialBlock(source);
      const next = [
        ...displayBlocks.slice(0, index + 1),
        duplicated,
        ...displayBlocks.slice(index + 1),
      ];
      onChange(next);
      setFocusBlockId(duplicated.id);
    },
    [displayBlocks, onChange],
  );

  const openPicker = useCallback((index: number, anchor: HTMLElement, mode: PickerTarget["mode"]) => {
    setPickerAnchor(anchor);
    setPickerTarget({ index, mode });
  }, []);

  const closePicker = useCallback(() => {
    setPickerTarget(null);
    setPickerAnchor(null);
  }, []);

  const handlePickerSelect = useCallback(
    (type: MaterialBlockType) => {
      if (!pickerTarget) {
        return;
      }

      const next = applyBlockTypeAtIndex(
        displayBlocks,
        pickerTarget.index,
        type,
        pickerTarget.mode,
        createMaterialBlock,
      );

      const inserted = next[pickerTarget.mode === "replace" ? pickerTarget.index : pickerTarget.index + 1];
      onChange(next);
      if (inserted) {
        setFocusBlockId(inserted.id);
      }
      setPickerTarget(null);
      setPickerAnchor(null);
    },
    [displayBlocks, onChange, pickerTarget],
  );

  function handleCanvasClick(event: React.MouseEvent<HTMLDivElement>) {
    if (disabled) {
      return;
    }

    if (event.target !== canvasRef.current) {
      return;
    }

    const last = displayBlocks[displayBlocks.length - 1];
    if (last && isBlockEmpty(last) && last.type === "paragraph") {
      setFocusBlockId(last.id);
      return;
    }

    insertBlockAfter(displayBlocks.length - 1);
  }

  return (
    <div className="rounded-xl bg-white px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <textarea
          value={documentTitle}
          disabled={disabled}
          rows={1}
          placeholder="Новая страница"
          onChange={(event) => onDocumentTitleChange(event.target.value)}
          onInput={(event) => {
            const target = event.currentTarget;
            target.style.height = "auto";
            target.style.height = `${target.scrollHeight}px`;
          }}
          className={cn(
            "mb-6 w-full resize-none border-0 bg-transparent p-0 text-4xl leading-tight font-bold",
            "text-foreground shadow-none outline-none placeholder:text-neutral-300 focus:ring-0",
          )}
        />

        <div
          ref={canvasRef}
          className="min-h-[320px] space-y-0.5"
          onClick={handleCanvasClick}
        >
          {displayBlocks.map((block, index) => (
            <MaterialNotionBlock
              key={block.id}
              block={block}
              disabled={disabled}
              autoFocus={focusBlockId === block.id}
              isDragging={draggingIndex === index}
              isDropTarget={dropIndex === index && draggingIndex !== index}
              onChange={(nextBlock) => updateBlock(index, nextBlock)}
              onRemove={() => removeBlock(index)}
              onDuplicate={() => duplicateBlockAt(index)}
              onInsertBelow={() => insertBlockAfter(index)}
              onOpenPicker={(anchor) => {
                if (isBlockEmpty(block)) {
                  openPicker(index, anchor, "replace");
                  return;
                }

                insertBlockAfter(index);
              }}
              onEnter={() => insertBlockAfter(index)}
              onBackspaceEmpty={() => {
                if (displayBlocks.length <= 1) {
                  return;
                }
                removeBlock(index);
              }}
              onDragStart={() => setDraggingIndex(index)}
              onDragEnd={() => {
                setDraggingIndex(null);
                setDropIndex(null);
              }}
              onDragOver={() => setDropIndex(index)}
              onDrop={() => {
                if (draggingIndex === null || draggingIndex === index) {
                  return;
                }
                onChange(moveBlock(displayBlocks, draggingIndex, index));
                setDraggingIndex(null);
                setDropIndex(null);
              }}
            />
          ))}
        </div>
      </div>

      <MaterialBlockPicker
        open={pickerTarget !== null}
        anchor={pickerAnchor}
        onClose={closePicker}
        onSelect={handlePickerSelect}
      />
    </div>
  );
}
