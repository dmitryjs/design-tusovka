import Link from "next/link";
import { Download } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const EXPORT_ITEMS = [
  {
    id: "users",
    title: "Пользователи",
    description: "Email, имя, уровень, роль, статус деактивации.",
    href: "/api/admin/export/users",
  },
  {
    id: "orders",
    title: "Заказы",
    description: "Статусы, суммы, ошибки оплаты и выдачи доступа.",
    href: "/api/admin/export/orders",
  },
  {
    id: "sales",
    title: "Продажи по товарам",
    description: "Количество продаж и выручка по каждому товару.",
    href: "/api/admin/export/sales",
  },
] as const;

export function ReportsExportPanel() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {EXPORT_ITEMS.map((item) => (
        <section
          key={item.id}
          className="flex h-full flex-col rounded-xl border border-neutral-200 bg-white p-5"
        >
          <h2 className="text-base font-semibold text-foreground">{item.title}</h2>
          <p className="mt-2 flex-1 text-sm leading-6 text-neutral-600">{item.description}</p>
          <Link
            href={item.href}
            className={cn(buttonVariants({ variant: "secondary" }), "mt-4 inline-flex w-fit gap-2")}
          >
            <Download className="size-4" aria-hidden />
            Скачать CSV
          </Link>
        </section>
      ))}
    </div>
  );
}
