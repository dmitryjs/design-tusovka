import { Lock } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import {
  Breadcrumbs,
  type BreadcrumbItem,
} from "@/components/layout/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { formatPrice } from "@/lib/catalog/format";
import { cn } from "@/lib/utils";

type CatalogDetailShellProps = {
  breadcrumbs: BreadcrumbItem[];
  children: React.ReactNode;
  wide?: boolean;
};

export function CatalogDetailShell({
  breadcrumbs,
  children,
  wide = false,
}: CatalogDetailShellProps) {
  return (
    <Container className="py-6 md:py-8 lg:py-10">
      <div
        className={cn(
          "mx-auto flex flex-col gap-6 md:gap-8",
          wide ? "max-w-6xl" : "max-w-3xl",
        )}
      >
        <Breadcrumbs items={breadcrumbs} />
        {children}
      </div>
    </Container>
  );
}

type CatalogAccessBadgeProps = {
  priceKopecks: number;
  className?: string;
};

export function CatalogAccessBadge({
  priceKopecks,
  className,
}: CatalogAccessBadgeProps) {
  const isFree = priceKopecks === 0;

  return (
    <Badge
      variant={isFree ? "default" : "outline"}
      className={cn(
        "text-sm",
        isFree ? "bg-primary text-primary-foreground" : "text-foreground",
        className,
      )}
    >
      {formatPrice(priceKopecks)}
    </Badge>
  );
}

type CatalogDetailMetaProps = {
  kind: "material" | "task" | "section";
  badges: React.ReactNode;
  title: string;
  description?: string;
  priceKopecks: number;
};

function getAccessHint(
  kind: CatalogDetailMetaProps["kind"],
  priceKopecks: number,
): string {
  const isFree = priceKopecks === 0;

  if (kind === "material") {
    return isFree
      ? "Доступен бесплатно — полное содержание ниже."
      : "Платный материал — ниже оглавление без текста глав.";
  }

  if (kind === "task") {
    return isFree
      ? "Доступно бесплатно — бриф и требования ниже."
      : "Платное задание — описание доступно, бриф после покупки.";
  }

  return isFree
    ? "Раздел бесплатный — откройте материалы в списке ниже."
    : "Платный раздел — материалы внутри могут требовать отдельной покупки.";
}

export function CatalogDetailMeta({
  kind,
  badges,
  title,
  description,
  priceKopecks,
}: CatalogDetailMetaProps) {
  const isFree = priceKopecks === 0;
  const accessHint = getAccessHint(kind, priceKopecks);

  return (
    <header className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {badges}
        <CatalogAccessBadge priceKopecks={priceKopecks} />
      </div>
      <div className="space-y-3">
        <h1 className="text-[28px] leading-[36px] font-semibold tracking-tight text-foreground sm:text-[32px] sm:leading-[40px] md:text-[36px] md:leading-[44px]">
          {title}
        </h1>
        {description ? (
          <p className="text-base leading-6 text-neutral-600">{description}</p>
        ) : null}
      </div>
      <p
        className={cn(
          "text-sm leading-6",
          isFree ? "text-primary" : "text-neutral-500",
        )}
      >
        {accessHint}
      </p>
    </header>
  );
}

type CatalogDetailSectionProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function CatalogDetailSection({
  title,
  description,
  children,
}: CatalogDetailSectionProps) {
  return (
    <section className="space-y-4 border-t border-neutral-200 pt-8">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {description ? (
          <p className="text-sm leading-6 text-neutral-600">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

type CatalogTagListProps = {
  tags: Array<{ id: string; name: string }>;
};

export function CatalogTagList({ tags }: CatalogTagListProps) {
  if (!tags.length) {
    return null;
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium tracking-wide text-neutral-500 uppercase">
        Теги
      </p>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <Badge key={tag.id} variant="ghost" className="text-neutral-600">
            {tag.name}
          </Badge>
        ))}
      </div>
    </div>
  );
}

type CatalogPreviewNoticeProps = {
  kind: "material" | "task";
};

export function CatalogPreviewNotice({ kind }: CatalogPreviewNoticeProps) {
  const copy =
    kind === "material"
      ? {
          title: "Превью платного материала",
          body: "Ниже — оглавление глав без текста. Полное содержание откроется после покупки.",
        }
      : {
          title: "Превью платного задания",
          body: "Описание доступно, бриф и сдача работы откроются после покупки.",
        };

  return (
    <div
      className="flex gap-3 rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-4 sm:px-5"
      role="note"
    >
      <Lock
        className="mt-0.5 size-4 shrink-0 text-neutral-500"
        aria-hidden
      />
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">{copy.title}</p>
        <p className="text-sm leading-6 text-neutral-600">{copy.body}</p>
      </div>
    </div>
  );
}

type CatalogComingSoonBlockProps = {
  title: string;
  description: string;
};

export function CatalogComingSoonBlock({
  title,
  description,
}: CatalogComingSoonBlockProps) {
  return (
    <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-4 sm:px-5 sm:py-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <Badge variant="secondary">Скоро</Badge>
      </div>
      <p className="mt-2 text-sm leading-6 text-neutral-600">{description}</p>
    </div>
  );
}

type CatalogEmptyPanelProps = {
  title: string;
  description: string;
};

export function CatalogEmptyPanel({ title, description }: CatalogEmptyPanelProps) {
  return (
    <div className="rounded-xl border border-neutral-300 bg-neutral-50 px-5 py-8 text-center sm:px-6">
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-neutral-600">{description}</p>
    </div>
  );
}

export function CatalogDetailFooterCta() {
  return (
    <div className="border-t border-neutral-200 pt-8">
      <Link
        href="/catalog"
        className={cn(buttonVariants({ variant: "secondary" }), "w-full sm:w-auto")}
      >
        Вернуться в каталог
      </Link>
    </div>
  );
}
