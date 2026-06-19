import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import {
  formatPrice,
  getKindLabel,
  getLevelLabel,
} from "@/lib/catalog/format";
import type { AdminProductListItem } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

export function ProductsTable({ items }: { items: AdminProductListItem[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-300">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-600">
          <tr>
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
            <tr key={item.id} className="border-b border-neutral-100 last:border-0">
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
                <Link
                  href={`/admin/products/${item.id}`}
                  className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
                >
                  Редактировать
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
