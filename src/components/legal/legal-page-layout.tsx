import Link from "next/link";

import { PageHero, PageShell } from "@/components/layout/page-shell";
import { SELLER_INFO } from "@/lib/legal/seller-info";
import { cn } from "@/lib/utils";

type LegalPageLayoutProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  draftNotice?: string;
};

export function LegalPageLayout({
  title,
  description,
  children,
  draftNotice,
}: LegalPageLayoutProps) {
  return (
    <PageShell breadcrumbs={[{ label: "Главная", href: "/" }, { label: title }]}>
      <PageHero
        title={title}
        description={description ?? "Информация для пользователей сервиса «Дизайн Тусовка»."}
      />
      <div className="mx-auto max-w-3xl space-y-8">
        {draftNotice ? (
          <p
            className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
            role="note"
          >
            {draftNotice}
          </p>
        ) : null}
        <div className={cn("space-y-8 text-sm leading-6 text-neutral-700")}>{children}</div>
      </div>
    </PageShell>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export function LegalPlaceholder({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-xs text-neutral-600">
      {children}
    </span>
  );
}

export function LegalMailto() {
  return (
    <a
      href={`mailto:${SELLER_INFO.supportEmail}`}
      className="text-neutral-800 underline-offset-2 hover:underline"
    >
      {SELLER_INFO.supportEmail}
    </a>
  );
}

export function LegalSiteLink({ href }: { href: string }) {
  return (
    <a href={href} className="text-neutral-800 underline-offset-2 hover:underline">
      {href}
    </a>
  );
}

export function LegalInternalLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="text-neutral-800 underline-offset-2 hover:underline">
      {children}
    </Link>
  );
}

export function LegalAddress() {
  const address = SELLER_INFO.legalAddress;
  if (address) {
    return <>{address}</>;
  }
  return <LegalPlaceholder>адрес регистрации ИП — указать в seller-info.ts</LegalPlaceholder>;
}
