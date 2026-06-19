import "server-only";

import { getPublicSiteUrl } from "@/lib/site-url";

export type YookassaConfig = {
  shopId: string;
  secretKey: string;
  returnUrl: string;
};

export function isYookassaConfigured(): boolean {
  return Boolean(
    process.env.YOOKASSA_SHOP_ID?.trim() &&
      process.env.YOOKASSA_SECRET_KEY?.trim() &&
      getYookassaReturnUrl(),
  );
}

export function getYookassaReturnUrl(): string | null {
  const explicit = process.env.YOOKASSA_RETURN_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }

  const siteUrl = getPublicSiteUrl();
  if (!siteUrl) {
    return null;
  }

  return `${siteUrl}/checkout/success`;
}

export function getYookassaConfig(): YookassaConfig | null {
  const shopId = process.env.YOOKASSA_SHOP_ID?.trim();
  const secretKey = process.env.YOOKASSA_SECRET_KEY?.trim();
  const returnUrl = getYookassaReturnUrl();

  if (!shopId || !secretKey || !returnUrl) {
    return null;
  }

  return { shopId, secretKey, returnUrl };
}

export const YOOKASSA_API_BASE = "https://api.yookassa.ru/v3";
