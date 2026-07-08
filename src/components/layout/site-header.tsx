import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { Container } from "@/components/layout/container";
import { SiteHeaderNav } from "@/components/layout/site-header-nav";
import { getCart } from "@/lib/cart/queries";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function SiteHeader() {
  let cartItems: Awaited<ReturnType<typeof getCart>>["items"] = [];
  let cartItemCount = 0;

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const cart = await getCart(supabase);
      cartItems = cart.items;
      cartItemCount = cart.items.length;
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white">
      <Container className="px-4 md:px-6 lg:px-8">
        <div className="flex h-14 items-center gap-3 overflow-hidden sm:gap-4 lg:gap-6">
          <Link
            href="/"
            className="flex min-w-0 shrink-0 items-center gap-2.5 text-[15px] font-semibold tracking-tight text-neutral-900"
          >
            <Image
              src="/logo.png"
              alt=""
              width={32}
              height={32}
              className="size-8 rounded-full object-cover"
              priority
            />
            <span className="hidden truncate sm:inline">Дизайн Тусовка</span>
          </Link>

          <Suspense
            fallback={
              <div className="ml-auto flex h-9 w-28 shrink-0 items-center justify-end gap-1">
                <div className="size-9 animate-pulse rounded-full bg-neutral-100" />
                <div className="size-9 animate-pulse rounded-full bg-neutral-100" />
                <div className="size-9 animate-pulse rounded-full bg-neutral-100" />
              </div>
            }
          >
            <SiteHeaderNav cartItemCount={cartItemCount} cartItems={cartItems} />
          </Suspense>
        </div>
      </Container>
    </header>
  );
}
