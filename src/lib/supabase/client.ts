import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";

import { getSupabasePublicEnv } from "./env";

export function createSupabaseBrowserClient() {
  const { url, anonKey } = getSupabasePublicEnv();

  return createClient<Database>(url, anonKey);
}
