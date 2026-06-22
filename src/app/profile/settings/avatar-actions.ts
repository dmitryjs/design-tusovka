"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getProfileSettingsData } from "@/lib/profile/queries";
import { getPublicMediaBucket, isStorageUploadConfigured } from "@/lib/storage/config";
import {
  isAllowedAvatarMime,
  parseStoragePublicUrl,
} from "@/lib/storage/public-url";
import type { Database } from "@/types/database.types";

const MAX_AVATAR_BYTES = 10 * 1024 * 1024;
const BUCKET = getPublicMediaBucket();

type AvatarActionResult = { ok: true } | { ok: false; error: string };

async function getAuthedProfile() {
  const data = await getProfileSettingsData();
  if (!data) {
    return null;
  }
  return data.profile;
}

export async function uploadProfileAvatarAction(
  formData: FormData,
): Promise<AvatarActionResult> {
  if (!isStorageUploadConfigured()) {
    return {
      ok: false,
      error: "Storage не настроен. Добавьте ключи Supabase и создайте bucket public-media.",
    };
  }

  const profileData = await getAuthedProfile();
  if (!profileData) {
    return { ok: false, error: "Требуется вход в аккаунт." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Файл не выбран." };
  }

  if (file.size > MAX_AVATAR_BYTES) {
    return { ok: false, error: "Файл слишком большой (максимум 10 МБ)." };
  }

  if (!isAllowedAvatarMime(file.type)) {
    return { ok: false, error: "Допустимы только JPG, PNG или WEBP." };
  }

  const userId = profileData.user.id;
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const objectPath = `avatars/${userId}/${crypto.randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const admin = createSupabaseAdminClient();

  const oldParsed = profileData.profile.avatar_path
    ? parseStoragePublicUrl(profileData.profile.avatar_path)
    : null;

  const { error: uploadError } = await admin.storage.from(BUCKET).upload(objectPath, buffer, {
    contentType: file.type,
    upsert: false,
  });

  if (uploadError) {
    return {
      ok: false,
      error: uploadError.message.includes("Bucket not found")
        ? "Bucket public-media не создан. Выполните supabase/cloud_patch_storage.sql."
        : uploadError.message,
    };
  }

  const { data: publicUrlData } = admin.storage.from(BUCKET).getPublicUrl(objectPath);
  const publicUrl = publicUrlData.publicUrl;

  const supabase = (await createSupabaseServerClient()) as unknown as SupabaseClient<Database>;
  const row = profileData.profile;

  const { error: profileError } = await supabase.rpc("update_my_profile", {
    display_name: row.display_name ?? "",
    avatar_path: publicUrl,
    telegram_username: row.telegram_username ?? "",
    designer_level: row.designer_level,
  });

  if (profileError) {
    await admin.storage.from(BUCKET).remove([objectPath]);
    return { ok: false, error: "Не удалось сохранить аватар в профиле." };
  }

  if (oldParsed && oldParsed.bucket === BUCKET && oldParsed.path !== objectPath) {
    await admin.storage.from(BUCKET).remove([oldParsed.path]);
  }

  revalidatePath("/profile");
  revalidatePath("/profile/settings");

  return { ok: true };
}

export async function removeProfileAvatarAction(): Promise<AvatarActionResult> {
  if (!isStorageUploadConfigured()) {
    return { ok: false, error: "Storage не настроен." };
  }

  const profileData = await getAuthedProfile();
  if (!profileData) {
    return { ok: false, error: "Требуется вход в аккаунт." };
  }

  const parsed = profileData.profile.avatar_path
    ? parseStoragePublicUrl(profileData.profile.avatar_path)
    : null;

  const supabase = (await createSupabaseServerClient()) as unknown as SupabaseClient<Database>;
  const row = profileData.profile;

  const { error: profileError } = await supabase.rpc("update_my_profile", {
    display_name: row.display_name ?? "",
    avatar_path: "",
    telegram_username: row.telegram_username ?? "",
    designer_level: row.designer_level,
  });

  if (profileError) {
    return { ok: false, error: "Не удалось обновить профиль." };
  }

  if (parsed && parsed.bucket === BUCKET) {
    const admin = createSupabaseAdminClient();
    await admin.storage.from(BUCKET).remove([parsed.path]);
  }

  revalidatePath("/profile");
  revalidatePath("/profile/settings");

  return { ok: true };
}
