import Link from "next/link";
import { redirect } from "next/navigation";

import { CheckoutStatusPanel } from "@/components/checkout/checkout-status-panel";
import { CheckoutShell } from "@/components/checkout/checkout-shell";
import { CheckoutTrustPanel } from "@/components/checkout/checkout-trust-panel";
import { PageShell } from "@/components/layout/page-shell";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/session";
import { formatPrice } from "@/lib/catalog/format";
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
        <CheckoutShell
          step="done"
          title="Статус оплаты"
          description="Укажите заказ в ссылке возврата или откройте раздел «Мои заказы»."
          sidebar={<CheckoutTrustPanel />}
        >
          <Link href="/profile/orders" className={buttonVariants({ variant: "secondary" })}>
            Мои заказы
          </Link>
        </CheckoutShell>
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
      <CheckoutShell
        step="done"
        title="Готово"
        description="Доступ к контенту выдаётся только после подтверждения платежа на сервере."
        sidebar={
          order ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-neutral-200 bg-white p-5">
                <p className="text-sm text-neutral-600">Сумма заказа</p>
                <p className="mt-1 text-2xl font-semibold text-foreground">
                  {formatPrice(order.totalKopecks)}
                </p>
              </div>
              <CheckoutTrustPanel />
            </div>
          ) : (
            <CheckoutTrustPanel />
          )
        }
      >
        <CheckoutStatusPanel order={order} error={error} />
        <div className="flex flex-wrap gap-3">
          <Link href="/profile/library" className={buttonVariants()}>
            В библиотеку
          </Link>
          <Link href="/profile/orders" className={buttonVariants({ variant: "secondary" })}>
            Мои заказы
          </Link>
        </div>
      </CheckoutShell>
    </PageShell>
  );
}
