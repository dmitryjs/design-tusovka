import "server-only";

import { getUserLibrary } from "@/lib/entitlements/library";
import { getUserOrders } from "@/lib/cart/orders";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { getDaysOnPlatform } from "./format";
import type {
  ProfileDashboardData,
  ProfileData,
  ProfileRow,
  ProfileSettingsData,
  ProfileStats,
} from "./types";

type ServerSupabase = Awaited<ReturnType<typeof createSupabaseServerClient>>;

export async function getProfileData(
  supabase?: ServerSupabase,
): Promise<ProfileData | null> {
  const client = supabase ?? (await createSupabaseServerClient());

  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile, error } = await client
    .from("profiles")
    .select(
      "display_name, avatar_path, telegram_username, designer_level, created_at, role",
    )
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile) {
    return null;
  }

  return {
    user,
    profile: profile as ProfileRow,
  };
}

function buildProfileStats(
  materialsCount: number,
  tasksCount: number,
  ordersCount: number,
  createdAt: string,
): ProfileStats {
  return {
    materialsCount,
    tasksCount,
    ordersCount,
    daysOnPlatform: getDaysOnPlatform(createdAt),
  };
}

export async function getProfileDashboardData(
  supabase?: ServerSupabase,
): Promise<ProfileDashboardData | null> {
  const client = supabase ?? (await createSupabaseServerClient());
  const profileData = await getProfileData(client);

  if (!profileData) {
    return null;
  }

  const [libraryResult, ordersResult] = await Promise.all([
    getUserLibrary(client),
    getUserOrders(client),
  ]);

  const materials = libraryResult.items.filter((item) => item.kind === "material");
  const tasks = libraryResult.items.filter((item) => item.kind === "task");

  return {
    profile: profileData,
    stats: buildProfileStats(
      materials.length,
      tasks.length,
      ordersResult.orders.length,
      profileData.profile.created_at,
    ),
    materials: materials.slice(0, 3),
    tasks: tasks.slice(0, 3),
    libraryError: libraryResult.error,
  };
}

export async function getProfileSettingsData(
  supabase?: ServerSupabase,
): Promise<ProfileSettingsData | null> {
  const client = supabase ?? (await createSupabaseServerClient());
  const profileData = await getProfileData(client);

  if (!profileData) {
    return null;
  }

  return {
    profile: profileData,
    emailConfirmed: Boolean(profileData.user.email_confirmed_at),
  };
}
