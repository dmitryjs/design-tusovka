"use server";

import { revalidatePath } from "next/cache";

import { assertAdmin } from "@/lib/auth/admin";
import {
  grantManualProductAccess,
  revokeEntitlement,
  setUserDeactivated,
} from "@/lib/admin/users";
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

export async function setUserDeactivatedAction(
  userId: string,
  deactivated: boolean,
): Promise<AdminMutationResult> {
  const guard = await guardAdmin();
  if (guard) {
    return guard;
  }

  try {
    await setUserDeactivated(userId, deactivated);
    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${userId}`);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Не удалось обновить пользователя",
    };
  }
}

export async function grantManualAccessAction(
  userId: string,
  productId: string,
): Promise<AdminMutationResult> {
  const guard = await guardAdmin();
  if (guard) {
    return guard;
  }

  try {
    const { user } = await assertAdmin();
    await grantManualProductAccess(userId, productId, user.id);
    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${userId}`);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Не удалось выдать доступ",
    };
  }
}

export async function revokeEntitlementAction(
  entitlementId: string,
  userId: string,
): Promise<AdminMutationResult> {
  const guard = await guardAdmin();
  if (guard) {
    return guard;
  }

  try {
    await revokeEntitlement(entitlementId);
    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${userId}`);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Не удалось отозвать доступ",
    };
  }
}
