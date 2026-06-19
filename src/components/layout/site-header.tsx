import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { Container } from "@/components/layout/container";
import { SiteHeaderNav } from "@/components/layout/site-header-nav";
import { getCartItemCount } from "@/lib/cart/queries";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function SiteHeader() {
  let isAuthenticated = false;
  let profileInitial: string | null = null;
  let cartItemCount = 0;

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    isAuthenticated = Boolean(user);

    if (user?.email) {
      profileInitial = user.email[0]?.toUpperCase() ?? null;
    }

    cartItemCount = user ? await getCartItemCount(supabase) : 0;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white">
      <Container className="px-4 md:px-6 lg:px-8">
        <div className="flex h-14 items-center gap-4 lg:gap-6">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2.5 text-[15px] font-semibold tracking-tight text-neutral-900"
          >
            <Image
              src="/logo.png"
              alt=""
              width={32}
              height={32}
              className="size-8 rounded-full object-cover"
              priority
            />
            <span className="hidden sm:inline">Дизайн Тусовка</span>
          </Link>

          <Suspense
            fallback={
              <div className="ml-auto h-10 w-[320px] shrink-0 animate-pulse rounded-md bg-neutral-100" />
            }
          >
            <SiteHeaderNav
              isAuthenticated={isAuthenticated}
              profileInitial={profileInitial}
              cartItemCount={cartItemCount}
            />
          </Suspense>
        </div>
      </Container>
    </header>
  );
}
