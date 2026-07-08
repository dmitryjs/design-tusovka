import "server-only";

import type { Database } from "@/types/database.types";

import { kopecksToRublesValue } from "./money";
import type { YookassaReceipt, YookassaReceiptItem } from "./types";

type ProductKind = Database["public"]["Enums"]["product_kind"];

/** ЮKassa ограничивает описание позиции чека 128 символами. */
const RECEIPT_ITEM_DESCRIPTION_MAX = 128;

/** Значение по умолчанию: «Без НДС» (для самозанятого/НПД). */
const DEFAULT_VAT_CODE = 1;

const RECEIPT_DESCRIPTION_PREFIX: Record<string, string> = {
  material: "Доступ к материалу: ",
  section: "Доступ к разделу: ",
  task: "Доступ к заданию: ",
};

const UNKNOWN_DESCRIPTION_PREFIX = "Доступ к цифровому материалу: ";

export type ReceiptItemInput = {
  kind: ProductKind | string | null | undefined;
  title: string | null | undefined;
  priceKopecks: number;
};

function truncate(text: string, max: number): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= max) {
    return normalized;
  }

  return `${normalized.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

export function buildReceiptItemDescription(
  kind: ProductKind | string | null | undefined,
  title: string | null | undefined,
): string {
  const prefix =
    (kind && RECEIPT_DESCRIPTION_PREFIX[kind]) ?? UNKNOWN_DESCRIPTION_PREFIX;
  const safeTitle = (title ?? "").trim() || "цифровой продукт";

  return truncate(`${prefix}${safeTitle}`, RECEIPT_ITEM_DESCRIPTION_MAX);
}

function resolveVatCode(): number {
  const raw = process.env.YOOKASSA_VAT_CODE?.trim();
  if (!raw) {
    return DEFAULT_VAT_CODE;
  }

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 6) {
    return DEFAULT_VAT_CODE;
  }

  return parsed;
}

export function shouldSendReceipt(): boolean {
  const raw = process.env.YOOKASSA_SEND_RECEIPT?.trim().toLowerCase();
  return raw === "true" || raw === "1" || raw === "yes";
}

export function buildReceiptItems(
  items: ReceiptItemInput[],
): YookassaReceiptItem[] {
  const vatCode = resolveVatCode();

  return items.map((item) => ({
    description: buildReceiptItemDescription(item.kind, item.title),
    quantity: "1.00",
    amount: {
      value: kopecksToRublesValue(item.priceKopecks),
      currency: "RUB",
    },
    vat_code: vatCode,
    payment_mode: "full_payment",
    payment_subject: "service",
  }));
}

/**
 * Собирает объект `receipt` для 54-ФЗ. Возвращает `null`, если чек не нужен
 * (не включён env-флагом) или нет контакта покупателя — чтобы не ломать платёж.
 */
export function buildReceipt(
  customerEmail: string | null | undefined,
  items: ReceiptItemInput[],
): YookassaReceipt | null {
  if (!shouldSendReceipt()) {
    return null;
  }

  const email = customerEmail?.trim();
  if (!email || items.length === 0) {
    return null;
  }

  return {
    customer: { email },
    items: buildReceiptItems(items),
  };
}
