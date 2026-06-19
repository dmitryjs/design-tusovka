import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

import { sumOrderItemsKopecks } from "../order-amount";
import { createYookassaPaymentRequest, getYookassaPayment } from "./client";
import { getYookassaConfig, isYookassaConfigured } from "./config";
import { kopecksToRublesValue } from "./money";
import type { CreateYookassaPaymentResult } from "./types";

type OrderRow = {
  id: string;
  user_id: string;
  status: string;
  total_kopecks: number;
  provider_payment_id: string | null;
  payment_confirmation_url: string | null;
  payment_status: string | null;
  idempotency_key: string | null;
  order_items: Array<{
    price_kopecks: number;
    products: { price_kopecks: number } | { price_kopecks: number }[] | null;
  }>;
};

function normalizeProductPrice(
  products: OrderRow["order_items"][number]["products"],
): number | null {
  if (!products) {
    return null;
  }

  const product = Array.isArray(products) ? products[0] : products;
  return product?.price_kopecks ?? null;
}

function recalculateTotalKopecks(
  items: OrderRow["order_items"],
): { ok: true; total: number } | { ok: false; message: string } {
  if (items.length === 0) {
    return { ok: false, message: "В заказе нет позиций." };
  }

  for (const item of items) {
    const productPrice = normalizeProductPrice(item.products);
    if (productPrice === null) {
      return { ok: false, message: "Не удалось проверить цену позиции заказа." };
    }

    if (item.price_kopecks !== productPrice) {
      return {
        ok: false,
        message: "Цена заказа устарела. Создайте новый заказ.",
      };
    }
  }

  return { ok: true, total: sumOrderItemsKopecks(items) };
}

function buildReturnUrl(baseReturnUrl: string, orderId: string): string {
  const url = new URL(baseReturnUrl);
  url.searchParams.set("order_id", orderId);
  return url.toString();
}

export async function createYookassaPayment(
  orderId: string,
): Promise<CreateYookassaPaymentResult> {
  if (!isYookassaConfigured()) {
    return {
      ok: false,
      code: "payments_not_configured",
      message: "Платежи не настроены. Обратитесь к администратору.",
    };
  }

  const config = getYookassaConfig();
  if (!config) {
    return {
      ok: false,
      code: "payments_not_configured",
      message: "Платежи не настроены. Обратитесь к администратору.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      code: "unauthenticated",
      message: "Войдите в аккаунт, чтобы оплатить заказ.",
    };
  }

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      user_id,
      status,
      total_kopecks,
      provider_payment_id,
      payment_confirmation_url,
      payment_status,
      idempotency_key,
      order_items ( price_kopecks, products ( price_kopecks ) )
    `,
    )
    .eq("id", orderId)
    .maybeSingle();

  if (error || !order) {
    return {
      ok: false,
      code: "not_found",
      message: "Заказ не найден.",
    };
  }

  const orderRow = order as unknown as OrderRow;

  if (orderRow.user_id !== user.id) {
    return {
      ok: false,
      code: "forbidden",
      message: "Нет доступа к этому заказу.",
    };
  }

  if (orderRow.status !== "pending_payment") {
    return {
      ok: false,
      code: "invalid_status",
      message: "Заказ нельзя оплатить в текущем статусе.",
    };
  }

  const items = orderRow.order_items ?? [];
  const amountResult = recalculateTotalKopecks(items);
  if (!amountResult.ok) {
    return {
      ok: false,
      code: "empty_order",
      message: amountResult.message,
    };
  }

  const amountKopecks = amountResult.total;

  if (
    orderRow.payment_confirmation_url &&
    orderRow.provider_payment_id &&
    orderRow.payment_status === "pending"
  ) {
    const existing = await getYookassaPayment(orderRow.provider_payment_id);
    if (
      !("error" in existing) &&
      existing.payment.status === "pending" &&
      existing.payment.confirmation?.confirmation_url
    ) {
      return {
        ok: true,
        code: "existing",
        redirectUrl: existing.payment.confirmation.confirmation_url,
        paymentId: orderRow.provider_payment_id,
      };
    }
  }

  const idempotenceKey = orderRow.idempotency_key ?? orderId;
  const returnUrl = buildReturnUrl(config.returnUrl, orderId);

  const admin = createSupabaseAdminClient();
  const { error: keyError } = await admin
    .from("orders")
    .update({ idempotency_key: idempotenceKey })
    .eq("id", orderId)
    .eq("user_id", user.id)
    .eq("status", "pending_payment");

  if (keyError) {
    return {
      ok: false,
      code: "api_error",
      message: "Не удалось подготовить оплату заказа.",
    };
  }

  const paymentResult = await createYookassaPaymentRequest({
    amountKopecks,
    description: `Заказ ${orderId.slice(0, 8)}`,
    returnUrl,
    idempotenceKey,
    metadata: { order_id: orderId },
  });

  if ("error" in paymentResult) {
    return {
      ok: false,
      code: "api_error",
      message: "Не удалось создать платёж. Попробуйте позже.",
    };
  }

  const { payment } = paymentResult;
  const confirmationUrl = payment.confirmation?.confirmation_url;

  if (!confirmationUrl) {
    return {
      ok: false,
      code: "api_error",
      message: "Платёж создан без ссылки на оплату.",
    };
  }

  const { error: updateError } = await admin
    .from("orders")
    .update({
      payment_provider: "yookassa",
      provider_payment_id: payment.id,
      payment_status: payment.status,
      payment_confirmation_url: confirmationUrl,
      idempotency_key: idempotenceKey,
      total_kopecks: amountKopecks,
      payment_error: null,
    })
    .eq("id", orderId)
    .eq("user_id", user.id)
    .eq("status", "pending_payment");

  if (updateError) {
    return {
      ok: false,
      code: "api_error",
      message: "Платёж создан, но не удалось сохранить данные заказа.",
    };
  }

  if (amountKopecks !== orderRow.total_kopecks) {
    console.warn(
      `[yookassa] order ${orderId} total adjusted server-side: ${orderRow.total_kopecks} -> ${amountKopecks} (${kopecksToRublesValue(amountKopecks)} RUB)`,
    );
  }

  return {
    ok: true,
    code: "redirect",
    redirectUrl: confirmationUrl,
    paymentId: payment.id,
  };
}
