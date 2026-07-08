import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

import type { Database } from "@/types/database.types";

import { sumOrderItemsKopecks } from "../order-amount";
import { createYookassaPaymentRequest, getYookassaPayment } from "./client";
import { getYookassaConfig, isYookassaConfigured } from "./config";
import { kopecksToRublesValue } from "./money";
import { buildPublicOrderNumber } from "./order-number";
import { buildReceipt, type ReceiptItemInput } from "./receipt";
import type { CreateYookassaPaymentResult, YookassaPaymentMethod } from "./types";

type OrderItemProduct = {
  price_kopecks: number;
  title: string | null;
  kind: Database["public"]["Enums"]["product_kind"];
};

type OrderItemRow = {
  price_kopecks: number;
  title: string | null;
  products: OrderItemProduct | OrderItemProduct[] | null;
};

type OrderRow = {
  id: string;
  user_id: string;
  status: string;
  total_kopecks: number;
  provider_payment_id: string | null;
  payment_confirmation_url: string | null;
  payment_status: string | null;
  idempotency_key: string | null;
  order_items: OrderItemRow[];
};

function normalizeProduct(
  products: OrderItemRow["products"],
): OrderItemProduct | null {
  if (!products) {
    return null;
  }

  return Array.isArray(products) ? (products[0] ?? null) : products;
}

function normalizeProductPrice(products: OrderItemRow["products"]): number | null {
  return normalizeProduct(products)?.price_kopecks ?? null;
}

function buildReceiptItemsInput(items: OrderItemRow[]): ReceiptItemInput[] {
  return items.map((item) => {
    const product = normalizeProduct(item.products);

    return {
      kind: product?.kind,
      title: product?.title ?? item.title,
      priceKopecks: item.price_kopecks,
    };
  });
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
  paymentMethod: YookassaPaymentMethod = "bank_card",
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
      order_items ( price_kopecks, title, products ( price_kopecks, title, kind ) )
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
  const orderNumber = buildPublicOrderNumber(orderId);
  const receipt = buildReceipt(user.email, buildReceiptItemsInput(items));

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
    description: `Оплата заказа ${orderNumber}`,
    returnUrl,
    idempotenceKey,
    metadata: {
      order_id: orderId,
      order_number: orderNumber,
      user_id: user.id,
      source: "design-tusovka",
    },
    paymentMethod,
    receipt,
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
