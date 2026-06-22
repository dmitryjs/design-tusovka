"use server";

import { revalidatePath } from "next/cache";

import { assertAdmin } from "@/lib/auth/admin";
import { setReviewHidden } from "@/lib/admin/reviews";
import type { AdminMutationResult } from "@/lib/admin/types";

async function guardAdmin(): Promise<AdminMutationResult | null> {
  try {
    await assertAdmin();
    return null;
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error && error.message === "FORBIDDEN"
          ? "Нет прав администратора"
          : "Требуется вход",
    };
  }
}

export async function setReviewHiddenAction(
  reviewId: string,
  hidden: boolean,
): Promise<AdminMutationResult> {
  const guard = await guardAdmin();
  if (guard) {
    return guard;
  }

  try {
    await setReviewHidden(reviewId, hidden);
    revalidatePath("/admin/reviews");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Не удалось обновить отзыв",
    };
  }
}
