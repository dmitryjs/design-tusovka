import "server-only";

import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";

import { getSupabasePublicEnv } from "./env";

function missingServiceRoleKey(): never {
  throw new Error("Задайте SUPABASE_SERVICE_ROLE_KEY в .env.local (server-only)");
}

export function createSupabaseAdminClient() {
  const { url } = getSupabasePublicEnv();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    missingServiceRoleKey();
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
