"use client";

import { useEffect, useState } from "react";

import { RichTextContent } from "@/lib/content/rich-text-content";
import { cn } from "@/lib/utils";

type ChecklistItemState = {
  id: string;
  text: string;
  checked: boolean;
};

type InteractiveChecklistProps = {
  items: ChecklistItemState[];
  className?: string;
  bodyClassName?: string;
  compact?: boolean;
};

export function InteractiveChecklist({
  items,
  className,
  bodyClassName,
  compact,
}: InteractiveChecklistProps) {
  const [state, setState] = useState(items);

  useEffect(() => {
    setState(items);
  }, [items]);

  return (
    <ul
      className={cn(
        "text-neutral-900",
        bodyClassName,
        compact ? "space-y-1" : "space-y-2",
        className,
      )}
    >
      {state.map((item) => (
        <li key={item.id} className="flex items-start gap-2.5">
          <input
            type="checkbox"
            checked={item.checked}
            onChange={(event) => {
              const checked = event.target.checked;
              setState((current) =>
                current.map((entry) =>
                  entry.id === item.id ? { ...entry, checked } : entry,
                ),
              );
            }}
            className="mt-1 size-4 shrink-0 rounded border border-neutral-300 text-primary focus:ring-2 focus:ring-primary/20"
            aria-label={item.checked ? "Отмечено" : "Не отмечено"}
          />
          <RichTextContent
            html={item.text}
            monochrome
            className={cn("min-w-0 flex-1", item.checked && "text-neutral-500 line-through")}
          />
        </li>
      ))}
    </ul>
  );
}
