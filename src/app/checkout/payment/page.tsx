import { redirect } from "next/navigation";

import { CheckoutPaymentView } from "@/components/checkout/checkout-payment-view";
import { PageShell } from "@/components/layout/page-shell";
import { getCurrentUser } from "@/lib/auth/session";
import { getCart } from "@/lib/cart/queries";
import { getCheckoutContact } from "@/lib/checkout/contact";
import { isYookassaConfigured } from "@/lib/payments/yookassa/config";

export const dynamic = "force-dynamic";

export default async function CheckoutPaymentPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/sign-in?next=/checkout/payment");
  }

  const [{ items, error }, contact] = await Promise.all([getCart(), getCheckoutContact()]);

  if (!contact) {
    redirect("/auth/sign-in?next=/checkout/payment");
  }

  if (items.length === 0) {
    redirect("/cart");
  }

  if (!contact.emailConfirmed) {
    redirect("/checkout");
  }

  return (
    <PageShell
      breadcrumbs={[
        { label: "Главная", href: "/" },
        { label: "Корзина", href: "/cart" },
        { label: "Оплата" },
      ]}
    >
      <CheckoutPaymentView
        items={items}
        contact={contact}
        paymentsEnabled={isYookassaConfigured()}
        error={error}
      />
    </PageShell>
  );
}
