"use client";

import { Search } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";

import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CatalogFilter, CatalogItem } from "@/lib/catalog/types";

import { CatalogCard } from "./catalog-card";

const FILTERS: Array<{ value: CatalogFilter; label: string }> = [
  { value: "all", label: "Все" },
  { value: "material", label: "Материалы" },
  { value: "task", label: "Задания" },
  { value: "section", label: "Разделы" },
];

type CatalogHomeProps = {
  initialItems: CatalogItem[];
  error: string | null;
};

function matchesSearch(item: CatalogItem, query: string): boolean {
  if (!query) {
    return true;
  }

  const haystack = `${item.title} ${item.description}`.toLowerCase();
  return haystack.includes(query);
}

export function CatalogHome({ initialItems, error }: CatalogHomeProps) {
  const [filter, setFilter] = useState<CatalogFilter>("all");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());

  const filteredItems = useMemo(() => {
    return initialItems.filter((item) => {
      const matchesFilter = filter === "all" || item.kind === filter;
      return matchesFilter && matchesSearch(item, deferredSearch);
    });
  }, [initialItems, filter, deferredSearch]);

  if (error) {
    return (
      <Container className="py-10 md:py-12 lg:py-16">
        <div className="mx-auto max-w-xl rounded-xl border border-destructive-border bg-destructive-bg px-6 py-8 text-center">
          <h1 className="text-xl font-semibold text-destructive-foreground">
            Не удалось загрузить каталог
          </h1>
          <p className="mt-2 text-sm leading-6 text-destructive-foreground/90">
            {error}
          </p>
          <p className="mt-4 text-sm text-neutral-600">
            Проверьте, что локальный Supabase запущен (
            <code className="rounded bg-white px-1 py-0.5 text-xs">
              npm run supabase:start
            </code>
            ) и переменные в{" "}
            <code className="rounded bg-white px-1 py-0.5 text-xs">
              .env.local
            </code>{" "}
            совпадают с выводом{" "}
            <code className="rounded bg-white px-1 py-0.5 text-xs">
              npm run supabase:status
            </code>
            .
          </p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-10 md:py-12 lg:py-16">
      <div className="flex flex-col gap-8">
        <section className="space-y-4">
          <Badge variant="secondary">Каталог</Badge>
          <div className="space-y-2">
            <h1 className="text-[36px] leading-[44px] font-semibold tracking-tight text-foreground">
              Дизайн Тусовка
            </h1>
            <p className="max-w-2xl text-base leading-6 text-neutral-600">
              Практические материалы и задания для product, UX/UI и
              digital-дизайнеров — из локальной базы Supabase.
            </p>
          </div>
        </section>

        <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((option) => (
              <Button
                key={option.value}
                type="button"
                size="sm"
                variant={filter === option.value ? "default" : "secondary"}
                onClick={() => setFilter(option.value)}
                aria-pressed={filter === option.value}
              >
                {option.label}
              </Button>
            ))}
          </div>

          <div className="relative w-full lg:max-w-sm">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-500"
              aria-hidden
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Поиск по названию и описанию"
              className="pl-9"
              aria-label="Поиск по каталогу"
            />
          </div>
        </section>

        {initialItems.length === 0 ? (
          <div className="rounded-xl border border-neutral-300 bg-neutral-50 px-6 py-12 text-center">
            <h2 className="text-lg font-semibold text-foreground">
              Каталог пока пуст
            </h2>
            <p className="mt-2 text-sm text-neutral-600">
              Запустите{" "}
              <code className="rounded bg-white px-1 py-0.5 text-xs">
                npm run db:reset
              </code>{" "}
              чтобы применить seed-данные.
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-xl border border-neutral-300 bg-neutral-50 px-6 py-12 text-center">
            <h2 className="text-lg font-semibold text-foreground">
              Ничего не найдено
            </h2>
            <p className="mt-2 text-sm text-neutral-600">
              Попробуйте другой запрос или сбросьте фильтр.
            </p>
            <Button
              type="button"
              variant="secondary"
              className="mt-4"
              onClick={() => {
                setFilter("all");
                setSearch("");
              }}
            >
              Сбросить фильтры
            </Button>
          </div>
        ) : (
          <section
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
            aria-live="polite"
          >
            {filteredItems.map((item) => (
              <CatalogCard key={item.id} item={item} />
            ))}
          </section>
        )}
      </div>
    </Container>
  );
}
