import Link from "next/link";

import { cn } from "@/lib/utils";

type HeaderIconButtonProps = {
  children: React.ReactNode;
  className?: string;
  label: string;
  href?: string;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type" | "children">;

export function HeaderIconButton({
  children,
  className,
  label,
  href,
  ...buttonProps
}: HeaderIconButtonProps) {
  const classes = cn(
    "relative flex size-9 shrink-0 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900",
    className,
  );

  if (href) {
    return (
      <Link href={href} aria-label={label} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" aria-label={label} className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
