import Link from "next/link";
import { redirect } from "next/navigation";

import { CheckoutStatusPanel } from "@/components/checkout/checkout-status-panel";
import { PageHero, PageShell } from "@/components/layout/page-shell";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/session";
import { getOrderForCheckout } from "@/lib/payments/checkout-order";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ order_id?: string }>;
};

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/sign-in?next=/checkout/success");
  }

  const params = await searchParams;
  const orderId = params.order_id?.trim();

  if (!orderId) {
    return (
      <PageShell
        breadcrumbs={[
          { label: "Главная", href: "/" },
          { label: "Оплата" },
        ]}
      >
        <PageHero
          title="Оплата"
          description="Укажите заказ в ссылке возврата или откройте раздел «Мои заказы»."
        >
          <Link href="/profile/orders" className={buttonVariants({ variant: "secondary" })}>
            Мои заказы
          </Link>
        </PageHero>
      </PageShell>
    );
  }

  const { order, error } = await getOrderForCheckout(orderId);

  return (
    <PageShell
      breadcrumbs={[
        { label: "Главная", href: "/" },
        { label: "Оплата" },
      ]}
    >
      <PageHero
        title="Статус оплаты"
        description="Доступ к контенту выдаётся только после подтверждения платежа на сервере."
      >
        <Link href="/profile/orders" className={buttonVariants({ variant: "secondary" })}>
          Мои заказы
        </Link>
      </PageHero>
      <CheckoutStatusPanel order={order} error={error} />
    </PageShell>
  );
}
