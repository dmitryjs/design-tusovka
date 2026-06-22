import Link from "next/link";

import { getAdminProductHref, getAdminProductKindLabel } from "@/lib/admin/product-kind";
import { formatPrice } from "@/lib/catalog/format";
import type { AdminProductSalesRow } from "@/lib/admin/analytics";

export function ProductSalesTable({ rows }: { rows: AdminProductSalesRow[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-600">
          <tr>
            <th className="px-4 py-3 font-medium">Товар</th>
            <th className="px-4 py-3 font-medium">Тип</th>
            <th className="px-4 py-3 font-medium">Продажи</th>
            <th className="px-4 py-3 font-medium">Выручка</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const href = getAdminProductHref(row.kind, row.slug);

            return (
            <tr key={row.productId} className="border-b border-neutral-100 last:border-0">
              <td className="px-4 py-3">
                {href ? (
                  <Link href={href} className="font-medium text-primary hover:underline">
                    {row.title}
                  </Link>
                ) : (
                  <span className="font-medium text-foreground">{row.title}</span>
                )}
              </td>
              <td className="px-4 py-3 text-neutral-700">{getAdminProductKindLabel(row.kind)}</td>
              <td className="px-4 py-3 tabular-nums">{row.salesCount}</td>
              <td className="px-4 py-3 font-medium tabular-nums">
                {formatPrice(row.revenueKopecks)}
              </td>
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
