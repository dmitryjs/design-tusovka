import "server-only";

import type { User } from "@supabase/supabase-js";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database.types";

type AdminClient = ReturnType<typeof createSupabaseAdminClient>;

export async function buildUserEmailMap(admin: AdminClient): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  let page = 1;

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    });

    if (error) {
      throw new Error(error.message);
    }

    for (const user of data.users) {
      map.set(user.id, user.email ?? "");
    }

    if (data.users.length < 200) {
      break;
    }

    page += 1;
  }

  return map;
}

export async function getAuthUserById(
  admin: AdminClient,
  userId: string,
): Promise<User | null> {
  const { data, error } = await admin.auth.admin.getUserById(userId);

  if (error || !data.user) {
    return null;
  }

  return data.user;
}

export type AdminUserListItem = {
  id: string;
  email: string;
  displayName: string | null;
  designerLevel: Database["public"]["Enums"]["designer_level"];
  role: Database["public"]["Enums"]["profile_role"];
  deactivatedAt: string | null;
  createdAt: string;
  entitlementsCount: number;
  ordersCount: number;
};

export type AdminUserEntitlement = {
  id: string;
  productId: string;
  productTitle: string;
  productSlug: string;
  productKind: Database["public"]["Enums"]["product_kind"];
  sourceType: Database["public"]["Enums"]["entitlement_source_type"];
  grantedAt: string;
  revokedAt: string | null;
};

export type AdminUserDetail = AdminUserListItem & {
  telegramUsername: string | null;
  entitlements: AdminUserEntitlement[];
};

export async function listAdminUsers(): Promise<AdminUserListItem[]> {
  const admin = createSupabaseAdminClient();

  const [{ data: profiles, error: profilesError }, emailMap] = await Promise.all([
    admin
      .from("profiles")
      .select("id, display_name, designer_level, role, deactivated_at, created_at")
      .order("created_at", { ascending: false }),
    buildUserEmailMap(admin),
  ]);

  if (profilesError) {
    throw new Error(profilesError.message);
  }

  const userIds = (profiles ?? []).map((profile) => profile.id);

  const entitlementCounts = new Map<string, number>();
  const orderCounts = new Map<string, number>();

  if (userIds.length > 0) {
    const [{ data: entitlements }, { data: orders }] = await Promise.all([
      admin
        .from("entitlements")
        .select("user_id")
        .in("user_id", userIds)
        .is("revoked_at", null),
      admin.from("orders").select("user_id").in("user_id", userIds),
    ]);

    for (const row of entitlements ?? []) {
      entitlementCounts.set(row.user_id, (entitlementCounts.get(row.user_id) ?? 0) + 1);
    }

    for (const row of orders ?? []) {
      orderCounts.set(row.user_id, (orderCounts.get(row.user_id) ?? 0) + 1);
    }
  }

  return (profiles ?? []).map((profile) => ({
    id: profile.id,
    email: emailMap.get(profile.id) ?? "—",
    displayName: profile.display_name,
    designerLevel: profile.designer_level,
    role: profile.role,
    deactivatedAt: profile.deactivated_at,
    createdAt: profile.created_at,
    entitlementsCount: entitlementCounts.get(profile.id) ?? 0,
    ordersCount: orderCounts.get(profile.id) ?? 0,
  }));
}

export async function getAdminUserDetail(userId: string): Promise<AdminUserDetail | null> {
  const admin = createSupabaseAdminClient();

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select(
      "id, display_name, designer_level, role, deactivated_at, created_at, telegram_username",
    )
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (!profile) {
    return null;
  }

  const authUser = await getAuthUserById(admin, userId);

  const [{ data: entitlements, error: entitlementsError }, { count: ordersCount }] =
    await Promise.all([
      admin
        .from("entitlements")
        .select(
          `
        id,
        product_id,
        source_type,
        granted_at,
        revoked_at,
        products!inner ( title, slug, kind )
      `,
        )
        .eq("user_id", userId)
        .order("granted_at", { ascending: false }),
      admin
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId),
    ]);

  if (entitlementsError) {
    throw new Error(entitlementsError.message);
  }

  type EntitlementRow = {
    id: string;
    product_id: string;
    source_type: Database["public"]["Enums"]["entitlement_source_type"];
    granted_at: string;
    revoked_at: string | null;
    products: { title: string; slug: string; kind: Database["public"]["Enums"]["product_kind"] };
  };

  const mappedEntitlements: AdminUserEntitlement[] = ((entitlements as EntitlementRow[] | null) ??
    []
  ).map((row) => ({
    id: row.id,
    productId: row.product_id,
    productTitle: row.products.title,
    productSlug: row.products.slug,
    productKind: row.products.kind,
    sourceType: row.source_type,
    grantedAt: row.granted_at,
    revokedAt: row.revoked_at,
  }));

  const activeEntitlements = mappedEntitlements.filter((item) => !item.revokedAt).length;

  return {
    id: profile.id,
    email: authUser?.email ?? "—",
    displayName: profile.display_name,
    designerLevel: profile.designer_level,
    role: profile.role,
    deactivatedAt: profile.deactivated_at,
    createdAt: profile.created_at,
    telegramUsername: profile.telegram_username,
    entitlementsCount: activeEntitlements,
    ordersCount: ordersCount ?? 0,
    entitlements: mappedEntitlements,
  };
}

export async function setUserDeactivated(
  userId: string,
  deactivated: boolean,
): Promise<void> {
  const admin = createSupabaseAdminClient();

  const { error } = await admin
    .from("profiles")
    .update({ deactivated_at: deactivated ? new Date().toISOString() : null })
    .eq("id", userId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function grantManualProductAccess(
  userId: string,
  productId: string,
  adminUserId: string,
): Promise<void> {
  const admin = createSupabaseAdminClient();

  const { data: product, error: productError } = await admin
    .from("products")
    .select("id, status")
    .eq("id", productId)
    .maybeSingle();

  if (productError) {
    throw new Error(productError.message);
  }

  if (!product || product.status !== "published") {
    throw new Error("Товар не найден или не опубликован");
  }

  const { data: existing } = await admin
    .from("entitlements")
    .select("id")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .eq("source_type", "manual")
    .is("revoked_at", null)
    .maybeSingle();

  if (existing) {
    throw new Error("У пользователя уже есть активный доступ к этому товару");
  }

  const { error } = await admin.from("entitlements").insert({
    user_id: userId,
    product_id: productId,
    source_type: "manual",
    source_id: adminUserId,
    metadata: { granted_by: "admin" },
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function revokeEntitlement(entitlementId: string): Promise<void> {
  const admin = createSupabaseAdminClient();

  const { error } = await admin
    .from("entitlements")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", entitlementId)
    .is("revoked_at", null);

  if (error) {
    throw new Error(error.message);
  }
}

export async function listPublishedProductsForGrant(): Promise<
  Array<{ id: string; title: string; slug: string; kind: string }>
> {
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from("products")
    .select("id, title, slug, kind")
    .eq("status", "published")
    .in("kind", ["material", "task", "section"])
    .order("title");

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}
