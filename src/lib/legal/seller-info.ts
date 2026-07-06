/** Fallback URL, если `NEXT_PUBLIC_SITE_URL` не задан. */
const FALLBACK_SITE_URL = "https://design-tusovka.vercel.app";

export const SELLER_INFO = {
  sellerName: "Галкина Александра Германовна",
  sellerStatus: "Плательщик налога на профессиональный доход",
  sellerInn: "782003241079",
  sellerEmail: "designtusovka@yandex.ru",
  /** Fallback; на страницах предпочтительнее `getPublicSiteUrl()`. */
  siteUrl: FALLBACK_SITE_URL,
  taxMode: "Налог на профессиональный доход",
  receiptInfo:
    "Чек формируется и направляется покупателю в порядке, предусмотренном режимом НПД",
  correspondenceAddress: "по запросу через email поддержки",
  /** Дата публикации оферты и политики конфиденциальности */
  legalPublishedAt: "06.07.2026",
  supportResponseNote: "до 3 рабочих дней",
  refundReviewDays: "10 календарных дней",
} as const;

export function getSupportResponseText(): string {
  return SELLER_INFO.supportResponseNote;
}

/** Production URLs для документации (без payment logic). */
export const PRODUCTION_URLS = {
  site: SELLER_INFO.siteUrl,
  authCallback: `${SELLER_INFO.siteUrl}/auth/callback`,
  checkoutSuccess: `${SELLER_INFO.siteUrl}/checkout/success`,
  checkoutFail: `${SELLER_INFO.siteUrl}/checkout/fail`,
  webhook: `${SELLER_INFO.siteUrl}/api/webhooks/yookassa`,
  requisites: `${SELLER_INFO.siteUrl}/requisites`,
  offer: `${SELLER_INFO.siteUrl}/offer`,
  privacy: `${SELLER_INFO.siteUrl}/privacy`,
  paymentAndRefund: `${SELLER_INFO.siteUrl}/payment-and-refund`,
  support: `${SELLER_INFO.siteUrl}/support`,
} as const;
