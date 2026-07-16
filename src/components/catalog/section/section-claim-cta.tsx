"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { claimFreeProductAction } from "@/app/actions/entitlements";
import { Button, buttonVariants } from "@/components/ui/button";
import type { FreeProductClaimState } from "@/lib/entitlements/types";
import { cn } from "@/lib/utils";

type SectionClaimCtaProps = {
  slug: string;
  initialState: Exclude<FreeProductClaimState, "hidden">;
  signInReturnPath: string;
  className?: string;
};

export function SectionClaimCta({
  slug,
  initialState,
  signInReturnPath,
  className,
}: SectionClaimCtaProps) {
  const router = useRouter();
  const [state, setState] = useState(initialState);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (state === "guest") {
    return (
      <div className={cn("space-y-2", className)}>
        <Link
          href={`/auth/sign-in?next=${encodeURIComponent(signInReturnPath)}`}
          className={cn(
            buttonVariants(),
            "inline-flex h-10 w-full items-center justify-center",
          )}
        >
          Войти, чтобы добавить
        </Link>
      </div>
    );
  }

  if (state === "claimed") {
    return (
      <div className={cn("space-y-2", className)}>
        <Button type="button" variant="secondary" disabled className="w-full">
          Уже в библиотеке
        </Button>
        <p className="text-sm text-neutral-900">
          Материалы в{" "}
          <Link href="/profile/library" className="font-medium text-primary hover:underline">
            Моей библиотеке
          </Link>
          — можно начинать изучать.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Button
        type="button"
        disabled={isPending}
        className="w-full"
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await claimFreeProductAction(slug, "section");

            if (result.ok) {
              setState("claimed");
              router.refresh();
              return;
            }

            if (result.code === "unauthenticated") {
              setState("guest");
            }

            setError(result.message ?? "Не удалось добавить в библиотеку.");
          });
        }}
      >
        {isPending ? "Добавляем…" : "Добавить в библиотеку"}
      </Button>
      {error ? (
        <p className="text-sm text-destructive-foreground" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
