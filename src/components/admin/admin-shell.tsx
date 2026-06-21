import Link from "next/link";

import { Container } from "@/components/layout/container";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AdminShellProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
};

export function AdminShell({
  title,
  description,
  children,
  actions,
}: AdminShellProps) {
  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="space-y-1 border-b border-neutral-200 pb-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
              {description ? (
                <p className="text-sm text-neutral-600">{description}</p>
              ) : null}
            </div>
            {actions}
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}

export function AdminForbidden() {
  return (
    <Container className="py-16">
      <div className="mx-auto max-w-lg rounded-xl border border-neutral-300 bg-card px-6 py-10 text-center">
        <h1 className="text-xl font-semibold text-foreground">Нет доступа</h1>
        <p className="mt-2 text-sm leading-6 text-neutral-600">
          Эта страница доступна только пользователям с ролью{" "}
          <code>admin</code> в таблице <code>profiles</code>.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/" className={buttonVariants({ variant: "secondary" })}>
            На главную
          </Link>
          <Link href="/profile" className={buttonVariants()}>
            Профиль
          </Link>
        </div>
      </div>
    </Container>
  );
}

export function AdminAlert({
  variant,
  children,
}: {
  variant: "error" | "success";
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 text-sm",
        variant === "error"
          ? "border-destructive-border bg-destructive-bg text-destructive-foreground"
          : "border-emerald-200 bg-emerald-50 text-emerald-900",
      )}
      role={variant === "error" ? "alert" : "status"}
    >
      {children}
    </div>
  );
}

export function AdminEmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-5 py-10 text-center">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <p className="mt-2 text-sm text-neutral-600">{description}</p>
    </div>
  );
}
