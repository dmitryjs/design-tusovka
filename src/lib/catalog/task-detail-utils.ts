import type { Database } from "@/types/database.types";

import type { FreeProductClaimState } from "@/lib/entitlements/types";
import type { PaidProductCartState } from "@/lib/cart/types";

import type { MaterialPriceBadgeKind } from "./material-detail-utils";

const ESTIMATED_HOURS: Record<
  Database["public"]["Enums"]["designer_level"],
  string
> = {
  junior: "2–4 часа",
  middle: "4–6 часов",
  senior: "6–8 часов",
  all: "4–6 часов",
};

export function resolveTaskEstimatedHours(
  level: Database["public"]["Enums"]["designer_level"],
): string {
  return ESTIMATED_HOURS[level];
}

export function resolveTaskGoal(brief: string[], title: string): string {
  if (brief.length > 0) {
    return brief[0];
  }

  return `Выполните задание «${title}» и подготовьте решение для проверки.`;
}

export function resolveTaskOwned(
  priceKopecks: number,
  hasFullAccess: boolean,
  claimState: FreeProductClaimState,
  cartState: PaidProductCartState,
): boolean {
  if (priceKopecks > 0 && hasFullAccess) {
    return true;
  }

  if (claimState === "claimed") {
    return true;
  }

  return cartState === "in_library";
}

export function resolveTaskPriceBadgeKind(
  priceKopecks: number,
  hasFullAccess: boolean,
  isOwned: boolean,
): MaterialPriceBadgeKind {
  if (isOwned) {
    return "owned";
  }

  if (priceKopecks === 0) {
    return "free";
  }

  if (hasFullAccess) {
    return "owned";
  }

  return "paid";
}

export function formatTaskUpdatedAt(value: string | null): string | null {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}
