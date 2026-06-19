import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CheckoutOrderView = {
  id: string;
  status: string;
  totalKopecks: number;
  paymentStatus: string | null;
  paidAt: string | null;
};

export async function getOrderForCheckout(
  orderId: string,
): Promise<{ order: CheckoutOrderView | null; error: string | null }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { order: null, error: "Требуется вход" };
  }

  const { data, error } = await supabase
    .from("orders")
    .select("id, status, total_kopecks, payment_status, paid_at")
    .eq("id", orderId)
    .maybeSingle();

  if (error) {
    return { order: null, error: error.message };
  }

  if (!data) {
    return { order: null, error: "Заказ не найден" };
  }

  const row = data as {
    id: string;
    status: string;
    total_kopecks: number;
    payment_status: string | null;
    paid_at: string | null;
  };

  return {
    order: {
      id: row.id,
      status: row.status,
      totalKopecks: row.total_kopecks,
      paymentStatus: row.payment_status,
      paidAt: row.paid_at,
    },
    error: null,
  };
}
