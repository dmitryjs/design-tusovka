"use client";

import { BookOpen, ClipboardList, Download } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { LibrarySection } from "@/lib/entitlements/library-sections";
import { cn } from "@/lib/utils";

type LibrarySidebarProps = {
  activeSection: LibrarySection;
  counts: Record<LibrarySection, number>;
  onSectionChange: (section: LibrarySection) => void;
  className?: string;
};

const LIBRARY_NAV_ITEMS: Array<{
  id: LibrarySection;
  label: string;
  Icon: LucideIcon;
}> = [
  { id: "materials", label: "Материалы", Icon: BookOpen },
  { id: "tasks", label: "Задачи", Icon: ClipboardList },
  { id: "downloaded", label: "Скаченные", Icon: Download },
];

export function LibrarySidebar({
  activeSection,
  counts,
  onSectionChange,
  className,
}: LibrarySidebarProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <h1 className="text-xl font-semibold text-foreground">Моя библиотека</h1>

      <nav aria-label="Разделы библиотеки">
        <ul className="space-y-1">
          {LIBRARY_NAV_ITEMS.map(({ id, label, Icon }) => {
            const active = activeSection === id;

            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => onSectionChange(id)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors",
                    active
                      ? "text-primary"
                      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
                  )}
                >
                  <Icon
                    className={cn("size-[18px] shrink-0", active && "text-primary")}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">{label}</span>
                  <span
                    className={cn(
                      "tabular-nums",
                      active ? "text-primary" : "text-neutral-500",
                    )}
                  >
                    {counts[id]}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

export function LibrarySidebarMobile({
  activeSection,
  counts,
  onSectionChange,
  className,
}: LibrarySidebarProps) {
  return (
    <nav
      className={cn("border-b border-neutral-200 bg-white px-4 py-4 lg:hidden", className)}
      aria-label="Разделы библиотеки"
    >
      <ul className="flex gap-2 overflow-x-auto pb-1">
        {LIBRARY_NAV_ITEMS.map(({ id, label, Icon }) => {
          const active = activeSection === id;

          return (
            <li key={id} className="shrink-0">
              <button
                type="button"
                onClick={() => onSectionChange(id)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-neutral-100 text-neutral-700",
                )}
              >
                <Icon className="size-4" aria-hidden />
                {label}
                <span className="tabular-nums opacity-80">{counts[id]}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
