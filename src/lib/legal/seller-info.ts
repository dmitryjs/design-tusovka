export const SELLER_INFO = {
  legalName: "Индивидуальный предприниматель Галкин Дмитрий Николаевич",
  /** Краткое ФИО для формулировок «ИП …» */
  shortLegalName: "Галкин Дмитрий Николаевич",
  inn: "780529265784",
  ogrnip: "323784700280971",
  /**
   * TODO: указать юридический адрес регистрации ИП.
   * Пока null — на юридических страницах показывается пометка для замены.
   */
  legalAddress: null as string | null,
  supportEmail: "galkin.products@gmail.com",
  siteUrl: "https://design-tusovka.vercel.app",
  /** Дата публикации оферты и политики конфиденциальности */
  legalPublishedAt: "19.06.2026",
  supportResponseNote: "до 3 рабочих дней",
  refundReviewDays: "10 календарных дней",
} as const;

export function getSupportResponseText(): string {
  return SELLER_INFO.supportResponseNote;
}

/** Production URLs для ЮKassa и документации (без payment logic). */
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
