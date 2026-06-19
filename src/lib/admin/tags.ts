import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

import type {
  AdminMutationResult,
  AdminTagFormInput,
  AdminTagListItem,
} from "./types";
import { validateTagInput } from "./validation";

function getAdminClient() {
  return createSupabaseAdminClient();
}

export async function listAdminTags(): Promise<AdminTagListItem[]> {
  const admin = getAdminClient();

  const { data, error } = await admin
    .from("tags")
    .select("id, name, slug")
    .order("name");

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getAdminTagDetail(
  tagId: string,
): Promise<AdminTagListItem | null> {
  const admin = getAdminClient();

  const { data, error } = await admin
    .from("tags")
    .select("id, name, slug")
    .eq("id", tagId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createAdminTag(
  input: AdminTagFormInput,
): Promise<AdminMutationResult> {
  const fieldErrors = validateTagInput(input);

  if (fieldErrors) {
    return { ok: false, fieldErrors };
  }

  const admin = getAdminClient();

  const { data, error } = await admin
    .from("tags")
    .insert({
      name: input.name.trim(),
      slug: input.slug.trim(),
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Не удалось создать тег" };
  }

  return { ok: true, data: data.id };
}

export async function updateAdminTag(
  tagId: string,
  input: AdminTagFormInput,
): Promise<AdminMutationResult> {
  const fieldErrors = validateTagInput(input);

  if (fieldErrors) {
    return { ok: false, fieldErrors };
  }

  const admin = getAdminClient();

  const { error } = await admin
    .from("tags")
    .update({
      name: input.name.trim(),
      slug: input.slug.trim(),
    })
    .eq("id", tagId);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, data: tagId };
}
