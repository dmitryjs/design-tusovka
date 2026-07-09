"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { X } from "lucide-react";

import { TaskImportForm } from "@/components/admin/task-import-form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TaskImportModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TaskImportModal({ open, onOpenChange }: TaskImportModalProps) {
  const router = useRouter();

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onOpenChange]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Закрыть импорт"
        onClick={() => onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Импорт заданий из JSON"
        className={cn(
          "relative z-10 flex max-h-[min(92vh,56rem)] w-full max-w-3xl flex-col",
          "overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl",
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b border-neutral-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Импорт заданий</h2>
            <p className="mt-1 text-sm text-neutral-600">
              Загрузите JSON-файл или вставьте массив задач.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => onOpenChange(false)}
            aria-label="Закрыть"
          >
            <X className="size-4" aria-hidden />
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <TaskImportForm
            variant="modal"
            onImported={() => {
              onOpenChange(false);
              router.refresh();
            }}
          />
        </div>
      </div>
    </div>
  );
}
