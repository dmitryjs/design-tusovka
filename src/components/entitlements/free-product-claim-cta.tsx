"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { claimFreeProductAction } from "@/app/actions/entitlements";
import { Button, buttonVariants } from "@/components/ui/button";
import type { FreeProductClaimState } from "@/lib/entitlements/types";
import { cn } from "@/lib/utils";

type FreeProductClaimCtaProps = {
  slug: string;
  kind: "material" | "task";
  initialState: Exclude<FreeProductClaimState, "hidden">;
  signInReturnPath: string;
  className?: string;
};

export function FreeProductClaimCta({
  slug,
  kind,
  initialState,
  signInReturnPath,
  className,
}: FreeProductClaimCtaProps) {
  const [state, setState] = useState(initialState);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (state === "guest") {
    return (
      <div className={cn("space-y-2", className)}>
        <Link
          href={`/auth/sign-in?next=${encodeURIComponent(signInReturnPath)}`}
          className={cn(buttonVariants(), "w-full sm:w-auto")}
        >
          Войти, чтобы сохранить
        </Link>
      </div>
    );
  }

  if (state === "claimed") {
    return (
      <div className={cn("space-y-2", className)}>
        <Button type="button" variant="secondary" disabled className="w-full sm:w-auto">
          Уже в библиотеке
        </Button>
        <p className="text-sm text-neutral-600">
          Продукт сохранён в{" "}
          <Link href="/profile/library" className="font-medium text-primary hover:underline">
            Моей библиотеке
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Button
        type="button"
        disabled={isPending}
        className="w-full sm:w-auto"
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await claimFreeProductAction(slug, kind);

            if (result.ok) {
              setState("claimed");
              return;
            }

            if (result.code === "unauthenticated") {
              setState("guest");
            }

            setError(result.message ?? "Не удалось сохранить продукт.");
          });
        }}
      >
        {isPending ? "Сохраняем…" : "Получить бесплатно"}
      </Button>
      {error ? (
        <p className="text-sm text-destructive-foreground" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
