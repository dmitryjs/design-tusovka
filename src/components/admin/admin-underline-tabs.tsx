"use client";

import { cn } from "@/lib/utils";

export type AdminUnderlineTab<T extends string> = {
  id: T;
  label: string;
};

type AdminUnderlineTabsProps<T extends string> = {
  tabs: AdminUnderlineTab<T>[];
  activeTab: T;
  onChange: (tab: T) => void;
  className?: string;
};

export function AdminUnderlineTabs<T extends string>({
  tabs,
  activeTab,
  onChange,
  className,
}: AdminUnderlineTabsProps<T>) {
  return (
    <div className={cn("flex gap-4 border-b border-neutral-200 text-sm", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "pb-2 font-medium transition-colors",
            activeTab === tab.id
              ? "border-b-2 border-foreground text-foreground"
              : "text-neutral-500 hover:text-foreground",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
