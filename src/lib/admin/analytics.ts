import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database.types";

import { buildUserEmailMap } from "./users";

export type AdminOrderSummary = {
  pendingPayment: number;
  failed: number;
  cancelled: number;
};

export type AdminContentSummary = {
  materialsPublished: number;
  materialsDraft: number;
  materialsHidden: number;
  tasksPublished: number;
  tasksDraft: number;
  tasksHidden: number;
  sectionsPublished: number;
  sectionsDraft: number;
  sectionsHidden: number;
  tagsCount: number;
};

export type AdminDashboardOverview = {
  stats: AdminDashboardStats;
  content: AdminContentSummary;
  orders: AdminOrderSummary;
  topSales: AdminProductSalesRow[];
  recentOrders: AdminRecentOrderRow[];
};

export type AdminDashboardStats = {
  totalUsers: number;
  activeUsers: number;
  paidOrders: number;
  revenueKopecks: number;
  freeOrders: number;
  grantErrors: number;
  visibleReviews: number;
  hiddenReviews: number;
  conversionRate: number | null;
};

export type AdminProductSalesRow = {
  productId: string;
  title: string;
  slug: string;
  kind: Database["public"]["Enums"]["product_kind"];
  salesCount: number;
  revenueKopecks: number;
};

export type AdminRecentOrderRow = {
  id: string;
  userId: string;
  userEmail: string;
  status: Database["public"]["Enums"]["order_status"];
  totalKopecks: number;
  createdAt: string;
  entitlementGrantError: string | null;
};

function escapeCsvCell(value: string | number | null | undefined): string {
  const text = value == null ? "" : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function toCsv(headers: string[], rows: Array<Array<string | number | null>>): string {
  const lines = [
    headers.map(escapeCsvCell).join(","),
    ...rows.map((row) => row.map(escapeCsvCell).join(",")),
  ];
  return `\uFEFF${lines.join("\n")}`;
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const admin = createSupabaseAdminClient();

  const [
    { count: totalUsers },
    { count: activeUsers },
    { data: paidOrders },
    { count: freeOrders },
    { count: grantErrors },
    { count: visibleReviews },
    { count: hiddenReviews },
  ] = await Promise.all([
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .is("deactivated_at", null),
    admin.from("orders").select("total_kopecks").eq("status", "paid"),
    admin
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "paid")
      .eq("total_kopecks", 0),
    admin
      .from("orders")
      .select("id", { count: "exact", head: true })
      .not("entitlement_grant_error", "is", null),
    admin
      .from("product_reviews")
      .select("id", { count: "exact", head: true })
      .eq("is_hidden", false),
    admin
      .from("product_reviews")
      .select("id", { count: "exact", head: true })
      .eq("is_hidden", true),
  ]);

  const paidOrdersCount = paidOrders?.length ?? 0;
  const revenueKopecks = (paidOrders ?? []).reduce(
    (sum, order) => sum + order.total_kopecks,
    0,
  );

  const conversionRate =
    totalUsers && totalUsers > 0
      ? Math.round((paidOrdersCount / totalUsers) * 1000) / 10
      : null;

  return {
    totalUsers: totalUsers ?? 0,
    activeUsers: activeUsers ?? 0,
    paidOrders: paidOrdersCount,
    revenueKopecks,
    freeOrders: freeOrders ?? 0,
    grantErrors: grantErrors ?? 0,
    visibleReviews: visibleReviews ?? 0,
    hiddenReviews: hiddenReviews ?? 0,
    conversionRate,
  };
}

async function countProducts(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  kind: Database["public"]["Enums"]["product_kind"],
  status: Database["public"]["Enums"]["product_status"],
): Promise<number> {
  const { count } = await admin
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("kind", kind)
    .eq("status", status);

  return count ?? 0;
}

export async function getAdminContentSummary(): Promise<AdminContentSummary> {
  const admin = createSupabaseAdminClient();

  const [
    materialsPublished,
    materialsDraft,
    materialsHidden,
    tasksPublished,
    tasksDraft,
    tasksHidden,
    sectionsPublished,
    sectionsDraft,
    sectionsHidden,
    { count: tagsCount },
  ] = await Promise.all([
    countProducts(admin, "material", "published"),
    countProducts(admin, "material", "draft"),
    countProducts(admin, "material", "hidden"),
    countProducts(admin, "task", "published"),
    countProducts(admin, "task", "draft"),
    countProducts(admin, "task", "hidden"),
    countProducts(admin, "section", "published"),
    countProducts(admin, "section", "draft"),
    countProducts(admin, "section", "hidden"),
    admin.from("tags").select("id", { count: "exact", head: true }),
  ]);

  return {
    materialsPublished,
    materialsDraft,
    materialsHidden,
    tasksPublished,
    tasksDraft,
    tasksHidden,
    sectionsPublished,
    sectionsDraft,
    sectionsHidden,
    tagsCount: tagsCount ?? 0,
  };
}

export async function getAdminOrderSummary(): Promise<AdminOrderSummary> {
  const admin = createSupabaseAdminClient();

  const [{ count: pendingPayment }, { count: failed }, { count: cancelled }] =
    await Promise.all([
      admin
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending_payment"),
      admin.from("orders").select("id", { count: "exact", head: true }).eq("status", "failed"),
      admin
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("status", "cancelled"),
    ]);

  return {
    pendingPayment: pendingPayment ?? 0,
    failed: failed ?? 0,
    cancelled: cancelled ?? 0,
  };
}

export async function getAdminDashboardOverview(): Promise<AdminDashboardOverview> {
  const [stats, content, orders, topSales, recentOrders] = await Promise.all([
    getAdminDashboardStats(),
    getAdminContentSummary(),
    getAdminOrderSummary(),
    getAdminProductSales(),
    getAdminRecentOrders(6),
  ]);

  return {
    stats,
    content,
    orders,
    topSales: topSales.slice(0, 5),
    recentOrders,
  };
}

export async function getAdminProductSales(): Promise<AdminProductSalesRow[]> {
  const admin = createSupabaseAdminClient();

  const { data: orderItems, error } = await admin
    .from("order_items")
    .select(
      `
      product_id,
      price_kopecks,
      products!inner ( title, slug, kind ),
      orders!inner ( status )
    `,
    )
    .eq("orders.status", "paid");

  if (error) {
    throw new Error(error.message);
  }

  type Row = {
    product_id: string;
    price_kopecks: number;
    products: {
      title: string;
      slug: string;
      kind: Database["public"]["Enums"]["product_kind"];
    };
  };

  const map = new Map<string, AdminProductSalesRow>();

  for (const row of (orderItems as Row[] | null) ?? []) {
    const existing = map.get(row.product_id);

    if (existing) {
      existing.salesCount += 1;
      existing.revenueKopecks += row.price_kopecks;
      continue;
    }

    map.set(row.product_id, {
      productId: row.product_id,
      title: row.products.title,
      slug: row.products.slug,
      kind: row.products.kind,
      salesCount: 1,
      revenueKopecks: row.price_kopecks,
    });
  }

  return [...map.values()].sort((a, b) => b.revenueKopecks - a.revenueKopecks);
}

export async function getAdminRecentOrders(limit = 10): Promise<AdminRecentOrderRow[]> {
  const admin = createSupabaseAdminClient();
  const emailMap = await buildUserEmailMap(admin);

  const { data, error } = await admin
    .from("orders")
    .select("id, user_id, status, total_kopecks, created_at, entitlement_grant_error")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((order) => ({
    id: order.id,
    userId: order.user_id,
    userEmail: emailMap.get(order.user_id) ?? "—",
    status: order.status,
    totalKopecks: order.total_kopecks,
    createdAt: order.created_at,
    entitlementGrantError: order.entitlement_grant_error,
  }));
}

export async function buildUsersCsv(): Promise<string> {
  const admin = createSupabaseAdminClient();
  const emailMap = await buildUserEmailMap(admin);

  const { data, error } = await admin
    .from("profiles")
    .select("id, display_name, designer_level, role, deactivated_at, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return toCsv(
    ["id", "email", "display_name", "designer_level", "role", "deactivated_at", "created_at"],
    (data ?? []).map((row) => [
      row.id,
      emailMap.get(row.id) ?? "",
      row.display_name,
      row.designer_level,
      row.role,
      row.deactivated_at,
      row.created_at,
    ]),
  );
}

export async function buildOrdersCsv(): Promise<string> {
  const admin = createSupabaseAdminClient();
  const emailMap = await buildUserEmailMap(admin);

  const { data, error } = await admin
    .from("orders")
    .select(
      "id, user_id, status, total_kopecks, created_at, paid_at, entitlement_grant_error, payment_error",
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return toCsv(
    [
      "order_id",
      "user_email",
      "status",
      "total_kopecks",
      "created_at",
      "paid_at",
      "entitlement_grant_error",
      "payment_error",
    ],
    (data ?? []).map((row) => [
      row.id,
      emailMap.get(row.user_id) ?? "",
      row.status,
      row.total_kopecks,
      row.created_at,
      row.paid_at,
      row.entitlement_grant_error,
      row.payment_error,
    ]),
  );
}

export async function buildSalesCsv(): Promise<string> {
  const sales = await getAdminProductSales();

  return toCsv(
    ["product_id", "title", "slug", "kind", "sales_count", "revenue_kopecks"],
    sales.map((row) => [
      row.productId,
      row.title,
      row.slug,
      row.kind,
      row.salesCount,
      row.revenueKopecks,
    ]),
  );
}
