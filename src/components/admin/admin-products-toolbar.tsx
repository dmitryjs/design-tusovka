"use client";

import Link from "next/link";
import { useState } from "react";

import { TaskImportModal } from "@/components/admin/task-import-modal";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AdminProductsToolbarProps = {
  kind: "material" | "task";
};

export function AdminProductsToolbar({ kind }: AdminProductsToolbarProps) {
  const [importOpen, setImportOpen] = useState(false);

  const createHref =
    kind === "task" ? "/admin/products/new?kind=task" : "/admin/products/new?kind=material";
  const createLabel = kind === "task" ? "Создать задание" : "Создать материал";

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Link href={createHref} className={cn(buttonVariants())}>
          {createLabel}
        </Link>
        {kind === "task" ? (
          <Button type="button" variant="secondary" onClick={() => setImportOpen(true)}>
            Импорт JSON
          </Button>
        ) : null}
      </div>

      {kind === "task" ? (
        <TaskImportModal open={importOpen} onOpenChange={setImportOpen} />
      ) : null}
    </>
  );
}
