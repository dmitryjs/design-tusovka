import Link from "next/link";

import { OrdersList } from "@/components/cart/orders-list";
import { PageHero, PageShell } from "@/components/layout/page-shell";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserOrders } from "@/lib/cart/orders";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProfileOrdersPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/sign-in?next=/profile/orders");
  }

  const { orders, error } = await getUserOrders();

  return (
    <PageShell
      breadcrumbs={[
        { label: "Главная", href: "/" },
        { label: "Профиль", href: "/profile" },
        { label: "Заказы" },
      ]}
    >
      <PageHero
        title="Мои заказы"
        description="Созданные заказы и их статус. Доступ к платному контенту выдаётся после оплаты."
      >
        <Link href="/profile" className={buttonVariants({ variant: "secondary" })}>
          К профилю
        </Link>
      </PageHero>
      <OrdersList orders={orders} error={error} />
    </PageShell>
  );
}
