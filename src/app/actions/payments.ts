"use server";

import { revalidatePath } from "next/cache";

import { createYookassaPayment } from "@/lib/payments/yookassa/create-payment";
import type {
  StartPaymentActionResult,
  YookassaPaymentMethod,
} from "@/lib/payments/yookassa/types";

export async function startYookassaPaymentAction(
  orderId: string,
  paymentMethod: YookassaPaymentMethod = "bank_card",
): Promise<StartPaymentActionResult> {
  const result = await createYookassaPayment(orderId, paymentMethod);

  if (result.ok) {
    revalidatePath("/profile/orders");
    revalidatePath("/cart");
    revalidatePath("/checkout");
    revalidatePath("/checkout/payment");
  }

  return result;
}
