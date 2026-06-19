import "server-only";

import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database.types";

import { getCurrentUser } from "./session";

export type AdminContext = {
  user: User;
  role: Database["public"]["Enums"]["profile_role"];
};

export async function getAdminRole(
  userId: string,
): Promise<Database["public"]["Enums"]["profile_role"] | null> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data.role;
}

export async function isAdminUser(userId: string): Promise<boolean> {
  const role = await getAdminRole(userId);
  return role === "admin";
}

export async function requireAdmin(
  signInNext = "/admin",
): Promise<AdminContext> {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/auth/sign-in?next=${encodeURIComponent(signInNext)}`);
  }

  const role = await getAdminRole(user.id);

  if (role !== "admin") {
    return { user, role: role ?? "user" };
  }

  return { user, role };
}

export async function assertAdmin(): Promise<AdminContext> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("UNAUTHENTICATED");
  }

  const role = await getAdminRole(user.id);

  if (role !== "admin") {
    throw new Error("FORBIDDEN");
  }

  return { user, role };
}
