import Link from "next/link";

import { Container } from "@/components/layout/container";

const LEGAL_LINKS = [
  { href: "/requisites", label: "Реквизиты" },
  { href: "/offer", label: "Оферта" },
  { href: "/privacy", label: "Конфиденциальность" },
  { href: "/payment-and-refund", label: "Оплата и возврат" },
  { href: "/support", label: "Поддержка" },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card">
      <Container className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">Дизайн Тусовка · {year}</p>
        <nav
          className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-400"
          aria-label="Юридическая информация"
        >
          {LEGAL_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-neutral-600 hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </Container>
    </footer>
  );
}
