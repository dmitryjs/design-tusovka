import { redirect } from "next/navigation";

import { CartView } from "@/components/cart/cart-view";
import { PageHero, PageShell } from "@/components/layout/page-shell";
import { getCurrentUser } from "@/lib/auth/session";
import { getCart } from "@/lib/cart/queries";
import { isYookassaConfigured } from "@/lib/payments/yookassa/config";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/sign-in?next=/cart");
  }

  const { items, error } = await getCart();

  return (
    <PageShell
      breadcrumbs={[
        { label: "Главная", href: "/" },
        { label: "Корзина" },
      ]}
    >
      <PageHero
        title="Корзина"
        description="Платные материалы и задания. После оформления — оплата через ЮKassa (если настроена)."
      />
      <CartView
        items={items}
        error={error}
        paymentsEnabled={isYookassaConfigured()}
      />
    </PageShell>
  );
}
