"use client";

import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";

type TableAddZoneProps = {
  orientation: "row" | "column";
  onAdd: () => void;
  disabled?: boolean;
  title: string;
};

export function TableAddZone({
  orientation,
  onAdd,
  disabled,
  title,
}: TableAddZoneProps) {
  if (disabled) {
    return null;
  }

  const isRow = orientation === "row";

  return (
    <div
      className={cn(
        "group relative shrink-0",
        isRow ? "h-2 w-full" : "w-2 self-stretch",
      )}
      aria-label={title}
    >
      <div
        className={cn(
          "absolute flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100",
          isRow
            ? "inset-x-0 -top-1 h-6"
            : "inset-y-0 -left-1 w-6",
        )}
      >
        <button
          type="button"
          onClick={onAdd}
          title={title}
          className={cn(
            "flex items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-500 shadow-sm transition-colors hover:border-primary/40 hover:bg-blue-50 hover:text-primary",
            isRow ? "h-5 w-full" : "h-full w-5",
          )}
        >
          <Plus className="size-3.5" aria-hidden />
        </button>
      </div>
    </div>
  );
}
