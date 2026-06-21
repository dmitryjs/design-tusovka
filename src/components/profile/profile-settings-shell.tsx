import Link from "next/link";

import { cn } from "@/lib/utils";

type ProfileSettingsShellProps = {
  children: React.ReactNode;
  className?: string;
};

export function ProfileSettingsShell({
  children,
  className,
}: ProfileSettingsShellProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[1280px] px-4 py-6 md:px-8 md:py-8 lg:px-10 lg:py-10",
        className,
      )}
    >
      <div className="mb-6">
        <Link
          href="/profile"
          className="text-sm font-medium text-primary hover:underline"
        >
          ← К профилю
        </Link>
      </div>
      {children}
    </div>
  );
}

export function SettingsPanel({
  title,
  description,
  children,
  id,
}: {
  id?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 rounded-xl border border-neutral-200 bg-white p-5 sm:p-6"
    >
      <div className="mb-5 space-y-1">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {description ? (
          <p className="text-sm text-neutral-600">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function SettingsField({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-neutral-500">{hint}</p> : null}
    </div>
  );
}
