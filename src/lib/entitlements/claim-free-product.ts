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

type ServerSupabase = SupabaseClient<Database>;

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

async function claimFreeSectionViaMaterials(
  supabase: ServerSupabase,
  sectionId: string,
  sectionSlug: string,
): Promise<ClaimFreeProductResult> {
  const { data: materialRows, error: materialsError } = await supabase
    .from("materials")
    .select(
      `
      product_id,
      products!inner (
        id,
        slug,
        kind,
        status,
        price_kopecks
      )
    `,
    )
    .eq("section_product_id", sectionId)
    .eq("products.status", "published")
    .eq("products.kind", "material");

  if (materialsError) {
    return {
      ok: false,
      code: "rpc_error",
      message: getClaimFreeProductMessage("rpc_error"),
    };
  }

  const freeMaterials = (materialRows ?? [])
    .map((row) => {
      const linked = row.products;
      const product = Array.isArray(linked) ? linked[0] : linked;
      if (!product || product.price_kopecks !== 0) {
        return null;
      }
      return product;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  if (freeMaterials.length === 0) {
    return {
      ok: false,
      code: "not_free",
      message: getClaimFreeProductMessage("not_free"),
    };
  }

  let claimedNew = false;

  for (const material of freeMaterials) {
    const { data, error } = await supabase.rpc("claim_free_product", {
      p_slug: material.slug,
    });

    if (error) {
      return {
        ok: false,
        code: "rpc_error",
        message: getClaimFreeProductMessage("rpc_error"),
      };
    }

    const payload = data as RpcClaimResult | null;
    const code = parseClaimCode(payload?.code);

    if (!payload?.ok && code !== "already_claimed") {
      return {
        ok: false,
        code,
        productId: sectionId,
        slug: sectionSlug,
        message: getClaimFreeProductMessage(code),
      };
    }

    if (code === "claimed") {
      claimedNew = true;
    }
  }

  return {
    ok: true,
    code: claimedNew ? "claimed" : "already_claimed",
    productId: sectionId,
    slug: sectionSlug,
    message: getClaimFreeProductMessage(claimedNew ? "claimed" : "already_claimed"),
  };
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

  const supabase = (await createSupabaseServerClient()) as unknown as ServerSupabase;
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
        ? "Функция claim_free_product не найдена в Supabase. Откройте проект из .env.local → SQL Editor → выполните supabase/cloud_patch_claim_free_section.sql целиком → Run."
        : getClaimFreeProductMessage("rpc_error");

    return {
      ok: false,
      code: "rpc_error",
      message: hint,
    };
  }

  const payload = data as RpcClaimResult | null;
  const code = parseClaimCode(payload?.code);

  if (code === "unsupported_kind") {
    const { data: product } = await supabase
      .from("products")
      .select("id, slug, kind, price_kopecks, status")
      .eq("slug", trimmedSlug)
      .eq("status", "published")
      .maybeSingle();

    if (product?.kind === "section" && product.price_kopecks === 0) {
      return claimFreeSectionViaMaterials(supabase, product.id, product.slug);
    }
  }

  const ok = Boolean(payload?.ok) && code !== "rpc_error";

  return {
    ok,
    code,
    productId: payload?.product_id,
    slug: payload?.slug ?? trimmedSlug,
    message: getClaimFreeProductMessage(code),
  };
}
