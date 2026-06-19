import Link from "next/link";

import { Container } from "@/components/layout/container";
import {
  Breadcrumbs,
  type BreadcrumbItem,
} from "@/components/layout/breadcrumbs";
import { cn } from "@/lib/utils";

type PageShellProps = {
  breadcrumbs: BreadcrumbItem[];
  children: React.ReactNode;
  className?: string;
};

export function PageShell({ breadcrumbs, children, className }: PageShellProps) {
  return (
    <Container className={cn("py-6 md:py-8 lg:py-10", className)}>
      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:gap-8">
        <Breadcrumbs items={breadcrumbs} />
        {children}
      </div>
    </Container>
  );
}

type PageHeroProps = {
  title: string;
  description: string;
  children?: React.ReactNode;
};

export function PageHero({ title, description, children }: PageHeroProps) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-neutral-50 px-5 py-6 sm:px-8 sm:py-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl space-y-3">
          <h1 className="text-[28px] leading-[36px] font-semibold tracking-tight text-foreground sm:text-[32px] sm:leading-[40px] md:text-[36px] md:leading-[44px]">
            {title}
          </h1>
          <p className="text-base leading-6 text-neutral-600">{description}</p>
        </div>
        {children ? <div className="shrink-0">{children}</div> : null}
      </div>
    </section>
  );
}

export function PageSection({
  id,
  title,
  titleIcon,
  action,
  children,
}: {
  id?: string;
  title?: string;
  titleIcon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="space-y-4 scroll-mt-24">
      {title || action ? (
        <div
          className={cn(
            "flex items-center gap-4",
            title ? "justify-between" : "justify-end",
          )}
        >
          {title ? (
            <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
              {titleIcon}
              {title}
            </h2>
          ) : null}
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function PageSectionLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="text-sm font-medium text-primary hover:underline">
      {children}
    </Link>
  );
}
