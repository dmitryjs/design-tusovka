import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/types/database.types";

import { getAuthRedirectOrigin } from "@/lib/site-url";

import { getSupabasePublicEnv } from "./env";

export function createSupabaseBrowserClient() {
  const { url, anonKey } = getSupabasePublicEnv();

  return createBrowserClient<Database>(url, anonKey);
}

export { getAuthRedirectOrigin };
