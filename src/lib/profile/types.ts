import type { User } from "@supabase/supabase-js";

import type { LibraryItem } from "@/lib/entitlements/types";
import type { Database } from "@/types/database.types";

export type ProfileRow = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  | "display_name"
  | "avatar_path"
  | "telegram_username"
  | "designer_level"
  | "created_at"
  | "role"
>;

export type ProfileData = {
  user: User;
  profile: ProfileRow;
};

export type ProfileStats = {
  materialsCount: number;
  tasksCount: number;
  ordersCount: number;
  daysOnPlatform: number;
};

export type ProfileDashboardData = {
  profile: ProfileData;
  stats: ProfileStats;
  materials: LibraryItem[];
  tasks: LibraryItem[];
  libraryError: string | null;
};

export type ProfileSettingsData = {
  profile: ProfileData;
  emailConfirmed: boolean;
};
