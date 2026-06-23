"use server";

import { assertAdmin } from "@/lib/auth/admin";
import { MATERIAL_MEDIA_MAX_BYTES, MATERIAL_MEDIA_MAX_LABEL } from "@/lib/content/media-limits";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const BUCKET = "public-media";

export type UploadMaterialMediaResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

export async function uploadMaterialMediaAction(
  formData: FormData,
): Promise<UploadMaterialMediaResult> {
  try {
    await assertAdmin();
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error && error.message === "FORBIDDEN"
          ? "Нет прав администратора"
          : "Требуется вход",
    };
  }

  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Файл не выбран" };
  }

  if (file.size > MATERIAL_MEDIA_MAX_BYTES) {
    return { ok: false, error: `Файл слишком большой (максимум ${MATERIAL_MEDIA_MAX_LABEL})` };
  }

  const safeName = file.name.replace(/[^\w.\-()+\s]/gi, "_");
  const path = `materials/${crypto.randomUUID()}-${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const admin = createSupabaseAdminClient();

  const { error } = await admin.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  if (error) {
    return {
      ok: false,
      error:
        error.message.includes("Bucket not found")
          ? "Bucket public-media не настроен в Supabase Storage"
          : error.message,
    };
  }

  const { data } = admin.storage.from(BUCKET).getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}

export async function uploadSectionCoverAction(
  formData: FormData,
): Promise<UploadMaterialMediaResult> {
  try {
    await assertAdmin();
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error && error.message === "FORBIDDEN"
          ? "Нет прав администратора"
          : "Требуется вход",
    };
  }

  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Файл не выбран" };
  }

  if (!file.type.startsWith("image/")) {
    return { ok: false, error: "Загрузите изображение (PNG, JPG или WebP)" };
  }

  if (file.size > MATERIAL_MEDIA_MAX_BYTES) {
    return { ok: false, error: `Файл слишком большой (максимум ${MATERIAL_MEDIA_MAX_LABEL})` };
  }

  const safeName = file.name.replace(/[^\w.\-()+\s]/gi, "_");
  const path = `sections/${crypto.randomUUID()}-${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const admin = createSupabaseAdminClient();

  const { error } = await admin.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  if (error) {
    return {
      ok: false,
      error:
        error.message.includes("Bucket not found")
          ? "Bucket public-media не настроен в Supabase Storage"
          : error.message,
    };
  }

  const { data } = admin.storage.from(BUCKET).getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}
