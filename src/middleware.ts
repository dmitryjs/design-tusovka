import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/types/database.types";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return response;
  }

  try {
    const supabase = createServerClient<Database>(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: {
          name: string;
          value: string;
          options: CookieOptions;
        }[]) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }

          response = NextResponse.next({ request });

          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    });

    const { error } = await supabase.auth.getUser();

    // Stale/expired refresh token must not block every page request.
    if (
      error &&
      (error.code === "refresh_token_not_found" ||
        error.message.toLowerCase().includes("refresh token"))
    ) {
      const cleared = NextResponse.next({ request });
      for (const cookie of request.cookies.getAll()) {
        if (
          cookie.name.includes("sb-") &&
          (cookie.name.includes("auth-token") ||
            cookie.name.includes("refresh-token") ||
            cookie.name.includes("code-verifier"))
        ) {
          cleared.cookies.set(cookie.name, "", {
            path: "/",
            maxAge: 0,
          });
        }
      }
      return cleared;
    }
  } catch {
    // Network / Supabase outage: do not fail the page shell.
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
