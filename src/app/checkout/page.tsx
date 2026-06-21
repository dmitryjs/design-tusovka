import { redirect } from "next/navigation";

import { CheckoutDataView } from "@/components/checkout/checkout-data-view";
import { PageShell } from "@/components/layout/page-shell";
import { getCurrentUser } from "@/lib/auth/session";
import { getCart } from "@/lib/cart/queries";
import { getCheckoutContact } from "@/lib/checkout/contact";

export const dynamic = "force-dynamic";

export default async function CheckoutDataPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/sign-in?next=/checkout");
  }

  const [{ items, error }, contact] = await Promise.all([getCart(), getCheckoutContact()]);

  if (!contact) {
    redirect("/auth/sign-in?next=/checkout");
  }

  if (items.length === 0) {
    redirect("/cart");
  }

  return (
    <PageShell
      breadcrumbs={[
        { label: "Главная", href: "/" },
        { label: "Корзина", href: "/cart" },
        { label: "Данные" },
      ]}
    >
      <CheckoutDataView items={items} contact={contact} error={error} />
    </PageShell>
  );
}
