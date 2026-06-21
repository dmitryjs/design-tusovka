"use client";

import { useMemo, useState } from "react";

import { LibraryEmptyState } from "@/components/entitlements/library-empty-state";
import { LibraryList } from "@/components/entitlements/library-list";
import { LibraryPageShell } from "@/components/entitlements/library-page-shell";
import {
  LibrarySidebar,
  LibrarySidebarMobile,
} from "@/components/entitlements/library-sidebar";
import {
  countLibrarySections,
  filterLibraryBySection,
  type LibrarySection,
} from "@/lib/entitlements/library-sections";
import type { LibraryItem } from "@/lib/entitlements/types";

const SECTION_EMPTY_COPY: Record<
  LibrarySection,
  { title: string; description: string }
> = {
  materials: {
    title: "Нет материалов",
    description:
      "Купленные и бесплатные материалы появятся здесь после покупки или получения.",
  },
  tasks: {
    title: "Нет задач",
    description:
      "Задания из библиотеки появятся здесь после покупки или первой отправки решения.",
  },
  downloaded: {
    title: "Нет скаченных материалов",
    description:
      "Здесь будут материалы с файлами, которые вы скачали на устройство.",
  },
};

const ERROR_COPY = {
  title: "Не удалось загрузить библиотеку",
  description: "Попробуйте обновить страницу позже.",
};

type LibraryWorkspaceProps = {
  items: LibraryItem[];
  error: string | null;
  initialSection?: LibrarySection;
};

export function LibraryWorkspace({
  items,
  error,
  initialSection = "materials",
}: LibraryWorkspaceProps) {
  const [activeSection, setActiveSection] = useState<LibrarySection>(initialSection);

  const counts = useMemo(() => countLibrarySections(items), [items]);

  const filteredItems = useMemo(
    () => filterLibraryBySection(items, activeSection),
    [items, activeSection],
  );

  const emptyCopy = SECTION_EMPTY_COPY[activeSection];

  return (
    <>
      <LibrarySidebarMobile
        activeSection={activeSection}
        counts={counts}
        onSectionChange={setActiveSection}
      />

      <LibraryPageShell
        breadcrumbs={[
          { label: "Главная", href: "/" },
          { label: "Профиль", href: "/profile" },
          { label: "Моя библиотека" },
        ]}
        sidebar={
          <LibrarySidebar
            activeSection={activeSection}
            counts={counts}
            onSectionChange={setActiveSection}
          />
        }
      >
        {error ? (
          <LibraryEmptyState
            title={ERROR_COPY.title}
            description={error || ERROR_COPY.description}
          />
        ) : filteredItems.length === 0 ? (
          <LibraryEmptyState
            title={emptyCopy.title}
            description={emptyCopy.description}
          />
        ) : (
          <LibraryList items={filteredItems} />
        )}
      </LibraryPageShell>
    </>
  );
}
