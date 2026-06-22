import Link from "next/link";
import { Download } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import type { MaterialPdfAttachment } from "@/lib/content/material-reading";
import { cn } from "@/lib/utils";

type MaterialReadingActionsProps = {
  pdfAttachment: MaterialPdfAttachment | null;
  className?: string;
};

export function MaterialReadingActions({
  pdfAttachment,
  className,
}: MaterialReadingActionsProps) {
  return (
    <section
      aria-label="Действия"
      className={cn(
        "rounded-xl border border-neutral-200 bg-white px-4 py-4 sm:px-5",
        className,
      )}
    >
      <h2 className="mb-3 text-base font-semibold text-foreground">Действия</h2>
      <div className="flex flex-col gap-2">
        {pdfAttachment ? (
          <a
            href={pdfAttachment.url}
            download={pdfAttachment.name}
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants({ variant: "outline" }), "w-full justify-start gap-2")}
          >
            <Download className="size-4 shrink-0" aria-hidden />
            Скачать PDF
          </a>
        ) : (
          <p className="text-sm text-neutral-500">
            PDF-файл не прикреплён к материалу.
          </p>
        )}
        <Link
          href="/profile/library"
          className={cn(buttonVariants({ variant: "outline" }), "w-full")}
        >
          Открыть в библиотеке
        </Link>
      </div>
    </section>
  );
}
