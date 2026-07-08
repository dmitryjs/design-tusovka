import "server-only";

import { YOOKASSA_API_BASE, getYookassaConfig } from "./config";
import type {
  YookassaPayment,
  YookassaPaymentMethod,
  YookassaReceipt,
} from "./types";

type CreatePaymentInput = {
  amountKopecks: number;
  description: string;
  returnUrl: string;
  idempotenceKey: string;
  metadata: Record<string, string>;
  paymentMethod?: YookassaPaymentMethod;
  receipt?: YookassaReceipt | null;
};

function getAuthHeader(shopId: string, secretKey: string): string {
  const token = Buffer.from(`${shopId}:${secretKey}`).toString("base64");
  return `Basic ${token}`;
}

async function parseApiError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as {
      description?: string;
      code?: string;
    };
    return body.description ?? body.code ?? `HTTP ${response.status}`;
  } catch {
    return `HTTP ${response.status}`;
  }
}

export async function createYookassaPaymentRequest(
  input: CreatePaymentInput,
): Promise<{ payment: YookassaPayment } | { error: string }> {
  const config = getYookassaConfig();
  if (!config) {
    return { error: "YooKassa is not configured" };
  }

  const response = await fetch(`${YOOKASSA_API_BASE}/payments`, {
    method: "POST",
    headers: {
      Authorization: getAuthHeader(config.shopId, config.secretKey),
      "Content-Type": "application/json",
      "Idempotence-Key": input.idempotenceKey,
    },
    body: JSON.stringify({
      amount: {
        value: (input.amountKopecks / 100).toFixed(2),
        currency: "RUB",
      },
      capture: true,
      confirmation: {
        type: "redirect",
        return_url: input.returnUrl,
      },
      ...(input.paymentMethod
        ? { payment_method_data: { type: input.paymentMethod } }
        : {}),
      ...(input.receipt ? { receipt: input.receipt } : {}),
      description: input.description,
      metadata: input.metadata,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    return { error: await parseApiError(response) };
  }

  const payment = (await response.json()) as YookassaPayment;
  return { payment };
}

export async function getYookassaPayment(
  paymentId: string,
): Promise<{ payment: YookassaPayment } | { error: string }> {
  const config = getYookassaConfig();
  if (!config) {
    return { error: "YooKassa is not configured" };
  }

  const response = await fetch(`${YOOKASSA_API_BASE}/payments/${paymentId}`, {
    method: "GET",
    headers: {
      Authorization: getAuthHeader(config.shopId, config.secretKey),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return { error: await parseApiError(response) };
  }

  const payment = (await response.json()) as YookassaPayment;
  return { payment };
}
