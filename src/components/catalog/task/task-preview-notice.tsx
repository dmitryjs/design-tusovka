import { Lock } from "lucide-react";

export function TaskPreviewNotice() {
  return (
    <div
      className="flex gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-4 sm:px-5"
      role="note"
    >
      <Lock className="mt-0.5 size-4 shrink-0 text-neutral-500" aria-hidden />
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">Это платное задание</p>
        <p className="text-sm leading-6 text-neutral-600">
          После покупки откроется полный бриф, требования к сдаче и критерии проверки.
        </p>
      </div>
    </div>
  );
}
