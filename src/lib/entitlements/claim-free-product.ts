import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

import { getClaimFreeProductMessage } from "./messages";
import type { ClaimFreeProductCode, ClaimFreeProductResult } from "./types";

type RpcClaimResult = {
  ok?: boolean;
  code?: string;
  product_id?: string;
  slug?: string;
};

function parseClaimCode(value: string | undefined): ClaimFreeProductCode {
  switch (value) {
    case "claimed":
    case "already_claimed":
    case "unauthenticated":
    case "not_found":
    case "not_free":
    case "unsupported_kind":
      return value;
    default:
      return "rpc_error";
  }
}

export async function claimFreeProduct(
  slug: string,
): Promise<ClaimFreeProductResult> {
  const trimmedSlug = slug.trim();

  if (!trimmedSlug) {
    return {
      ok: false,
      code: "not_found",
      message: getClaimFreeProductMessage("not_found"),
    };
  }

  const supabase = (await createSupabaseServerClient()) as unknown as SupabaseClient<Database>;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      code: "unauthenticated",
      message: getClaimFreeProductMessage("unauthenticated"),
    };
  }

  const { data, error } = await supabase.rpc("claim_free_product", {
    p_slug: trimmedSlug,
  });

  if (error) {
    const hint =
      error.code === "PGRST202" ||
      error.message.includes("claim_free_product") ||
      error.message.includes("schema cache")
        ? "Функция claim_free_product не найдена в Supabase. Откройте проект из .env.local → SQL Editor → выполните supabase/cloud_patch_free_entitlements.sql целиком → Run."
        : getClaimFreeProductMessage("rpc_error");

    return {
      ok: false,
      code: "rpc_error",
      message: hint,
    };
  }

  const payload = data as RpcClaimResult | null;
  const code = parseClaimCode(payload?.code);
  const ok = Boolean(payload?.ok) && code !== "rpc_error";

  return {
    ok,
    code,
    productId: payload?.product_id,
    slug: payload?.slug ?? trimmedSlug,
    message: getClaimFreeProductMessage(code),
  };
}
