"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type HeaderSearchProps = {
  className?: string;
};

export function HeaderSearch({ className }: HeaderSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryFromUrl = searchParams.get("q") ?? "";

  const [draft, setDraft] = useState<string | null>(null);
  const value = draft ?? queryFromUrl;

  function submitSearch() {
    const trimmed = value.trim();
    const searchPath = pathname.startsWith("/tasks") ? "/tasks" : "/catalog";

    if (!trimmed) {
      if (pathname === searchPath) {
        router.push(searchPath);
      }
      setDraft("");
      return;
    }

    setDraft(null);
    router.push(`${searchPath}?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form
      className={cn("relative w-full", className)}
      onSubmit={(event) => {
        event.preventDefault();
        submitSearch();
      }}
      role="search"
    >
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-500"
        aria-hidden
      />
      <Input
        key={`${pathname}-${queryFromUrl}`}
        value={value}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Поиск по материалам и заданиям"
        className="h-9 pl-9"
        aria-label="Поиск по материалам и заданиям"
      />
    </form>
  );
}
