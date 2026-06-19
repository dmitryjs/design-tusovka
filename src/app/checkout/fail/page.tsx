import Link from "next/link";

import { PageHero, PageShell } from "@/components/layout/page-shell";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default function CheckoutFailPage() {
  return (
    <PageShell
      breadcrumbs={[
        { label: "Главная", href: "/" },
        { label: "Оплата не завершена" },
      ]}
    >
      <PageHero
        title="Оплата не завершена"
        description="Платёж отменён или не прошёл. Доступ к контенту не выдан."
      >
        <div className="flex flex-wrap gap-3">
          <Link href="/cart" className={buttonVariants()}>
            Вернуться в корзину
          </Link>
          <Link href="/profile/orders" className={buttonVariants({ variant: "secondary" })}>
            Мои заказы
          </Link>
        </div>
      </PageHero>
      <div className="rounded-xl border border-neutral-300 bg-card p-5 text-sm text-neutral-700">
        Если вы уже оплатили заказ, подождите — статус обновится после обработки
        уведомления от платёжной системы. Страница успешного возврата не подтверждает
        оплату автоматически.
      </div>
    </PageShell>
  );
}
