"use server";

import { revalidatePath } from "next/cache";

import { createYookassaPayment } from "@/lib/payments/yookassa/create-payment";
import type { StartPaymentActionResult } from "@/lib/payments/yookassa/types";

export async function startYookassaPaymentAction(
  orderId: string,
): Promise<StartPaymentActionResult> {
  const result = await createYookassaPayment(orderId);

  if (result.ok) {
    revalidatePath("/profile/orders");
    revalidatePath("/cart");
  }

  return result;
}
