import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CatalogErrorStateProps = {
  title?: string;
  message: string;
};

export function CatalogErrorState({
  title = "Не удалось загрузить страницу",
  message,
}: CatalogErrorStateProps) {
  return (
    <Container className="py-6 md:py-8 lg:py-10">
      <div className="mx-auto flex max-w-xl flex-col gap-6">
        <Breadcrumbs
          items={[
            { label: "Главная", href: "/" },
            { label: "Каталог", href: "/catalog" },
            { label: "Ошибка" },
          ]}
        />
        <div className="rounded-xl border border-destructive-border bg-destructive-bg px-5 py-8 text-center sm:px-6">
          <h1 className="text-xl font-semibold text-destructive-foreground">
            {title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-destructive-foreground/90">
            {message}
          </p>
          <Link
            href="/catalog"
            className={cn(
              buttonVariants({ variant: "secondary" }),
              "mt-6 inline-flex w-full sm:w-auto",
            )}
          >
            Вернуться в каталог
          </Link>
        </div>
      </div>
    </Container>
  );
}

export function CatalogNotFoundState() {
  return (
    <Container className="py-6 md:py-8 lg:py-10">
      <div className="mx-auto flex max-w-xl flex-col gap-6">
        <Breadcrumbs
          items={[
            { label: "Главная", href: "/" },
            { label: "Каталог", href: "/catalog" },
            { label: "Не найдено" },
          ]}
        />
        <div className="rounded-xl border border-neutral-300 bg-neutral-50 px-5 py-8 text-center sm:px-6">
          <h1 className="text-xl font-semibold text-foreground">
            Страница не найдена
          </h1>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            Возможно, материал снят с публикации или ссылка устарела.
          </p>
          <Link
            href="/catalog"
            className={cn(
              buttonVariants({ variant: "secondary" }),
              "mt-6 inline-flex w-full sm:w-auto",
            )}
          >
            Вернуться в каталог
          </Link>
        </div>
      </div>
    </Container>
  );
}
