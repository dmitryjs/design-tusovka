"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

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
      className={cn("relative w-[320px] shrink-0", className)}
      onSubmit={(event) => {
        event.preventDefault();
        submitSearch();
      }}
      role="search"
    >
      <Search
        className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-neutral-400"
        aria-hidden
      />
      <input
        key={`${pathname}-${queryFromUrl}`}
        type="search"
        value={value}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Поиск материалов, тем, авторов..."
        aria-label="Поиск материалов, тем, авторов"
        className="h-10 w-full rounded-md border border-neutral-200 bg-white pr-4 pl-10 text-sm text-foreground transition-colors outline-none placeholder:text-neutral-400 hover:border-neutral-300 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-blue-100"
      />
    </form>
  );
}
