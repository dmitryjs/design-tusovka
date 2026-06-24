import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

import type {
  AdminMutationResult,
  AdminTagFormInput,
  AdminTagListItem,
} from "./types";
import { slugFromTagName } from "./tag-slug";
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

export type AdminTagRecord = {
  id: string;
  name: string;
  slug: string;
};

async function findAdminTagByName(
  admin: ReturnType<typeof getAdminClient>,
  name: string,
): Promise<AdminTagRecord | null> {
  const { data, error } = await admin
    .from("tags")
    .select("id, name, slug")
    .ilike("name", name)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

async function ensureUniqueTagSlug(
  admin: ReturnType<typeof getAdminClient>,
  baseSlug: string,
): Promise<string> {
  let candidate = baseSlug;
  let suffix = 2;

  while (true) {
    const { count, error } = await admin
      .from("tags")
      .select("*", { count: "exact", head: true })
      .eq("slug", candidate);

    if (error) {
      throw new Error(error.message);
    }

    if ((count ?? 0) === 0) {
      return candidate;
    }

    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

export async function findOrCreateAdminTagByName(
  name: string,
): Promise<AdminMutationResult<AdminTagRecord>> {
  const trimmed = name.trim();

  if (!trimmed) {
    return { ok: false, error: "Укажите название тега" };
  }

  const admin = getAdminClient();

  try {
    const existing = await findAdminTagByName(admin, trimmed);
    if (existing) {
      return { ok: true, data: existing };
    }

    const baseSlug = slugFromTagName(trimmed);
    const slug = await ensureUniqueTagSlug(admin, baseSlug);

    const fieldErrors = validateTagInput({ name: trimmed, slug });
    if (fieldErrors) {
      return { ok: false, fieldErrors };
    }

    const { data, error } = await admin
      .from("tags")
      .insert({
        name: trimmed,
        slug,
      })
      .select("id, name, slug")
      .single();

    if (error || !data) {
      return { ok: false, error: error?.message ?? "Не удалось создать тег" };
    }

    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Не удалось создать тег",
    };
  }
}
