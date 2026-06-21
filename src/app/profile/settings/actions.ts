"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

type ActionResult = {
  ok: boolean;
  message: string;
};

export async function updateProfileAction(input: {
  displayName: string;
  avatarPath: string | null;
  telegramUsername: string | null;
  designerLevel: Database["public"]["Enums"]["designer_level"];
}): Promise<ActionResult> {
  const supabase = (await createSupabaseServerClient()) as unknown as SupabaseClient<Database>;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Требуется вход в аккаунт." };
  }

  const displayName = input.displayName.trim();

  if (!displayName) {
    return { ok: false, message: "Укажите имя." };
  }

  const telegramUsername = input.telegramUsername?.trim().replace(/^@/, "") ?? "";

  const { error } = await supabase.rpc("update_my_profile", {
    display_name: displayName,
    avatar_path: input.avatarPath ?? "",
    telegram_username: telegramUsername,
    designer_level: input.designerLevel,
  });

  if (error) {
    return { ok: false, message: "Не удалось сохранить профиль. Попробуйте позже." };
  }

  revalidatePath("/profile");
  revalidatePath("/profile/settings");

  return { ok: true, message: "Изменения сохранены." };
}
