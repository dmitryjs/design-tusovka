import { redirect } from "next/navigation";

import { CartCheckoutView } from "@/components/cart/cart-checkout-view";
import { PageShell } from "@/components/layout/page-shell";
import { getCurrentUser } from "@/lib/auth/session";
import { getCart } from "@/lib/cart/queries";

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
      <CartCheckoutView items={items} error={error} />
    </PageShell>
  );
}
