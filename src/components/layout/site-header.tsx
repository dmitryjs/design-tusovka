import Link from "next/link";
import { Suspense } from "react";

import { Container } from "@/components/layout/container";
import { SiteHeaderNav } from "@/components/layout/site-header-nav";
import { getCartItemCount } from "@/lib/cart/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function SiteHeader() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const cartItemCount = user ? await getCartItemCount(supabase) : 0;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <Container className="py-3">
        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="flex w-fit shrink-0 items-center gap-2 text-base font-semibold tracking-tight text-foreground hover:text-primary"
          >
            <span
              className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground"
              aria-hidden
            >
              Т
            </span>
            <span>Дизайн Тусовка</span>
          </Link>

          <Suspense
            fallback={
              <div className="h-9 w-full max-w-sm animate-pulse rounded-lg bg-neutral-100" />
            }
          >
            <SiteHeaderNav
              isAuthenticated={Boolean(user)}
              cartItemCount={cartItemCount}
            />
          </Suspense>
        </div>
      </Container>
    </header>
  );
}
