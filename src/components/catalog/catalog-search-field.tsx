"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type CatalogSearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function CatalogSearchField({
  value,
  onChange,
  placeholder = "Поиск материалов...",
  className,
}: CatalogSearchFieldProps) {
  return (
    <div className={cn("relative min-w-0 flex-1", className)}>
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-500"
        aria-hidden
      />
      <Input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="border-transparent bg-neutral-100 pl-9 hover:border-neutral-200 focus-visible:border-primary"
      />
    </div>
  );
}
