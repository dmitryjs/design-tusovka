import { NextResponse, type NextRequest } from "next/server";

import { isYookassaWebhookIp } from "@/lib/payments/yookassa/ip-allowlist";
import { handleYookassaWebhook } from "@/lib/payments/yookassa/webhook";
import type { YookassaNotification } from "@/lib/payments/yookassa/types";

export const runtime = "nodejs";

function getClientIp(request: NextRequest): string | null {
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) {
    return realIp;
  }

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? null;
  }

  return null;
}

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);
  // IP check is defense-in-depth; payment status is always verified via YooKassa API.
  const skipIpCheck = process.env.NODE_ENV === "development";

  if (!skipIpCheck && !isYookassaWebhookIp(clientIp)) {
    console.warn(`[yookassa] rejected webhook from IP ${clientIp ?? "unknown"}`);
    return new NextResponse(null, { status: 403 });
  }

  let notification: YookassaNotification;
  try {
    notification = (await request.json()) as YookassaNotification;
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  if (notification.type !== "notification" || !notification.event || !notification.object) {
    return new NextResponse(null, { status: 400 });
  }

  try {
    await handleYookassaWebhook(notification);
  } catch (error) {
    console.error("[yookassa] webhook handler error:", error);
    return new NextResponse(null, { status: 500 });
  }

  return new NextResponse(null, { status: 200 });
}
