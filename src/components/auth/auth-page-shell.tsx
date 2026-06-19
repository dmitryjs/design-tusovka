import Link from "next/link";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";

type AuthPageShellProps = {
  title: string;
  description: string;
  breadcrumbLabel: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function AuthPageShell({
  title,
  description,
  breadcrumbLabel,
  children,
  footer,
}: AuthPageShellProps) {
  return (
    <Container className="py-6 md:py-8 lg:py-10">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-12">
        <div className="flex flex-col gap-6">
          <Breadcrumbs
            items={[
              { label: "Главная", href: "/" },
              { label: breadcrumbLabel },
            ]}
          />
          <div className="space-y-2">
            <Badge variant="secondary">Аккаунт</Badge>
            <h1 className="text-[28px] leading-[36px] font-semibold tracking-tight text-foreground">
              {title}
            </h1>
            <p className="text-sm leading-6 text-neutral-600">{description}</p>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-card p-5 sm:p-6">
            {children}
          </div>

          {footer ? (
            <div className="border-t border-neutral-200 pt-4 text-sm text-neutral-600">
              {footer}
            </div>
          ) : null}
        </div>

        <aside className="hidden rounded-2xl border border-neutral-200 bg-neutral-50 p-6 lg:block">
          <p className="text-sm font-semibold text-foreground">
            Дизайн Тусовка
          </p>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            Сохраняйте прогресс, отправляйте задания и возвращайтесь к
            материалам с любого устройства.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-neutral-600">
            <li>• Практические материалы и гайды</li>
            <li>• Задания с брифом и превью</li>
            <li>• Библиотека полученных материалов</li>
          </ul>
        </aside>
      </div>
    </Container>
  );
}

type AuthFormMessageProps = {
  message: string;
  variant?: "error" | "success";
};

export function AuthFormMessage({
  message,
  variant = "error",
}: AuthFormMessageProps) {
  return (
    <p
      role="alert"
      className={
        variant === "error"
          ? "rounded-lg border border-destructive-border bg-destructive-bg px-3 py-2 text-sm text-destructive-foreground"
          : "rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm text-neutral-700"
      }
    >
      {message}
    </p>
  );
}

type AuthFormFieldProps = {
  id: string;
  label: string;
  children: React.ReactNode;
  hint?: string;
};

export function AuthFormField({ id, label, children, hint }: AuthFormFieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-neutral-500">{hint}</p> : null}
    </div>
  );
}

export function AuthFormFooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="font-medium text-primary hover:underline">
      {children}
    </Link>
  );
}