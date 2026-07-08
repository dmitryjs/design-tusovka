"use client";

import { ArrowLeft, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { HeaderIconButton } from "@/components/layout/header-icon-button";
import { cn } from "@/lib/utils";

type HeaderSearchProps = {
  className?: string;
};

function resolveSearchPath(pathname: string): "/" | "/tasks" {
  return pathname.startsWith("/tasks") ? "/tasks" : "/";
}

export function HeaderSearch({ className }: HeaderSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryFromUrl = searchParams.get("q") ?? "";
  const titleId = useId();

  const [draft, setDraft] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  const value = draft ?? queryFromUrl;

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    mobileInputRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen]);

  function submitSearch(nextValue = value) {
    const trimmed = nextValue.trim();
    const searchPath = resolveSearchPath(pathname);

    setMobileOpen(false);

    if (!trimmed) {
      setDraft("");
      if (pathname === searchPath || searchParams.has("q")) {
        router.push(searchPath);
      }
      return;
    }

    setDraft(null);
    router.push(`${searchPath}?q=${encodeURIComponent(trimmed)}`);
  }

  const mobileOverlay =
    portalReady && mobileOpen
      ? createPortal(
          <div
            className="fixed inset-0 z-[100] flex flex-col bg-white lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
          >
            <div className="flex h-14 shrink-0 items-center gap-2 border-b border-neutral-200 px-3">
              <HeaderIconButton
                label="Назад"
                onClick={() => setMobileOpen(false)}
              >
                <ArrowLeft className="size-[18px]" strokeWidth={1.75} />
              </HeaderIconButton>
              <h2 id={titleId} className="sr-only">
                Поиск
              </h2>
              <form
                className="relative min-w-0 flex-1"
                role="search"
                onSubmit={(event) => {
                  event.preventDefault();
                  submitSearch();
                }}
              >
                <Search
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400"
                  aria-hidden
                />
                <input
                  ref={mobileInputRef}
                  type="search"
                  value={value}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Поиск материалов и заданий..."
                  aria-label="Поиск материалов и заданий"
                  enterKeyHint="search"
                  autoComplete="off"
                  className="h-10 w-full rounded-lg border border-neutral-200 bg-neutral-50 pr-3 pl-10 text-base text-foreground outline-none placeholder:text-neutral-400 focus-visible:border-primary focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-blue-100"
                />
              </form>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6">
              <p className="text-sm leading-6 text-neutral-500">
                Введите запрос и нажмите «Найти» на клавиатуре. Результаты
                откроются в материалах или заданиях.
              </p>
              {value.trim() ? (
                <button
                  type="button"
                  className="mt-6 w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground"
                  onClick={() => submitSearch()}
                >
                  Искать «{value.trim()}»
                </button>
              ) : null}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <HeaderIconButton
        label="Поиск"
        className={cn("lg:hidden", className)}
        onClick={() => {
          setDraft(queryFromUrl);
          setMobileOpen(true);
        }}
      >
        <Search className="size-[18px]" strokeWidth={1.75} />
      </HeaderIconButton>

      <form
        className={cn("relative hidden w-[280px] shrink-0 xl:w-[320px] lg:block", className)}
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

      {mobileOverlay}
    </>
  );
}
