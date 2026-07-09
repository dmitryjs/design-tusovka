"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Trash2 } from "lucide-react";

import {
  deleteProductAction,
  deleteProductsBulkAction,
} from "@/app/actions/admin/products";
import { AdminAlert } from "@/components/admin/admin-shell";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  formatPrice,
  getKindLabel,
  getLevelLabel,
  getMaterialFormatLabel,
} from "@/lib/catalog/format";
import {
  getMaterialCoverPlaceholderClass,
  getMaterialFormatTagClass,
  resolveMaterialCoverUrl,
} from "@/lib/catalog/material-cover";
import type { AdminProductListItem } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

const checkboxClassName =
  "size-4 shrink-0 rounded border border-neutral-300 text-primary focus:ring-2 focus:ring-primary/20";

function ProductCoverThumb({ item }: { item: AdminProductListItem }) {
  const coverUrl = resolveMaterialCoverUrl(item.coverPath);

  if (coverUrl) {
    return (
      <div className="relative h-10 w-16 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
        <Image
          src={coverUrl}
          alt=""
          fill
          sizes="64px"
          className="object-cover"
        />
      </div>
    );
  }

  if (item.kind === "material" && item.materialFormat) {
    return (
      <div
        className={cn(
          "flex h-10 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-neutral-200 px-1 text-center text-[10px] leading-tight font-medium",
          getMaterialCoverPlaceholderClass(item.materialFormat),
        )}
        aria-hidden
      >
        <span className={cn("line-clamp-2", getMaterialFormatTagClass(item.materialFormat))}>
          {getMaterialFormatLabel(item.materialFormat)}
        </span>
      </div>
    );
  }

  return (
    <div
      className="flex h-10 w-16 shrink-0 items-center justify-center rounded-lg border border-dashed border-neutral-200 bg-neutral-50 text-[10px] text-neutral-400"
      aria-hidden
    >
      {item.kind === "task" ? "Задание" : "—"}
    </div>
  );
}

export function ProductsTable({
  items,
  kind,
}: {
  items: AdminProductListItem[];
  kind: "material" | "task";
}) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const selectAllRef = useRef<HTMLInputElement>(null);

  const selectedCount = selectedIds.size;
  const allSelected = items.length > 0 && selectedCount === items.length;
  const someSelected = selectedCount > 0 && !allSelected;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  useEffect(() => {
    setSelectedIds((current) => {
      const itemIds = new Set(items.map((item) => item.id));
      const next = new Set([...current].filter((id) => itemIds.has(id)));
      return next.size === current.size ? current : next;
    });
  }, [items]);

  function toggleOne(id: string, checked: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }

  function toggleAll(checked: boolean) {
    setSelectedIds(checked ? new Set(items.map((item) => item.id)) : new Set());
  }

  const itemLabel = kind === "task" ? "задание" : "материал";
  const itemsLabel = kind === "task" ? "задания" : "материалы";

  function handleDeleteOne(item: AdminProductListItem) {
    const confirmed = window.confirm(
      `Удалить ${itemLabel} «${item.title}»? Это действие нельзя отменить.`,
    );

    if (!confirmed) {
      return;
    }

    setMessage(null);
    setError(null);

    startTransition(async () => {
      const result = await deleteProductAction(item.id);

      if (!result.ok) {
        setError(result.error ?? "Не удалось удалить продукт");
        return;
      }

      setSelectedIds((current) => {
        const next = new Set(current);
        next.delete(item.id);
        return next;
      });
      setMessage(`${kind === "task" ? "Задание" : "Материал"} удалён`);
      router.refresh();
    });
  }

  function handleBulkDelete() {
    const ids = [...selectedIds];

    if (ids.length === 0) {
      return;
    }

    const confirmed = window.confirm(
      `Удалить выбранные ${itemsLabel} (${ids.length})? Это действие нельзя отменить.`,
    );

    if (!confirmed) {
      return;
    }

    setMessage(null);
    setError(null);

    startTransition(async () => {
      const result = await deleteProductsBulkAction(ids);

      if (!result.ok) {
        setError(result.error ?? "Не удалось удалить выбранные продукты");
        return;
      }

      const deletedCount = result.data?.deleted.length ?? 0;
      const failureCount = result.data?.failures.length ?? 0;

      setSelectedIds(new Set(result.data?.failures.map((item) => item.id) ?? []));

      if (failureCount > 0) {
        const failureMessages = result.data?.failures
          .map((item) => item.message)
          .filter((value, index, array) => array.indexOf(value) === index)
          .join(" ");

        setError(
          `Удалено: ${deletedCount}. Не удалось: ${failureCount}. ${failureMessages}`,
        );
      } else {
        setMessage(`Удалено: ${deletedCount}`);
      }

      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      {message ? <AdminAlert variant="success">{message}</AdminAlert> : null}
      {error ? <AdminAlert variant="error">{error}</AdminAlert> : null}

      {selectedCount > 0 ? (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-3">
          <span className="text-sm text-neutral-700">
            Выбрано: <span className="font-medium text-foreground">{selectedCount}</span>
          </span>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={isPending}
            onClick={handleBulkDelete}
          >
            Удалить выбранные
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isPending}
            onClick={() => setSelectedIds(new Set())}
          >
            Снять выделение
          </Button>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-neutral-300">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-600">
            <tr>
              <th className="w-10 px-4 py-3">
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  className={checkboxClassName}
                  checked={allSelected}
                  disabled={items.length === 0 || isPending}
                  onChange={(event) => toggleAll(event.target.checked)}
                  aria-label="Выбрать все"
                />
              </th>
              <th className="w-20 px-2 py-3 font-medium">
                <span className="sr-only">Обложка</span>
              </th>
              <th className="px-4 py-3 font-medium">Название</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Тип</th>
              <th className="px-4 py-3 font-medium">Уровень</th>
              <th className="px-4 py-3 font-medium">Цена</th>
              <th className="px-4 py-3 font-medium">Статус</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className={cn(
                  "border-b border-neutral-100 last:border-0",
                  selectedIds.has(item.id) && "bg-primary/5",
                )}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    className={checkboxClassName}
                    checked={selectedIds.has(item.id)}
                    disabled={isPending}
                    onChange={(event) => toggleOne(item.id, event.target.checked)}
                    aria-label={`Выбрать ${item.title}`}
                  />
                </td>
                <td className="px-2 py-3">
                  <ProductCoverThumb item={item} />
                </td>
                <td className="px-4 py-3 font-medium text-foreground">{item.title}</td>
                <td className="px-4 py-3 text-neutral-600">{item.slug}</td>
                <td className="px-4 py-3">
                  {item.kind === "material" || item.kind === "task"
                    ? getKindLabel(item.kind)
                    : item.kind}
                </td>
                <td className="px-4 py-3">
                  {item.level && item.level !== "all"
                    ? getLevelLabel(item.level)
                    : "—"}
                </td>
                <td className="px-4 py-3">{formatPrice(item.priceKopecks)}</td>
                <td className="px-4 py-3">{item.status}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/products/${item.id}`}
                      className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
                    >
                      Редактировать
                    </Link>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      disabled={isPending}
                      onClick={() => handleDeleteOne(item)}
                      aria-label={`Удалить ${item.title}`}
                    >
                      <Trash2 className="size-4 text-neutral-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
