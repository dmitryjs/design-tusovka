import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

import { sumOrderItemsKopecks } from "../order-amount";
import { getYookassaPayment } from "./client";
import { rublesValueToKopecks } from "./money";
import type { YookassaNotification, YookassaPayment } from "./types";

type OrderRow = {
  id: string;
  user_id: string;
  status: string;
  total_kopecks: number;
  provider_payment_id: string | null;
};

function getOrderIdFromPayment(payment: YookassaPayment): string | null {
  const orderId = payment.metadata?.order_id;
  return orderId && orderId.length > 0 ? orderId : null;
}

async function loadOrderItemsTotalKopecks(orderId: string): Promise<number | null> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("order_items")
    .select("price_kopecks")
    .eq("order_id", orderId);

  if (error || !data?.length) {
    return null;
  }

  return sumOrderItemsKopecks(data);
}

async function loadOrderByProviderPaymentId(
  paymentId: string,
): Promise<OrderRow | null> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("orders")
    .select("id, user_id, status, total_kopecks, provider_payment_id")
    .eq("provider_payment_id", paymentId)
    .maybeSingle();

  return (data as OrderRow | null) ?? null;
}

async function loadOrderById(orderId: string): Promise<OrderRow | null> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("orders")
    .select("id, user_id, status, total_kopecks, provider_payment_id")
    .eq("id", orderId)
    .maybeSingle();

  return (data as OrderRow | null) ?? null;
}

async function fulfillPaidOrder(orderId: string): Promise<void> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.rpc("fulfill_paid_order", {
    p_order_id: orderId,
  });

  if (error) {
    console.error(`[yookassa] fulfill_paid_order RPC failed for ${orderId}:`, error.message);
    await admin
      .from("orders")
      .update({ entitlement_grant_error: error.message })
      .eq("id", orderId);
    return;
  }

  const result = data as { ok?: boolean; code?: string } | null;
  if (result && result.ok === false && result.code === "entitlement_errors") {
    console.error(`[yookassa] entitlement grant errors for order ${orderId}`, result);
  }
}

async function markOrderPaymentFailed(
  orderId: string,
  payment: YookassaPayment,
  reason: string,
): Promise<void> {
  const admin = createSupabaseAdminClient();
  await admin
    .from("orders")
    .update({
      status: "failed",
      payment_status: payment.status,
      payment_error: reason,
      provider_payment_id: payment.id,
      payment_provider: "yookassa",
    })
    .eq("id", orderId)
    .eq("status", "pending_payment");
}

async function handlePaymentSucceeded(paymentId: string): Promise<void> {
  const verified = await getYookassaPayment(paymentId);
  if ("error" in verified) {
    console.error(`[yookassa] payment verification failed for ${paymentId}:`, verified.error);
    return;
  }

  const payment = verified.payment;
  if (payment.status !== "succeeded" || !payment.paid) {
    console.warn(
      `[yookassa] webhook payment.succeeded but API status=${payment.status} paid=${payment.paid}`,
    );
    return;
  }

  const orderIdFromMeta = getOrderIdFromPayment(payment);
  const order =
    (await loadOrderByProviderPaymentId(payment.id)) ??
    (orderIdFromMeta ? await loadOrderById(orderIdFromMeta) : null);

  if (!order) {
    console.error(`[yookassa] order not found for payment ${payment.id}`);
    return;
  }

  if (orderIdFromMeta && orderIdFromMeta !== order.id) {
    console.error(
      `[yookassa] metadata.order_id mismatch for payment ${payment.id}: ${orderIdFromMeta} vs ${order.id}`,
    );
    await markOrderPaymentFailed(order.id, payment, "metadata_mismatch");
    return;
  }

  if (order.provider_payment_id && order.provider_payment_id !== payment.id) {
    console.error(
      `[yookassa] provider_payment_id mismatch for order ${order.id}: ${order.provider_payment_id} vs ${payment.id}`,
    );
    await markOrderPaymentFailed(order.id, payment, "provider_payment_mismatch");
    return;
  }

  const expectedKopecks =
    (await loadOrderItemsTotalKopecks(order.id)) ?? order.total_kopecks;
  const paidKopecks = rublesValueToKopecks(payment.amount.value);
  if (paidKopecks === null || paidKopecks !== expectedKopecks) {
    console.error(
      `[yookassa] amount mismatch for order ${order.id}: expected ${expectedKopecks}, got ${payment.amount.value}`,
    );
    await markOrderPaymentFailed(order.id, payment, "amount_mismatch");
    return;
  }

  if (order.status === "paid") {
    await fulfillPaidOrder(order.id);
    return;
  }

  const admin = createSupabaseAdminClient();
  await admin
    .from("orders")
    .update({
      payment_provider: "yookassa",
      provider_payment_id: payment.id,
      payment_status: payment.status,
      payment_error: null,
    })
    .eq("id", order.id);

  await fulfillPaidOrder(order.id);
}

async function handlePaymentCanceled(paymentId: string): Promise<void> {
  const verified = await getYookassaPayment(paymentId);
  if ("error" in verified) {
    return;
  }

  const payment = verified.payment;
  if (payment.status !== "canceled") {
    return;
  }

  const orderIdFromMeta = getOrderIdFromPayment(payment);
  const order =
    (await loadOrderByProviderPaymentId(payment.id)) ??
    (orderIdFromMeta ? await loadOrderById(orderIdFromMeta) : null);

  if (!order || order.status !== "pending_payment") {
    return;
  }

  await markOrderPaymentFailed(order.id, payment, "payment_canceled");
}

export async function handleYookassaWebhook(
  notification: YookassaNotification,
): Promise<void> {
  const paymentId = notification.object?.id;
  if (!paymentId) {
    return;
  }

  switch (notification.event) {
    case "payment.succeeded":
      await handlePaymentSucceeded(paymentId);
      break;
    case "payment.canceled":
      await handlePaymentCanceled(paymentId);
      break;
    default:
      break;
  }
}
