import Image from "next/image";
import Link from "next/link";

import {
  InstagramIcon,
  TelegramIcon,
  VkIcon,
  YoutubeIcon,
} from "@/components/icons/social-icons";
import { Container } from "@/components/layout/container";
import { FooterNewsletter } from "@/components/layout/footer-newsletter";
import { cn } from "@/lib/utils";

const LEGAL_LINKS = [
  { href: "/requisites", label: "Реквизиты" },
  { href: "/offer", label: "Оферта" },
  { href: "/privacy", label: "Конфиденциальность" },
  { href: "/payment-and-refund", label: "Оплата и возврат" },
  { href: "/support", label: "Поддержка" },
] as const;

const PLATFORM_LINKS = [
  { href: "/catalog", label: "Материалы" },
  { href: "/tasks", label: "Задания" },
  { href: "/catalog", label: "Разделы" },
  { href: "/profile", label: "Моя библиотека" },
] as const;

const ABOUT_LINKS = [
  { href: "/#how-it-works", label: "О проекте" },
  { href: "/support", label: "Контакты" },
  { href: "/support", label: "Поддержка" },
] as const;

const SOCIAL_LINKS = [
  { label: "Telegram", Icon: TelegramIcon },
  { label: "ВКонтакте", Icon: VkIcon },
  { label: "YouTube", Icon: YoutubeIcon },
  { label: "Instagram", Icon: InstagramIcon },
] as const;

function FooterLinkGroup({
  title,
  links,
}: {
  title: string;
  links: ReadonlyArray<{ href: string; label: string }>;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={`${title}-${link.label}`}>
            <Link
              href={link.href}
              className="text-sm text-neutral-600 transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-neutral-200 bg-white">
      <Container className="py-10 md:py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div className="space-y-4 md:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Image
                src="/logo.png"
                alt=""
                width={32}
                height={32}
                className="size-8 rounded-full object-cover"
              />
              <span className="text-[15px] font-semibold tracking-tight text-neutral-900">
                Дизайн Тусовка
              </span>
            </Link>

            <p className="max-w-xs text-sm leading-5 text-neutral-600">
              Практические материалы и задания для продуктовых и UX/UI дизайнеров.
              Учитесь, решайте, создавайте.
            </p>

            <div className="flex items-center gap-2">
              {SOCIAL_LINKS.map(({ label, Icon }) => (
                <span
                  key={label}
                  title="Скоро"
                  aria-label={label}
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full text-neutral-500",
                    "cursor-default",
                  )}
                >
                  <Icon className="size-4" />
                </span>
              ))}
            </div>
          </div>

          <FooterLinkGroup title="Платформа" links={PLATFORM_LINKS} />
          <FooterLinkGroup title="О нас" links={ABOUT_LINKS} />
          <FooterNewsletter />
        </div>
      </Container>

      <div className="border-t border-neutral-200">
        <Container className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-neutral-500">© {year} Дизайн Тусовка</p>
          <nav
            className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-400"
            aria-label="Юридическая информация"
          >
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-neutral-600 hover:underline"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </Container>
      </div>
    </footer>
  );
}
